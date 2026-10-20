// طبقة الاتصال بـ Supabase. لو مفيش مفاتيح في ملف .env الموقع يشتغل محليًا زي الأول.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const remoteEnabled = Boolean(supabase);
const BUCKET = "store-images";

export const isDataUrl = (v) => typeof v === "string" && v.startsWith("data:");

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}
export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? error.message : null;
}
export async function signUpCustomer(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account`,
      data: { full_name: name },
    },
  });
  return {
    error: error?.message || null,
    needsConfirmation: !data?.session,
  };
}
export const signOutAdmin = () => supabase?.auth.signOut();
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}${window.location.pathname}`,
  });
  return error ? error.message : null;
}
// Each authenticated user can manage their own sign-in credentials.
export const roleOf = (session) => session?.user?.app_metadata?.role || "customer";
export const isStoreOwner = (session) => roleOf(session) === "owner";
export async function updateAccount({ email, password, name }) {
  const patch = {};
  if (email) patch.email = email;
  if (password) patch.password = password;
  if (name) patch.data = { full_name: name };
  const { error } = await supabase.auth.updateUser(patch);
  return error ? error.message : null;
}

// رفع صورة (data URL) على Storage وإرجاع اللينك العام
export async function uploadDataUrl(dataUrl, folder) {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("store_products")
    .select("id,data")
    .order("id");
  if (error) throw error;
  return data.map((r) => ({ ...r.data, id: r.id }));
}
export async function upsertProduct(p) {
  const { error } = await supabase
    .from("store_products")
    .upsert({ id: p.id, data: p, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function deleteProductRow(id) {
  const { error } = await supabase.from("store_products").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchSettings() {
  const { data, error } = await supabase
    .from("store_settings")
    .select("key,value");
  if (error) throw error;
  return Object.fromEntries(data.map((r) => [r.key, r.value]));
}
export async function fetchPrivateSetting(k) {
  const { data, error } = await supabase
    .from("store_private_settings")
    .select("value")
    .eq("key", k)
    .maybeSingle();
  if (error) throw error;
  return data?.value ?? "";
}
export async function savePrivateSetting(k, value) {
  const { error } = await supabase
    .from("store_private_settings")
    .upsert({ key: k, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function saveSetting(k, value) {
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key: k, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function notifyOrderByEmail(orderId, notificationToken) {
  const { data, error } = await supabase.functions.invoke("notify-order", {
    body: { orderId, notificationToken },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function insertOrder(order, userId = null) {
  const { error } = await supabase
    .from("store_orders")
    .insert({ id: order.id, data: order, user_id: userId });
  if (error) throw error;
}
export async function fetchCustomerOrders(userId) {
  const { data, error } = await supabase
    .from("store_orders")
    .select("id,data,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => r.data);
}
export async function fetchOrders() {
  const { data, error } = await supabase
    .from("store_orders")
    .select("id,data,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((r) => r.data);
}
export async function updateOrderRow(order) {
  const { error } = await supabase
    .from("store_orders")
    .update({ data: order })
    .eq("id", order.id);
  if (error) throw error;
}
