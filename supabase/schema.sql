create extension if not exists "pgcrypto";

-- ============================================================
-- PRODUCTS
-- ============================================================

create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),

    slug text not null unique,

    name text not null,

    description text not null,

    price integer not null check (price >= 0),

    image_url text not null,

    category text not null,

    stock integer not null default 0
        check (stock >= 0),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- ORDERS
-- ============================================================

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    customer_name text not null,

    email text not null,

    phone text not null,

    address text not null,

    total integer not null
        check (total >= 0),

    status text not null default 'pending'
        check (
            status in (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            )
        ),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- ORDER ITEMS
-- ============================================================

create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),

    order_id uuid not null
        references public.orders(id)
        on delete cascade,

    product_id uuid not null
        references public.products(id)
        on delete restrict,

    product_name text not null,

    unit_price integer not null
        check (unit_price >= 0),

    quantity integer not null
        check (quantity > 0),

    subtotal integer not null
        check (subtotal >= 0),

    created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists products_category_idx
on public.products(category);

create index if not exists products_created_at_idx
on public.products(created_at desc);

create index if not exists orders_user_id_idx
on public.orders(user_id);

create index if not exists orders_created_at_idx
on public.orders(created_at desc);

create index if not exists order_items_order_id_idx
on public.order_items(order_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.products enable row level security;

alter table public.orders enable row level security;

alter table public.order_items enable row level security;


-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

drop policy if exists "Products are publicly readable"
on public.products;

create policy "Products are publicly readable"
on public.products
for select
to anon, authenticated
using (true);


-- ============================================================
-- ORDERS POLICIES
-- ============================================================

drop policy if exists "Users can read their own orders"
on public.orders;

create policy "Users can read their own orders"
on public.orders
for select
to authenticated
using (
    auth.uid() = user_id
);


-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

drop policy if exists "Users can read their own order items"
on public.order_items;

create policy "Users can read their own order items"
on public.order_items
for select
to authenticated
using (
    exists (
        select 1
        from public.orders
        where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
);


-- ============================================================
-- ORDER CREATION FUNCTION
-- ============================================================

create or replace function public.create_order(
    p_items jsonb,
    p_customer_name text,
    p_phone text,
    p_address text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id uuid;
    v_email text;
    v_order_id uuid;
    v_total integer := 0;

    v_item jsonb;

    v_product_id uuid;
    v_quantity integer;
    v_product_name text;
    v_product_price integer;
    v_stock integer;
    v_subtotal integer;
begin

    -- --------------------------------------------------------
    -- Authentication check
    -- --------------------------------------------------------

    v_user_id := auth.uid();

    if v_user_id is null then
        raise exception 'You must be signed in to place an order.';
    end if;


    -- --------------------------------------------------------
    -- Basic validation
    -- --------------------------------------------------------

    if trim(p_customer_name) = '' then
        raise exception 'Customer name is required.';
    end if;

    if trim(p_phone) = '' then
        raise exception 'Phone number is required.';
    end if;

    if trim(p_address) = '' then
        raise exception 'Delivery address is required.';
    end if;

    if p_items is null or jsonb_typeof(p_items) <> 'array' then
        raise exception 'Cart items must be provided as a list.';
    end if;

    if jsonb_array_length(p_items) = 0 then
        raise exception 'Your cart is empty.';
    end if;


    -- --------------------------------------------------------
    -- Get authenticated email
    -- --------------------------------------------------------

    select email
    into v_email
    from auth.users
    where id = v_user_id;


    if v_email is null then
        raise exception 'Unable to determine account email.';
    end if;


    -- --------------------------------------------------------
    -- Create temporary order
    -- --------------------------------------------------------

    insert into public.orders (
        user_id,
        customer_name,
        email,
        phone,
        address,
        total,
        status
    )
    values (
        v_user_id,
        trim(p_customer_name),
        v_email,
        trim(p_phone),
        trim(p_address),
        0,
        'pending'
    )
    returning id into v_order_id;


    -- --------------------------------------------------------
    -- Process every cart item
    -- --------------------------------------------------------

    for v_item in
        select *
        from jsonb_array_elements(p_items)
    loop

        v_product_id :=
            (v_item->>'product_id')::uuid;

        v_quantity :=
            (v_item->>'quantity')::integer;


        if v_quantity <= 0 then
            raise exception 'Invalid product quantity.';
        end if;


        -- Lock the product row while processing.
        select
            name,
            price,
            stock
        into
            v_product_name,
            v_product_price,
            v_stock
        from public.products
        where id = v_product_id
        for update;


        if not found then
            raise exception 'One of the selected products no longer exists.';
        end if;


        if v_stock < v_quantity then
            raise exception
                'Not enough stock available for %.',
                v_product_name;
        end if;


        v_subtotal :=
            v_product_price * v_quantity;


        v_total :=
            v_total + v_subtotal;


        insert into public.order_items (
            order_id,
            product_id,
            product_name,
            unit_price,
            quantity,
            subtotal
        )
        values (
            v_order_id,
            v_product_id,
            v_product_name,
            v_product_price,
            v_quantity,
            v_subtotal
        );


        update public.products
        set
            stock = stock - v_quantity,
            updated_at = now()
        where id = v_product_id;

    end loop;


    -- --------------------------------------------------------
    -- Finalise order total
    -- --------------------------------------------------------

    update public.orders
    set
        total = v_total,
        updated_at = now()
    where id = v_order_id;


    return v_order_id;

exception
    when others then

        -- If anything fails, PostgreSQL rolls back
        -- the entire transaction automatically.

        raise;
end;
$$;


-- ============================================================
-- FUNCTION SECURITY
-- ============================================================

revoke all
on function public.create_order(
    jsonb,
    text,
    text,
    text
)
from public;

grant execute
on function public.create_order(
    jsonb,
    text,
    text,
    text
)
to authenticated;


-- ============================================================
-- SEED PRODUCTS
-- ============================================================

insert into public.products (
    slug,
    name,
    description,
    price,
    image_url,
    category,
    stock
)
values

(
    'arc-desk-lamp',
    'Arc Desk Lamp',
    'A compact architectural lamp for focused work.',
    85000,
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85',
    'Desk',
    12
),

(
    'linen-carry-tote',
    'Linen Carry Tote',
    'A structured everyday tote made for light daily carry.',
    42000,
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85',
    'Carry',
    18
),

(
    'stone-mug',
    'Stone Mug',
    'A quiet ceramic mug with a hand-finished surface.',
    28000,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?auto=format&fit=crop&w=900&q=85',
    'Kitchen',
    25
),

(
    'field-notebook',
    'Field Notebook',
    'A durable notebook for ideas, lists and observations.',
    12000,
    'https://images.unsplash.com/photo-1531346878377-a5be20888e7d?auto=format&fit=crop&w=900&q=85',
    'Stationery',
    40
),

(
    'everyday-bottle',
    'Everyday Bottle',
    'A minimal insulated bottle designed for everyday use.',
    36000,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85',
    'Carry',
    20
),

(
    'linen-throw',
    'Linen Throw',
    'A lightweight textured throw for quiet interiors.',
    67000,
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85',
    'Home',
    9
)

on conflict (slug) do nothing;