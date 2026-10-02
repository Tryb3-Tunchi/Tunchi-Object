import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../lib/format";
import { supabase } from "../lib/supabase";

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState(() => {
    const fullName = user?.user_metadata?.full_name;
    return typeof fullName === "string" ? fullName : "";
  });
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) {
      setError("Your bag is empty. Add an item before checking out.");
      return;
    }

    setSubmitting(true);
    setError("");

    let orderId: string;
    try {
      const { data, error: orderError } = await supabase.rpc("create_order", {
        p_items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        p_customer_name: customerName.trim(),
        p_phone: phone.trim(),
        p_address: address.trim(),
      });

      if (orderError) {
        throw orderError;
      }
      if (typeof data !== "string") {
        throw new Error("The order was saved without returning an order number.");
      }

      orderId = data;
      clearCart();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "We couldn't place your order. Please try again.",
      );
      setSubmitting(false);
      return;
    }

    let emailSent = true;
    try {
      const { error: emailError } = await supabase.functions.invoke(
        "send-confirmation",
        { body: { order_id: orderId } },
      );

      if (emailError) {
        console.error("Order saved, but its confirmation email could not be sent.", emailError);
        emailSent = false;
      }
    } catch (emailError) {
      console.error("Order saved, but its confirmation email could not be sent.", emailError);
      emailSent = false;
    }

    navigate(`/success/${orderId}`, {
      replace: true,
      state: { emailSent },
    });
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-[#716779]">
        Your bag / Checkout
      </p>
      <h1 className="display-font mt-3 text-5xl tracking-[-0.04em] md:text-6xl">
        Make it yours.
      </h1>

      {items.length === 0 ? (
        <div className="surface soft-shadow mt-9 rounded-[2rem] p-8 text-center md:p-12">
          <p className="text-xs uppercase tracking-[0.18em] text-[#716779]">Nothing in the bag yet</p>
          <p className="mt-3 text-sm text-[#6b6374]">
            Find something useful, beautiful, or a little bit unexpected.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-[#241b2c] px-6 py-3 text-sm text-[#f4f1f7] transition hover:bg-[#443252] focus-ring"
          >
            Browse Tryb3
          </Link>
        </div>
      ) : (
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <section aria-labelledby="bag-heading">
            <h2 id="bag-heading" className="text-sm font-semibold">
              In your bag <span className="text-[#716779]">({items.length})</span>
            </h2>
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="surface flex gap-4 rounded-2xl p-4 sm:items-center"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-24 w-20 rounded-xl bg-[#e6deeb] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#716779]">
                      {item.category}
                    </p>
                    <h3 className="mt-1 truncate text-sm font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm">{formatCurrency(item.price)}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={`Remove one ${item.name}`}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d0df] disabled:opacity-40 focus-ring"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-6 text-center text-sm" aria-label="Quantity">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        aria-label={`Add one ${item.name}`}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[#d8d0df] disabled:opacity-40 focus-ring"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name} from bag`}
                    className="self-start rounded-full p-2 text-[#716779] transition hover:bg-[#ebe4f0] focus-ring sm:self-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="surface soft-shadow h-fit rounded-[2rem] p-6 md:p-8"
          >
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <p className="mt-1 text-sm text-[#6b6374]">
              Confirmation goes to <span className="font-medium text-[#241b2c]">{user?.email}</span>
            </p>

            <label className="mt-6 block text-sm font-medium" htmlFor="customer-name">
              Name
              <input
                id="customer-name"
                autoComplete="name"
                required
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d8d0df] bg-[#fffaff] px-4 py-3 text-sm focus-ring"
              />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="phone">
              Phone
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#d8d0df] bg-[#fffaff] px-4 py-3 text-sm focus-ring"
              />
            </label>

            <label className="mt-4 block text-sm font-medium" htmlFor="address">
              Delivery address
              <textarea
                id="address"
                autoComplete="street-address"
                required
                rows={3}
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-[#d8d0df] bg-[#fffaff] px-4 py-3 text-sm focus-ring"
              />
            </label>

            <div className="mt-6 border-t border-[#d8d0df] pt-5">
              <div className="flex items-center justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#716779]">
                Final prices and stock are checked securely when your order is placed.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="mt-5 w-full rounded-full bg-[#241b2c] px-5 py-3.5 text-sm font-medium text-[#f4f1f7] transition hover:bg-[#443252] disabled:cursor-wait disabled:opacity-60 focus-ring"
              >
                {submitting ? "Placing your order…" : "Place order"}
              </button>
              {error && (
                <p role="alert" className="mt-4 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
