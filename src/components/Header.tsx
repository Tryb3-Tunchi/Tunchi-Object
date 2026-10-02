import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  ShoppingBag,
  UserRound,
  LogOut,
} from "lucide-react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Header() {
  const {
    user,
    signOut,
  } = useAuth();

  const { count } =
    useCart();

  const navigate =
    useNavigate();
  const [signOutError, setSignOutError] = useState("");

  return (
    <header className="sticky top-0 z-40 border-b border-[#dcd5e3]/80 bg-[#f4f1f7]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">

        <Link
          to="/"
          aria-label="Tryb3 home"
          className="focus-ring flex items-center gap-2 rounded-lg"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#caff3d] text-xs font-black tracking-tight text-[#241b2c]">
            T3
          </span>
          <span className="text-xl font-extrabold tracking-[-0.07em] text-[#241b2c]">
            Tryb3<span className="text-[#7554a3]">.</span>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-3 text-xs sm:gap-5 sm:text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hidden rounded-full px-3 py-2 transition focus-ring sm:block ${isActive ? "bg-[#ebe4f0] text-[#241b2c]" : "text-[#716779] hover:text-[#241b2c]"}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 transition focus-ring ${isActive ? "bg-[#ebe4f0] text-[#241b2c]" : "text-[#716779] hover:text-[#241b2c]"}`
            }
          >
            Shop
          </NavLink>

          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `hidden rounded-full px-3 py-2 transition focus-ring sm:block ${isActive ? "bg-[#ebe4f0] text-[#241b2c]" : "text-[#716779] hover:text-[#241b2c]"}`
              }
            >
              Orders
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">

          {user ? (
            <>
              <Link
                to="/orders"
                aria-label="Order history"
                className="focus-ring rounded-full border border-[#d8d0df] p-2 text-[#241b2c] sm:hidden"
              >
                <UserRound size={16} />
              </Link>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    navigate("/");
                    setSignOutError("");
                  } catch {
                    setSignOutError("Unable to sign out. Please try again.");
                  }
                }}
                aria-label="Sign out"
                className="focus-ring rounded-full border border-[#d8d0df] p-2 text-[#241b2c] transition hover:bg-[#ebe4f0]"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              aria-label="Sign in"
              className="focus-ring rounded-full border border-[#d8d0df] p-2 text-[#241b2c]"
            >
              <UserRound size={17} />
            </Link>
          )}

          <Link
            to="/checkout"
            aria-label={`Open bag${count > 0 ? `, ${count} items` : ""}`}
            className="focus-ring relative rounded-full bg-[#241b2c] p-2 text-[#f4f1f7]"
          >
            <ShoppingBag size={17} />

            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#caff3d] px-1 text-[10px] font-bold text-[#241b2c]">
                {count}
              </span>
            )}
          </Link>

        </div>
      </div>
      {signOutError && (
        <p role="alert" className="mx-auto max-w-7xl px-5 pb-2 text-right text-xs text-red-700 md:px-8">
          {signOutError}
        </p>
      )}
    </header>
  );
}