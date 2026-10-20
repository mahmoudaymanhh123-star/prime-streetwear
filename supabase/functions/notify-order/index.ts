import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c] as string));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const projectUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("ORDER_EMAIL_FROM");
  if (!projectUrl || !serviceKey || !resendKey || !fromEmail)
    return json({ error: "Order email service is not configured." }, 503);

  let body: { orderId?: string; notificationToken?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
  const orderId = String(body.orderId || "").trim();
  const notificationToken = String(body.notificationToken || "").trim();
  if (!orderId || notificationToken.length < 24) return json({ error: "Invalid order reference." }, 400);

  const admin = createClient(projectUrl, serviceKey, { auth: { persistSession: false } });
  const [{ data: orderRow, error: orderError }, { data: setting, error: settingError }] = await Promise.all([
    admin.from("store_orders").select("id,data").eq("id", orderId).maybeSingle(),
    admin.from("store_private_settings").select("value").eq("key", "order_notification_email").maybeSingle(),
  ]);
  if (orderError || !orderRow) return json({ error: "Order not found." }, 404);
  const order = orderRow.data as Record<string, unknown>;
  if (order.notificationToken !== notificationToken) return json({ error: "Invalid order reference." }, 403);
  if (settingError) return json({ error: "Could not load notification settings." }, 500);
  const recipient = typeof setting?.value === "string" ? setting.value.trim() : "";
  if (!recipient) return json({ error: "Set an order notification email in the admin page first." }, 409);

  const { error: claimError } = await admin.from("order_email_notifications").insert({ order_id: orderId });
  if (claimError) {
    if (claimError.code === "23505") return json({ ok: true, alreadySent: true });
    return json({ error: "Could not register this notification." }, 500);
  }

  const customer = (order.customer || {}) as Record<string, unknown>;
  const items = Array.isArray(order.items) ? order.items as Record<string, unknown>[] : [];
  const lines = [
    `Order: ${orderId}`,
    `Customer: ${customer.name || ""}`,
    `Phone: ${customer.phone || ""}`,
    `Customer email: ${customer.email || ""}`,
    `Address: ${[customer.governorate, customer.area, customer.address].filter(Boolean).join(", ")}`,
    `Notes: ${customer.notes || ""}`,
    "",
    "Items:",
    ...items.map((item) => `${item.name || "Item"} (${item.size || ""}) x ${item.qty || 0} — EGP ${Number(item.price || 0) * Number(item.qty || 0)}`),
    "",
    `Subtotal: EGP ${order.subtotal || 0}`,
    `Shipping: EGP ${order.shipping || 0}`,
    `Total: EGP ${order.total || 0}`,
    `Payment method: ${order.payment || ""}`,
    `Transfer reference: ${order.transferRef || ""}`,
  ];
  const subject = `New order ${orderId} — ${String(customer.name || "Customer")}`;
  const html = `<h2>${escapeHtml(subject)}</h2><pre style="font:14px/1.6 Arial,sans-serif;white-space:pre-wrap">${escapeHtml(lines.join("\n"))}</pre>`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromEmail, to: [recipient], subject, html }),
  });
  if (!response.ok) {
    await admin.from("order_email_notifications").delete().eq("order_id", orderId);
    console.error("Email provider rejected order notification", response.status, await response.text());
    return json({ error: "Email could not be sent. Check the email service settings." }, 502);
  }
  return json({ ok: true });
});
