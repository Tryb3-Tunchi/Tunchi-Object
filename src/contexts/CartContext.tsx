import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  CartItem,
  Product,
} from "../types";

const STORAGE_KEY = "lumen-cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;

  addItem: (
    product: Product,
  ) => void;

  removeItem: (
    id: string,
  ) => void;

  updateQuantity: (
    id: string,
    quantity: number,
  ) => void;

  clearCart: () => void;
};

const CartContext =
  createContext<
    CartContextValue | undefined
  >(undefined);

function readCart(): CartItem[] {
  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY,
      );

    return raw
      ? JSON.parse(raw)
      : [];
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>(readCart);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items),
    );
  }, [items]);

  function addItem(product: Product) {
    setItems((current) => {
      const existing =
        current.find(
          (item) =>
            item.id === product.id,
        );

      if (existing) {
        return current.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + 1,
                    product.stock,
                  ),
                }
              : item,
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  }

  function removeItem(id: string) {
    setItems((current) =>
      current.filter(
        (item) => item.id !== id,
      ),
    );
  }

  function updateQuantity(
    id: string,
    quantity: number,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(
                  quantity,
                  item.stock,
                ),
              ),
            }
          : item,
      ),
    );
  }

  function clearCart() {
    setItems([]);
  }

  const value = useMemo(
    () => ({
      items,

      count: items.reduce(
        (sum, item) =>
          sum + item.quantity,
        0,
      ),

      total: items.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0,
      ),

      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items],
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider",
    );
  }

  return context;
}