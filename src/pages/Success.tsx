import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

export default function Success() {
  const { orderId } =
    useParams();
  const location = useLocation();
  const emailSent =
    (location.state as { emailSent?: boolean } | null)?.emailSent;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-80px)] max-w-3xl items-center px-5 py-20">
      <div className="surface soft-shadow w-full rounded-[2.5rem] p-8 text-center md:p-14">

        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#caff3d] text-xl font-bold text-[#241b2c]">
          ✓
        </div>

        <p className="mt-7 text-xs uppercase tracking-[0.2em] text-[#7554a3]">
          Order received
        </p>

        <h1 className="display-font mt-3 text-6xl">
          Thank you.
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#6b6374]">
          {emailSent === false
            ? "Your order is saved, but we couldn't send the confirmation email. Please contact us if you need a copy."
            : emailSent === true
              ? "Your order is saved. A confirmation email has been sent to your account email."
              : "Your order is saved. If email delivery is configured, a confirmation will be sent to your account email."}
        </p>

        <p className="mt-5 break-all text-xs text-[#716779]">
          Order ID: {orderId}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/shop"
            className="focus-ring rounded-full border border-[#d8d0df] px-5 py-3 text-sm transition hover:bg-[#ebe4f0]"
          >
            Keep browsing
          </Link>

          <Link
            to="/orders"
            className="focus-ring rounded-full bg-[#241b2c] px-5 py-3 text-sm text-[#f4f1f7] transition hover:bg-[#443252]"
          >
            View orders
          </Link>
        </div>
      </div>
    </section>
  );
}