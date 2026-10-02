import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Chrome } from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const REDIRECT_KEY = "tryb3-auth-redirect";

export default function Login() {
  const {
    user,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const requestedPath =
      (
        location.state as {
          from?: string;
        } | null
      )?.from ?? sessionStorage.getItem(REDIRECT_KEY);
    const from =
      requestedPath?.startsWith("/") &&
      !requestedPath.startsWith("//")
        ? requestedPath
        : "/";

    sessionStorage.removeItem(REDIRECT_KEY);
    navigate(from, { replace: true });
  }, [user, navigate, location.state]);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (mode === "sign-in") {
        await signInWithPassword(email.trim(), password);
      } else {
        const hasSession = await signUpWithPassword(email.trim(), password);
        if (!hasSession) {
          setMode("sign-in");
          setNotice("Check your inbox to confirm your email, then come back here to sign in.");
        }
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "We couldn't complete that request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setError("");
      setNotice("");
      const requestedPath =
        (
          location.state as {
            from?: string;
          } | null
        )?.from ?? "/";
      sessionStorage.setItem(REDIRECT_KEY, requestedPath);
      await signInWithGoogle();
    } catch (authError) {
      sessionStorage.removeItem(REDIRECT_KEY);
      const message =
        authError instanceof Error ? authError.message : "";
      setError(
        message.toLowerCase().includes("unsupported provider")
          ? "Google sign-in isn't enabled in Supabase yet. In Supabase, open Authentication → Sign In / Providers → Google, add your Google OAuth client ID and secret, enable the provider, and save."
          : message || "Google sign-in is unavailable. Check the provider setup and try again.",
      );
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl place-items-center px-5 py-12 md:py-16">
      <div className="surface soft-shadow w-full max-w-md rounded-[2rem] p-7 md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7554a3]">
          Welcome to Tryb3
        </p>
        <h1 className="display-font mt-3 text-4xl tracking-[-0.04em]">
          {mode === "sign-in" ? "Good to have you back." : "Make yourself at home."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6b6374]">
          Sign in to check out and keep your orders together.
        </p>

        <form onSubmit={handleEmailSubmit} className="mt-7">
          <label htmlFor="email" className="block text-sm font-medium">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="focus-ring mt-2 w-full rounded-xl border border-[#d8d0df] bg-[#fffaff] px-4 py-3 text-sm"
          />

          <label htmlFor="password" className="mt-4 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-2 w-full rounded-xl border border-[#d8d0df] bg-[#fffaff] px-4 py-3 text-sm"
          />

          <button
            type="submit"
            disabled={submitting}
            className="focus-ring mt-5 w-full rounded-full bg-[#241b2c] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#443252] disabled:cursor-wait disabled:opacity-60"
          >
            {submitting
              ? "One moment..."
              : mode === "sign-in"
                ? "Sign in with email"
                : "Create account with email"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#6b6374]">
          {mode === "sign-in" ? "New to Tryb3?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError("");
              setNotice("");
            }}
            className="focus-ring rounded text-sm font-semibold text-[#5c3d83] underline underline-offset-4"
          >
            {mode === "sign-in" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <div className="my-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-[#d8d0df]" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#716779]">
            Or use Google
          </span>
          <span className="h-px flex-1 bg-[#d8d0df]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="focus-ring flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#7554a3] bg-[#ebe4f0] px-5 py-3.5 text-sm font-semibold text-[#342443] transition hover:bg-[#e2d7eb]"
        >
          <Chrome size={18} aria-hidden="true" />
          Continue with Google
        </button>

        {notice && (
          <p role="status" className="mt-4 rounded-xl bg-[#eff5dc] p-3 text-sm leading-5 text-[#39491d]">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-[#fbebeb] p-3 text-sm leading-5 text-red-800">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
