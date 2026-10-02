import {
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

import {
  formatCurrency,
  formatDate,
} from "../lib/format";

import type { Order } from "../types";

export default function Orders() {
  const { user } =
    useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    async function fetchOrders() {
      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select(
          "id,total,status,created_at,customer_name,email",
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

      if (error) {
        setError(
          "Unable to load your orders.",
        );
      } else {
        setOrders(
          data ?? [],
        );
      }

      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  return (
    <section className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-[#716779]">
        Account
      </p>

      <h1 className="display-font mt-3 text-6xl">
        Your orders.
      </h1>

      {loading ? (
        <p className="mt-10 text-sm text-[#716779]">
          Loading orders...
        </p>
      ) : error ? (
        <p className="mt-10 text-sm text-red-700">
          {error}
        </p>
      ) : orders.length === 0 ? (
        <div className="surface mt-10 rounded-2xl p-8 text-center">
          <p className="text-sm text-[#716779]">
            You haven't placed any
            orders yet.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-3">
          {orders.map(
            (order) => (
              <div
                key={order.id}
                className="surface flex flex-wrap items-center justify-between gap-5 rounded-2xl p-5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatDate(
                      order.created_at,
                    )}
                  </p>

                  <p className="mt-1 break-all text-xs text-[#716779]">
                    {order.id}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {formatCurrency(
                      order.total,
                    )}
                  </p>

                  <p className="mt-1 text-xs capitalize text-[#716779]">
                    {order.status}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}