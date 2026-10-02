import ReactDOM from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element is missing.");
}

const root = ReactDOM.createRoot(rootElement);
const hasSupabaseConfig = Boolean(
  import.meta.env.VITE_SUPABASE_URL?.trim() &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim(),
);

if (!hasSupabaseConfig) {
  root.render(
    <section className="grid min-h-screen place-items-center px-5 py-12">
      <div className="surface soft-shadow w-full max-w-xl rounded-[2rem] p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7554a3]">
          Tryb3 setup
        </p>
        <h1 className="display-font mt-3 text-4xl tracking-[-0.04em]">
          Supabase configuration is missing.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#6b6374]">
          Add <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> to this Vercel project’s
          Environment Variables for the deployment environment, then redeploy.
          These values are required when Vite builds the site.
        </p>
      </div>
    </section>,
  );
} else {
  import("./bootstrap")
    .then(({ default: Bootstrap }) => {
      root.render(<Bootstrap />);
    })
    .catch((error: unknown) => {
      console.error("Unable to load the Tryb3 application.", error);
      root.render(
        <p className="p-8 text-center text-sm text-red-700" role="alert">
          The shop could not start. Please reload the page.
        </p>,
      );
    });
}