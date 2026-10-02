import { ShoppingBag, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import type { Product } from "../types";

import { formatCurrency } from "../lib/format";

import { useCart } from "../contexts/CartContext";

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addItem } =
    useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="product-card group">

      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#e6deeb]">
        <Link
          to={`/products/${encodeURIComponent(product.slug)}`}
          aria-label={`View ${product.name} details`}
          className="focus-ring block h-full"
        >
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            className="product-image h-full w-full object-cover"
          />
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock < 1}
          className="focus-ring absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-[#caff3d] px-4 py-3 text-xs font-semibold text-[#241b2c] shadow-lg transition hover:scale-[1.03] disabled:opacity-50"
        >
          {added ? <Check size={15} /> : <ShoppingBag size={15} />}
          {added ? "Added" : "Add to bag"}
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#716779]">
            {product.category}
          </p>

          <h3 className="mt-1 text-sm font-semibold">
            <Link
              to={`/products/${encodeURIComponent(product.slug)}`}
              className="focus-ring rounded-sm hover:underline"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[#6b6374]">
            {product.description}
          </p>
        </div>

        <p className="shrink-0 text-sm font-semibold">
          {formatCurrency(product.price)}
        </p>

      </div>
    </article>
  );
}