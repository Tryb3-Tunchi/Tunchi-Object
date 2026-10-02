import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";

import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../lib/format";
import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setQuantity(1);

      if (!slug) {
        setError("This product could not be found.");
        setLoading(false);
        return;
      }

      const { data, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (productError) {
        setError("Unable to load this product. Please try again shortly.");
      } else if (!data) {
        setError("This product could not be found.");
      } else {
        setProduct(data);
      }

      setLoading(false);
    }

    void loadProduct();

    return () => {
      active = false;
    };
  }, [slug]);

  function handleAddToBag() {
    if (!product || product.stock < 1) {
      return;
    }

    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  function handleBuyNow() {
    if (!product || product.stock < 1) {
      return;
    }

    addItem(product, quantity);
    navigate("/checkout");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 text-center text-sm text-[#716779]">
        Loading product…
      </div>
    );
  }

  if (error || !product) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <p className="text-sm text-red-700" role="alert">
          {error || "This product could not be found."}
        </p>
        <Link
          to="/shop"
          className="focus-ring mt-6 inline-flex rounded-full bg-[#241b2c] px-5 py-3 text-sm text-[#f4f1f7] transition hover:bg-[#443252]"
        >
          Back to the shop
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
      <Link
        to="/shop"
        className="focus-ring rounded text-sm text-[#6b6374] underline underline-offset-4"
      >
        Back to the shop
      </Link>

      <div className="mt-7 grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#e6deeb]">
          <img
            src={product.image_url}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center py-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[#7554a3]">
            {product.category}
          </p>
          <h1 className="display-font mt-3 text-5xl tracking-[-0.05em] md:text-6xl">
            {product.name}
          </h1>
          <p className="mt-5 text-xl font-semibold">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-6 whitespace-pre-line text-sm leading-7 text-[#6b6374]">
            {product.description}
          </p>
          <p className="mt-5 text-xs text-[#716779]">
            {product.stock > 0 ? "In stock" : "Currently out of stock"}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <div
              className="flex items-center gap-3 rounded-full border border-[#d8d0df] px-2 py-1"
              aria-label="Choose quantity"
            >
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1 || product.stock < 1}
                aria-label="Decrease quantity"
                className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-[#ebe4f0] disabled:opacity-40"
              >
                <Minus size={15} aria-hidden="true" />
              </button>
              <span className="min-w-5 text-center text-sm" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(product.stock, current + 1))
                }
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
                className="focus-ring grid h-9 w-9 place-items-center rounded-full hover:bg-[#ebe4f0] disabled:opacity-40"
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddToBag}
              disabled={product.stock < 1}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#caff3d] px-6 py-3.5 text-sm font-semibold text-[#241b2c] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              {added ? "Added to bag" : "Add to bag"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock < 1}
            className="focus-ring mt-3 w-fit rounded-full bg-[#241b2c] px-6 py-3.5 text-sm font-semibold text-[#f4f1f7] transition hover:bg-[#443252] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buy now
          </button>
        </div>
      </div>
    </section>
  );
}
