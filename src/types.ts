export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
};

export type CartItem = Product & {
  quantity: number;
};

export type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
  email: string;
};