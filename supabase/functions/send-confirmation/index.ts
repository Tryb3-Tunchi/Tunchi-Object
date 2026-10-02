import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed." }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");

    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY");

    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN");

    const mailgunFrom = Deno.env.get("MAILGUN_FROM");
    const mailgunApiBaseUrl =
      Deno.env.get("MAILGUN_API_BASE_URL") ?? "https://api.mailgun.net";

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !mailgunApiKey ||
      !mailgunDomain ||
      !mailgunFrom
    ) {
      throw new Error("Required environment variables are missing.");
    }

    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body: unknown = await request.json();
    const orderId =
      typeof body === "object" &&
      body !== null &&
      "order_id" in body &&
      typeof body.order_id === "string"
        ? body.order_id
        : "";

    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        orderId,
      )
    ) {
      return new Response(
        JSON.stringify({
          error: "A valid order_id is required.",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          user_id,
          customer_name,
          email,
          total,
          status,
          created_at
        `,
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({
          error: "Order not found.",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
            product_name,
            unit_price,
            quantity,
            subtotal
          `,
      )
      .eq("order_id", orderId);

    if (itemsError) {
      throw itemsError;
    }

    const itemsHtml = (items ?? [])
      .map(
        (item) => `
            <tr>
              <td style="padding:8px 0;">
                ${escapeHtml(item.product_name)}
              </td>

              <td style="padding:8px 0;text-align:center;">
                ${item.quantity}
              </td>

              <td style="padding:8px 0;text-align:right;">
                NGN ${Number(item.subtotal).toLocaleString("en-NG")}
              </td>
            </tr>
          `,
      )
      .join("");

    const emailHtml = `
      <!doctype html>

      <html>
        <body
          style="
            margin:0;
            padding:40px 20px;
            background:#f4f1f7;
            color:#241b2c;
            font-family:Arial,sans-serif;
          "
        >

          <div
            style="
              max-width:620px;
              margin:auto;
              background:#fffaff;
              padding:40px;
            "
          >

            <p
              style="
                font-size:12px;
                letter-spacing:2px;
                text-transform:uppercase;
                color:#716779;
              "
            >
              Tryb3 Objects
            </p>

            <h1
              style="
                font-size:36px;
                font-weight:500;
              "
            >
              Your order is confirmed.
            </h1>

            <p>
              Hi ${escapeHtml(order.customer_name)},
            </p>

            <p>
              Thanks for shopping with Tryb3.
              We've received your order and will
              begin preparing it shortly.
            </p>

            <table
              style="
                width:100%;
                border-collapse:collapse;
                margin-top:30px;
              "
            >
              <thead>
                <tr>
                  <th
                    style="
                      text-align:left;
                      border-bottom:1px solid #ddd6c8;
                      padding-bottom:10px;
                    "
                  >
                    Item
                  </th>

                  <th
                    style="
                      border-bottom:1px solid #ddd6c8;
                      padding-bottom:10px;
                    "
                  >
                    Qty
                  </th>

                  <th
                    style="
                      text-align:right;
                      border-bottom:1px solid #ddd6c8;
                      padding-bottom:10px;
                    "
                  >
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div
              style="
                margin-top:25px;
                padding-top:20px;
                border-top:1px solid #ddd6c8;
              "
            >
              <strong>
                Order total:
                NGN ${Number(order.total).toLocaleString("en-NG")}
              </strong>
            </div>

            <p
              style="
                margin-top:35px;
                font-size:12px;
                color:#716779;
              "
            >
              Order ID: ${order.id}
            </p>

          </div>

        </body>
      </html>
    `;

    const form = new FormData();

    form.append("from", mailgunFrom);

    form.append("to", order.email);

    form.append("subject", `Tryb3 order confirmed - ${order.id.slice(0, 8)}`);

    form.append("html", emailHtml);

    const auth = btoa(`api:${mailgunApiKey}`);

    const mailgunResponse = await fetch(
      `${mailgunApiBaseUrl.replace(/\/+$/, "")}/v3/${mailgunDomain}/messages`,
      {
        method: "POST",

        headers: {
          Authorization: `Basic ${auth}`,
        },

        body: form,
      },
    );

    const mailgunResult = await mailgunResponse.text();

    if (!mailgunResponse.ok) {
      console.error("Mailgun error:", mailgunResult);

      throw new Error("Unable to send confirmation email.");
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
