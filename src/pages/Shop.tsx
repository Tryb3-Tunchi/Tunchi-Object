import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export default function Shop() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [category, setCategory] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");

      const { data, error } =
        await supabase
          .from("products")
          .select("*")
          .gt("stock", 0)
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        setError(
          "Unable to load the collection.",
        );
      } else {
        setProducts(data ?? []);
      }

      setLoading(false);
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          products.map(
            (product) =>
              product.category,
          ),
        ),
      ),
    ];
  }, [products]);

  const visibleProducts =
    category === "All"
      ? products
      : products.filter(
          (product) =>
            product.category ===
            category,
        );

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      {/* Heading */}
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-[#7554a3]">
          Tryb3 / The shop
        </p>

        <h1 className="display-font mt-3 text-6xl tracking-[-0.04em]">
          The good stuff.
        </h1>

        <p className="mt-5 leading-7 text-[#6b6374]">
          Useful objects for desks, rooms, movement and the small rituals that
          make a day yours.
        </p>
      </div>

      {/* Categories */}
      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() =>
              setCategory(item)
            }
            className={`focus-ring rounded-full px-4 py-2 text-xs transition ${
              category === item
                ? "bg-[#241b2c] text-[#f4f1f7]"
                : "border border-[#d8d0df] hover:bg-[#ebe4f0]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-sm text-[#716779]">
          Loading collection…
        </div>
      ) : error ? (
        <div className="py-20 text-center text-sm text-red-700">
          {error}
        </div>
      ) : visibleProducts.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#716779]">
          No products found in this category.
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}