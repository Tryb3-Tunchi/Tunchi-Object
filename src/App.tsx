import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Success from "./pages/Success";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authError = params.get("error");

    if (!authError) {
      return;
    }

    const errorCode = params.get("error_code");
    const message =
      errorCode === "bad_oauth_state"
        ? "Google sign-in expired or returned without its matching security state. Start sign-in again from this site. If it keeps happening, use one site hostname throughout and verify Google’s authorized URI is your Supabase project’s /auth/v1/callback and Supabase allows this site’s /login URL."
        : "Google sign-in could not be completed. Start sign-in again. If the problem continues, check the Google callback and Supabase redirect URLs.";

    navigate("/login", {
      replace: true,
      state: { oauthError: message },
    });
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-[#f4f1f7] text-[#241b2c]">
      <Header />

      <main>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/products/:slug"
            element={<ProductDetail />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/success/:orderId"
            element={<Success />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}