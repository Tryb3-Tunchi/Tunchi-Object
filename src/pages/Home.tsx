import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import ProductCard from "../components/ProductCard";
import { supabase } from "../lib/supabase";
import type { Product } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error: productError } = await supabase
        .from("products")
        .select("*")
        .gt("stock", 0)
        .order("created_at", { ascending: false })
        .limit(4);

      if (productError) {
        setError("The Tryb3 edit couldn't load. Please try again shortly.");
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-8 md:grid-cols-[.9fr_1.1fr] md:px-8 md:pb-24 md:pt-12">
        <div className="flex flex-col justify-center py-8 md:py-12">
          <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#d8d0df] bg-[#fffaff] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#443252]">
            <span className="h-2 w-2 rounded-full bg-[#7554a3]" />
            Tryb3 Objects / Issue 01
          </p>

          <h1 className="display-font max-w-2xl text-6xl leading-[0.93] tracking-[-0.07em] md:text-[5.7rem]">
            Good things.
            <br />
            <span className="text-[#7554a3]">No weird stuff.</span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-7 text-[#6b6374]">
            Useful objects with a little extra point of view. Meet the small
            Tryb3 edit: made for daily rituals, chosen to keep.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/shop"
              className="focus-ring inline-flex items-center gap-3 rounded-full bg-[#241b2c] px-6 py-3.5 text-sm font-medium text-[#f4f1f7] transition hover:bg-[#443252]"
            >
              Shop the edit
              <ArrowUpRight size={16} />
            </Link>
            <a
              href="#the-edit"
              className="focus-ring inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[#443252] underline decoration-[#b5a8c5] underline-offset-4"
            >
              Take a look
              <ArrowDownRight size={15} />
            </a>
          </div>

          <div className="mt-12 grid max-w-sm grid-cols-2 border-t border-[#d8d0df] pt-4">
            <p className="text-xs leading-5 text-[#716779]">
              <span className="mb-1 block font-semibold text-[#241b2c]">Less, but better</span>
              A tight edit, never endless scroll.
            </p>
            <p className="border-l border-[#d8d0df] pl-4 text-xs leading-5 text-[#716779]">
              <span className="mb-1 block font-semibold text-[#241b2c]">Made for real life</span>
              Useful now. Still useful later.
            </p>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#342443] md:min-h-[580px]">
          <img
            src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1400&q=85"
            alt="Sunlit interior with thoughtfully chosen home objects"
            onError={(event) => {
              event.currentTarget.hidden = true;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#241b2c]/65 via-transparent to-[#241b2c]/10" />
          <p className="absolute left-5 top-5 rounded-full bg-[#caff3d] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#241b2c]">
            Objects with a little extra
          </p>
          <p className="absolute bottom-6 left-6 max-w-xs text-3xl leading-tight text-white md:bottom-9 md:left-9 md:text-4xl">
            The everyday,
            <br />
            reimagined.
          </p>
          <span className="absolute bottom-6 right-6 grid h-14 w-14 place-items-center rounded-full bg-[#caff3d] text-sm font-black text-[#241b2c] md:bottom-9 md:right-9">
            T3
          </span>
        </div>
      </section>

      <section
        id="the-edit"
        className="mx-auto max-w-7xl px-5 pb-20 md:px-8 md:pb-28"
      >
        <div className="mb-8 flex items-end justify-between gap-4 border-t border-[#d8d0df] pt-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7554a3]">
              A good place to start
            </p>
            <h2 className="display-font mt-2 text-4xl tracking-[-0.05em] md:text-5xl">
              The current edit
            </h2>
          </div>
          <Link
            to="/shop"
            className="focus-ring mb-1 inline-flex shrink-0 items-center gap-2 text-sm font-medium text-[#443252] underline decoration-[#b5a8c5] underline-offset-4"
          >
            All objects <ArrowUpRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#716779]" role="status">
            Finding the good stuff...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-700" role="alert">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#716779]">
            The shelves are taking a breather. Check back soon.
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
