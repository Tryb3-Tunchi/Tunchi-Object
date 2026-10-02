import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "../contexts/CartContext";
import { formatCurrency } from "../lib/format";
import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);

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

    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
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
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={product.stock < 1}
            className="focus-ring mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[#caff3d] px-6 py-3.5 text-sm font-semibold text-[#241b2c] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            {added ? "Added to bag" : "Add to bag"}
          </button>
        </div>
      </div>
    </section>
  );
}
