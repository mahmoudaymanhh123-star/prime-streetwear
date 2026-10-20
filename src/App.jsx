import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Instagram,
  Facebook,
  MessageCircle,
  Globe,
  PackageCheck,
  ClipboardList,
  FolderPlus,
  Ruler,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { money, readProducts, writeProducts } from "./data";
import { siteConfig } from "./siteConfig";
import {
  remoteEnabled,
  supabase,
  isDataUrl,
  getSession,
  signIn,
  signUpCustomer,
  isStoreOwner,
  signOutAdmin,
  uploadDataUrl,
  fetchProducts,
  upsertProduct,
  deleteProductRow,
  fetchSettings,
  saveSetting,
  insertOrder,
  fetchOrders,
  fetchCustomerOrders,
  updateOrderRow,
  deleteOrderRow,
  updateAccount,
  sendPasswordReset,
  notifyOrderByEmail,
  fetchPrivateSetting,
  savePrivateSetting,
} from "./supabase";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });
const useLanguage = () => useContext(LanguageContext);
const translations = {
  "Shop all": "تسوق الكل",
  "T-shirts": "تيشيرتات",
  Pants: "بنطلونات",
  "Our story": "قصتنا",
  Bag: "السلة",
  "Find your": "اكتشف",
  "Everyday essentials. Nothing extra.": "أساسيات يومية، بدون أي إضافات زائدة.",
  "No pieces found.": "لا توجد منتجات.",
  "Try another category.": "جرّب قسمًا آخر.",
  "Clear filters": "مسح التصفية",
  "YOUR SELECTION": "اختياراتك",
  "The bag": "السلة",
  "Your bag is waiting.": "سلتك بانتظارك.",
  "Find the pieces that feel like you.": "اكتشف القطع المناسبة لأسلوبك.",
  "Explore the collection": "استكشف المجموعة",
  "THE DETAILS": "التفاصيل",
  "Order summary": "ملخص الطلب",
  Subtotal: "المجموع الفرعي",
  Shipping: "الشحن",
  "Calculated at checkout": "يُحسب عند إتمام الطلب",
  TOTAL: "الإجمالي",
  "CONTINUE SHOPPING": "متابعة التسوق",
  "PRIVATE STORE ACCESS": "دخول إدارة المتجر",
  "Product management": "إدارة المنتجات",
  "Lock workspace": "قفل لوحة الإدارة",
  "View storefront": "عرض المتجر",
  "ADD PRODUCT": "إضافة منتج",
  "SAVE CHANGES": "حفظ التعديلات",
  EDIT: "تعديل",
  DELETE: "حذف",
  "In Stock": "متوفر",
  "Out of Stock": "غير متوفر",
  "Size Guide": "دليل المقاسات",
  "CONTINUE TO CHECKOUT": "متابعة لإتمام الطلب",
  ITEMS: "منتجات",
  "YOUR SELECTION": "اختياراتك",
  "ORDER RECEIVED": "تم استلام الطلب",
  "Your bag is waiting.": "سلتك بانتظارك.",
  "Find the pieces that feel like you.": "اكتشف القطع المناسبة لأسلوبك.",
  REMOVE: "حذف",
  SIZE: "المقاس",
  "Order summary": "ملخص الطلب",
  Subtotal: "المجموع الفرعي",
  Shipping: "الشحن",
  TOTAL: "الإجمالي",
  "CONTINUE TO CHECKOUT": "متابعة لإتمام الطلب",
  "THE DETAILS": "تفاصيل الطلب",
  "Explore the collection": "استكشف المجموعة",
  "DELIVERY DETAILS": "بيانات التوصيل",
  "Where should we deliver?": "هنوصل الطلب فين؟",
  "Full name": "الاسم بالكامل",
  "Mobile number": "رقم الموبايل",
  "Email (optional)": "البريد الإلكتروني (اختياري)",
  Governorate: "المحافظة",
  "Area / district": "المنطقة / الحي",
  "Full address": "العنوان بالتفصيل",
  "Street, building, floor, apartment": "الشارع، العمارة، الدور، الشقة",
  "Order notes (optional)": "ملاحظات الطلب (اختياري)",
  "SHIPPING FEE PAYMENT": "دفع مصاريف الشحن",
  "Transfer the shipping fee only. The order remains pending until the transfer is reviewed.":
    "حوّل مصاريف الشحن فقط. سيظل الطلب قيد المراجعة حتى نراجع التحويل.",
  "Payment method": "طريقة الدفع",
  InstaPay: "إنستا باي",
  "Mobile wallet": "محفظة موبايل",
  "Bank transfer": "تحويل بنكي",
  "Other / confirm with store": "طريقة أخرى / تواصل مع المتجر",
  "Transfer reference (if already paid)": "رقم العملية (لو تم التحويل)",
  "Transaction reference": "رقم العملية",
  "Transfer proof image (optional)": "صورة إثبات التحويل (اختياري)",
  "Other method": "طريقة أخرى",
  "Payment details have not been configured yet. Do not transfer money until the store shares verified details.":
    "لم تتم إضافة بيانات الدفع بعد. لا تحوّل أي أموال قبل استلام بيانات مؤكدة من المتجر.",
  "Shipping fee to transfer:": "مصاريف الشحن المطلوب تحويلها:",
  "Your order remains pending until payment is reviewed.":
    "سيظل الطلب قيد المراجعة حتى يتم التأكد من الدفع.",
  "PLACE ORDER — PENDING REVIEW": "تسجيل الطلب — بانتظار مراجعة الدفع",
  "Back to cart": "العودة إلى السلة",
  "Your order will be saved in this browser for this prototype. Shared order management requires the later backend connection.":
    "سيتم حفظ الطلب على هذا المتصفح في النسخة التجريبية. إدارة الطلبات من أجهزة مختلفة تحتاج ربط الخادم لاحقًا.",
  "CONTINUE SHOPPING": "متابعة التسوق",
  "ORDER RECEIVED": "تم استلام الطلب",
  "Thank you for your order.": "شكرًا لطلبك.",
  "Your reference is": "رقم طلبك هو",
  "Choose the payment method selected at checkout and transfer the shipping fee of":
    "استخدم طريقة الدفع التي اخترتها وحوّل مصاريف الشحن بقيمة",
  "Add the transfer reference to help us review it.":
    "أضف رقم العملية لمساعدتنا في مراجعتها.",
  "Your order is pending payment review. We will confirm it after checking the transfer.":
    "طلبك بانتظار مراجعة الدفع. سنؤكده بعد التحقق من التحويل.",
  "Transfer details": "بيانات التحويل",
  "Choose the payment method selected at checkout and transfer the shipping fee of":
    "استخدم طريقة الدفع التي اخترتها وحوّل مصاريف الشحن بقيمة",
  "Add the transfer reference to help us review it.":
    "أضف رقم العملية لمساعدتنا في مراجعتها.",
  "Store payment details have not been configured yet.":
    "لم تتم إضافة بيانات الدفع الخاصة بالمتجر بعد.",
  "Contact the store before transferring money.":
    "تواصل مع المتجر قبل تحويل أي أموال.",
  "Back to storefront": "العودة للمتجر",
  "Choose the payment method selected at checkout and transfer the shipping fee of":
    "استخدم طريقة الدفع التي اخترتها وحوّل مصاريف الشحن بقيمة",
  "Add the transfer reference to help us review it.":
    "أضف رقم العملية لمساعدتنا في مراجعتها.",
};
const tr = (text, lang) => (lang === "ar" ? translations[text] || text : text);
const readStored = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

Object.assign(translations, {
  "Pay the shipping fee to": "حوّل مصاريف الشحن على",
  Copy: "نسخ",
  Copied: "تم النسخ",
  "Shipping fee to transfer now": "مصاريف الشحن المطلوب تحويلها الآن",
  "Transfer to": "حوّل على",
  "Account / number not set yet": "لم يتم إضافة الرقم بعد",
  "SHIPPING FEE (EGP)": "مصاريف الشحن (جنيه)",
  "Default shipping fee for new orders. You can also change the fee per order from the Orders tab.":
    "مصاريف الشحن الافتراضية للأوردرات الجديدة. ويمكنك تغييرها لكل أوردر من تبويب الأوردرات.",
  "Message to customer": "رسالة للعميل",
  "Shipping fee for this order (EGP)": "مصاريف شحن هذا الأوردر (جنيه)",
  "Message language": "لغة الرسالة",
  "Send on WhatsApp": "إرسال واتساب",
  "Send by email": "إرسال إيميل",
  "Copy message": "نسخ الرسالة",
  "Reset message": "إعادة الرسالة الأصلية",
  "Message sent": "تم إرسال الرسالة",
  "WhatsApp opened. Review the message and press Send in WhatsApp.": "تم فتح واتساب بالرسالة الجاهزة. راجعها واضغط إرسال داخل واتساب.",
  "Email draft opened. Send it from your email app.": "تم فتح مسودة الإيميل. أرسلها من تطبيق البريد.",
  "Enter a valid customer phone number to use WhatsApp.": "رقم العميل غير صالح لفتح واتساب.",
  "Edit the text freely before sending.": "عدّل النص كما تريد قبل الإرسال.",
  EDIT: "تعديل",
  DELETE: "حذف",
  CANCEL: "إلغاء",
  "Edit category": "تعديل القسم",
  "Add category": "إضافة قسم",
  "CATEGORY NAME": "اسم القسم",
  "CATEGORY DESCRIPTION (optional)": "وصف القسم (اختياري)",
  "CATEGORY COVER IMAGE": "صورة القسم",
  "Remove image": "حذف الصورة",
  "SAVE CATEGORY": "حفظ القسم",
  "ADD CATEGORY": "إضافة القسم",
  "Category saved.": "تم حفظ القسم.",
  "Category added.": "تم إضافة القسم.",
  "A category with this name already exists.": "يوجد قسم بنفس الاسم بالفعل.",
  "COLLECTION SETUP": "إعداد الأقسام",
  Categories: "الأقسام",
  "YOUR COLLECTION": "مجموعتك",
  "MESSAGE TEMPLATE FOR CUSTOMERS": "نص رسالة العميل (اكتبه بنفسك)",
  "Write your own shipping-fee message. Available placeholders:":
    "اكتب رسالة مصاريف الشحن بنفسك. المتغيرات المتاحة:",
  "Leave empty to use the built-in message. You can still edit the text per order.":
    "اتركه فارغًا لاستخدام الرسالة الجاهزة. ويمكنك تعديل النص لكل أوردر على حدة.",
  "Insert example text": "إدراج نص مثال",
  "CART MESSAGE (shown to the customer in the cart)":
    "رسالة الكارت (تظهر للعميل في الكارت)",
  "Replaces the default 'Pay the shipping fee' sentence. Placeholders:":
    "تحل محل جملة الدفع الافتراضية. المتغيرات:",
  "Change image": "تغيير الصورة",
  "Choose image": "اختر صورة",
});

const DEFAULT_SHIPPING = 80;
const defaultPaymentDetails = {
  instapay: "",
  wallet: "",
  bank: "",
  whatsapp: siteConfig.whatsapp || "",
  instagram: siteConfig.instagram || "",
  tiktok: siteConfig.tiktok || "",
  facebook: siteConfig.facebook || "",
  shippingFee: DEFAULT_SHIPPING,
  messageTemplate: "",
  cartMessage: "",
};
const exampleTemplate = `أهلاً {name} 👋
شكرًا لطلبك من PRIME STREETWEAR — رقم الطلب: {order_id}

{items}

لتأكيد الأوردر برجاء تحويل مصاريف الشحن: {shipping} جنيه
على:
{payment}

بعد التحويل ابعتلنا صورة التحويل وهنأكد طلبك فورًا ✅`;
const readPaymentDetails = () => ({
  ...defaultPaymentDetails,
  ...(siteConfig.payment || {}),
  ...readStored("prime_payment_details", {}),
});
const defaultHelpContent = {
  contactEmail: "",
  contactWhatsapp: "",
  shipping: "Contact us for current delivery fees, covered areas, and estimated delivery times.",
  returns: "Please contact us before arranging a return or exchange.",
};
const readHelpContent = () => ({
  ...defaultHelpContent,
  ...readStored("prime_help_content", {}),
});
const getWhatsapp = () =>
  String(
    readPaymentDetails().whatsapp ||
      localStorage.getItem("prime_whatsapp") ||
      "",
  ).replace(/[^0-9]/g, "");
const TikTokIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16.6 2h-3.1v13.3a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.5a5.8 5.8 0 1 0 5 5.7V8.6a7.3 7.3 0 0 0 4.3 1.4V6.9a4.3 4.3 0 0 1-4.3-4.9z" />
  </svg>
);
const WhatsAppIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);
const parseShipping = (value) => {
  if (value === "" || value == null) return DEFAULT_SHIPPING;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_SHIPPING;
};
const normalizeCategory = (c, i = 0) =>
  typeof c === "string"
    ? { name: c, note: "Explore the collection.", image: "" }
    : { ...c, note: c.note || "Explore the collection.", image: c.image || "" };
// Egyptian numbers: 01012345678 -> 201012345678 (wa.me needs the country code)
const toWaNumber = (phone) => {
  let d = String(phone || "").replace(/[^0-9]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "20" + d.slice(1);
  return d;
};
const compressImage = (file, max = 1000) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
const paymentLines = (details, method, lang) => {
  const labels =
    lang === "ar"
      ? { instapay: "إنستا باي", wallet: "محفظة موبايل", bank: "تحويل بنكي" }
      : {
          instapay: "InstaPay",
          wallet: "Mobile wallet",
          bank: "Bank transfer",
        };
  const keys = ["instapay", "wallet", "bank"].includes(method)
    ? [method]
    : ["instapay", "wallet", "bank"];
  const lines = keys
    .filter((k) => String(details[k] || "").trim())
    .map((k) => `${labels[k]}: ${String(details[k]).trim()}`);
  return lines;
};
const buildOrderMessage = (order, details, lang) => {
  const name = order.customer?.name || "";
  const shipping = Number(order.shipping || 0);
  const subtotal = Number(order.subtotal || 0);
  const fmt = (n) => n.toLocaleString("en-EG");
  const lines = paymentLines(details, order.payment, lang);
  const items = (order.items || [])
    .map((it) => `• ${it.name} (${it.size}) × ${it.qty}`)
    .join("\n");
  const tpl = String(details.messageTemplate || "").trim();
  if (tpl) {
    const vars = {
      name,
      order_id: order.id,
      phone: order.customer?.phone || "",
      shipping: fmt(shipping),
      subtotal: fmt(subtotal),
      total: fmt(subtotal + shipping),
      items,
      payment: lines.join("\n"),
    };
    return tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  }
  if (lang === "ar") {
    return [
      `أهلاً ${name} 👋`,
      `شكرًا لطلبك من PRIME STREETWEAR — رقم الطلب: ${order.id}`,
      "",
      items,
      "",
      `لتأكيد الأوردر برجاء تحويل مصاريف الشحن: ${fmt(shipping)} جنيه`,
      lines.length
        ? `رقم التحويل:\n${lines.join("\n")}`
        : "هنبعتلك بيانات التحويل في رسالة منفصلة.",
      "",
      "بعد التحويل ابعتلنا صورة التحويل أو رقم العملية على الرسالة دي وهنأكد طلبك فورًا ✅",
      `قيمة المنتجات: ${fmt(subtotal)} جنيه (تُدفع عند الاستلام)`,
    ].join("\n");
  }
  return [
    `Hi ${name} 👋`,
    `Thank you for your PRIME STREETWEAR order — Order #${order.id}`,
    "",
    items,
    "",
    `To confirm your order, please transfer the shipping fee: EGP ${fmt(shipping)}`,
    lines.length
      ? `Transfer to:\n${lines.join("\n")}`
      : "We will send you the transfer details separately.",
    "",
    "After transferring, reply with the transfer screenshot or reference number and we will confirm your order right away ✅",
    `Products total: EGP ${fmt(subtotal)} (paid on delivery)`,
  ].join("\n");
};

function CopyValue({ value, label }) {
  const { lang } = useLanguage();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy-chip"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* clipboard may be blocked */
        }
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check size={12} /> : null}{" "}
      {done ? tr("Copied", lang) : label || tr("Copy", lang)}
    </button>
  );
}

function useStore() {
  // With Supabase connected the database is the source of truth; the browser only keeps a cache.
  const [products, setProducts] = useState(() =>
    remoteEnabled ? readStored("prime_products_remote", []) : readProducts(),
  );
  const [productsLoaded, setProductsLoaded] = useState(!remoteEnabled);
  const [productsSyncError, setProductsSyncError] = useState("");
  const synced = useRef(null);
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("prime_cart") || "[]");
    } catch {
      return [];
    }
  });
  useEffect(() => {
    if (remoteEnabled)
      localStorage.setItem("prime_products_remote", JSON.stringify(products));
    else writeProducts(products);
  }, [products]);
  // load products from the database
  useEffect(() => {
    if (!remoteEnabled) return;
    fetchProducts()
      .then((rows) => {
        synced.current = new Map(rows.map((r) => [r.id, JSON.stringify(r)]));
        setProducts(rows);
        setProductsSyncError("");
      })
      .catch((e) => {
        console.error("Could not load products", e);
        setProductsSyncError(e?.message || String(e));
      })
      .finally(() => setProductsLoaded(true));
  }, []);
  // push admin changes (add / edit / delete) to the database; upload new images to Storage
  useEffect(() => {
    if (!remoteEnabled || !synced.current) return;
    (async () => {
      if (!(await getSession())) {
        setProductsSyncError("No active Supabase admin session. Sign in to the admin page again.");
        return;
      }
      const prev = synced.current;
      const ids = new Set(products.map((p) => p.id));
      for (const id of [...prev.keys()])
        if (!ids.has(id)) {
          await deleteProductRow(id);
          prev.delete(id);
        }
      for (const p of products) {
        if (prev.get(p.id) === JSON.stringify(p)) continue;
        let next = p;
        if ((p.images || []).some(isDataUrl) || isDataUrl(p.sizeGuideImage)) {
          const images = await Promise.all(
            (p.images || []).map((im) =>
              isDataUrl(im) ? uploadDataUrl(im, "products") : im,
            ),
          );
          const sizeGuideImage = isDataUrl(p.sizeGuideImage)
            ? await uploadDataUrl(p.sizeGuideImage, "size-guides")
            : p.sizeGuideImage;
          next = { ...p, images, image: images[0] || "", sizeGuideImage };
        }
        await upsertProduct(next);
        prev.set(next.id, JSON.stringify(next));
        setProductsSyncError("");
        if (next !== p)
          setProducts((old) => old.map((x) => (x.id === next.id ? next : x)));
      }
    })().catch((e) => {
      console.error("Could not save products", e);
      setProductsSyncError(e?.message || String(e));
    });
  }, [products]);
  const importLocalProducts = () => setProducts(readProducts());
  useEffect(
    () => localStorage.setItem("prime_cart", JSON.stringify(cart)),
    [cart],
  );
  const add = (product, qty = 1, size = "M") =>
    setCart((current) => {
      const key = `${product.id}-${size}`;
      const found = current.find((item) => item.key === key);
      return found
        ? current.map((item) =>
            item.key === key ? { ...item, qty: item.qty + qty } : item,
          )
        : [...current, { ...product, key, size, qty }];
    });
  const changeQty = (key, amount) =>
    setCart((current) =>
      current
        .map((item) =>
          item.key === key ? { ...item, qty: item.qty + amount } : item,
        )
        .filter((item) => item.qty > 0),
    );
  const remove = (key) =>
    setCart((current) => current.filter((item) => item.key !== key));
  const clearCart = () => setCart([]);
  return {
    products,
    setProducts,
    productsLoaded,
    productsSyncError,
    importLocalProducts,
    cart,
    add,
    changeQty,
    remove,
    clearCart,
  };
}

function Brand({ light = false }) {
  return (
    <Link
      to="/"
      className={`brandmark ${light ? "brandmark-light" : ""}`}
      aria-label="PRIME Streetwear"
    >
      <span>PRIME</span>
      <small>STREETWEAR</small>
    </Link>
  );
}

function Header({ count }) {
  const [open, setOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  return (
    <>
      <div className="announcement">
        <span>THE NEW STANDARD OF EVERYDAY WEAR</span>
        <span className="announcement-right">
          FREE SHIPPING ON ORDERS OVER EGP 1,500 <ArrowUpRight size={12} />
        </span>
      </div>
      <header className="site-header">
        <div className="header-inner page-shell">
          <button
            className="icon-button mobile-menu"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
          <Brand />
          <nav className={`main-nav ${open ? "nav-open" : ""}`}>
            <Link onClick={() => setOpen(false)} to="/shop">
              {tr("Shop all", lang)}
            </Link>
            <Link onClick={() => setOpen(false)} to="/shop?category=T-Shirts">
              {tr("T-shirts", lang)}
            </Link>
            <Link onClick={() => setOpen(false)} to="/shop?category=Pants">
              {tr("Pants", lang)}
            </Link>
            <a onClick={() => setOpen(false)} href="#story">
              {tr("Our story", lang)}
            </a>
          </nav>
          <div className="header-actions">
            <Link className="account-link" to="/account" aria-label={lang === "ar" ? "حسابي" : "My account"}>
              <UserRound size={17} />
              <span>{lang === "ar" ? "حسابي" : "Account"}</span>
            </Link>
            <button
              className="language-toggle"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              aria-label="Change language"
            >
              <Globe size={16} /> {lang === "en" ? "العربية" : "English"}
            </button>
            <Link className="bag-link" to="/cart" aria-label="Shopping bag">
              <ShoppingBag size={20} />
              <span>{tr("Bag", lang)}</span>
              <b>{count}</b>
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

function CustomerAccount() {
  const { lang } = useLanguage();
  const isArabic = lang === "ar";
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    getSession().then((value) => {
      setSession(value);
      setName(value?.user?.user_metadata?.full_name || "");
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, value) => {
      setSession(value);
      setName(value?.user?.user_metadata?.full_name || "");
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      setOrders([]);
      return;
    }
    let active = true;
    setOrdersLoading(true);
    fetchCustomerOrders(session.user.id)
      .then((rows) => active && setOrders(rows))
      .catch((error) => {
        console.error("Could not load customer orders", error);
        if (active) setNotice(isArabic ? "تعذّر تحميل الطلبات. حاول تحديث الصفحة." : "Could not load orders. Please refresh the page.");
      })
      .finally(() => active && setOrdersLoading(false));
    return () => { active = false; };
  }, [session?.user?.id, isArabic]);

  const submit = async (event) => {
    event.preventDefault();
    if (!remoteEnabled) return setNotice(isArabic ? "تسجيل العملاء يحتاج اتصال Supabase." : "Customer accounts need the Supabase connection.");
    setSubmitting(true);
    setNotice("");
    if (mode === "signup") {
      const result = await signUpCustomer(email.trim(), password, name.trim());
      setSubmitting(false);
      if (result.error) return setNotice(result.error);
      setPassword("");
      setNotice(result.needsConfirmation
        ? (isArabic ? "تم إنشاء الحساب. افتح رسالة التأكيد في بريدك ثم سجّل الدخول." : "Account created. Confirm your email, then sign in.")
        : (isArabic ? "تم إنشاء الحساب وتسجيل الدخول." : "Account created and signed in."));
      return;
    }
    const error = await signIn(email.trim(), password);
    setSubmitting(false);
    if (error) return setNotice(error === "Invalid login credentials"
      ? (isArabic ? "الإيميل أو كلمة السر غير صحيحة." : "Email or password is incorrect.")
      : error);
    setPassword("");
  };

  const signOut = async () => {
    await signOutAdmin();
    setOrders([]);
    setNotice("");
  };

  if (loading) return <main className="manage-login"><p>{isArabic ? "جارٍ التحميل…" : "Loading…"}</p></main>;

  if (!remoteEnabled || !session)
    return (
      <main className="manage-login">
        <div className="manage-login-card customer-auth-card">
          <Brand />
          <span className="section-kicker">{isArabic ? "حساب العميل" : "CUSTOMER ACCOUNT"}</span>
          <h1>{mode === "signup" ? (isArabic ? "أنشئ حسابك" : "Create your account") : (isArabic ? "أهلًا بعودتك" : "Welcome back")}</h1>
          <p>{isArabic ? "سجّل الدخول لمتابعة طلباتك من مكان واحد." : "Sign in to keep track of your orders in one place."}</p>
          <form onSubmit={submit}>
            {mode === "signup" && <label>{isArabic ? "الاسم" : "YOUR NAME"}
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
            </label>}
            <label>{isArabic ? "البريد الإلكتروني" : "EMAIL"}
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label>{isArabic ? "كلمة السر" : "PASSWORD"}
              <input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required />
            </label>
            <button className="add-to-bag" disabled={submitting}>{submitting ? (isArabic ? "لحظة…" : "PLEASE WAIT…") : mode === "signup" ? (isArabic ? "إنشاء حساب" : "CREATE ACCOUNT") : (isArabic ? "تسجيل الدخول" : "SIGN IN")} <ArrowRight size={16} /></button>
          </form>
          <button className="back-store customer-auth-toggle" type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setNotice(""); }}>
            {mode === "signup" ? (isArabic ? "عندك حساب؟ سجّل الدخول" : "Already have an account? Sign in") : (isArabic ? "عميل جديد؟ أنشئ حسابًا" : "New customer? Create an account")}
          </button>
          {notice && <p className="admin-notice">{notice}</p>}
          <Link className="back-store" to="/">{isArabic ? "العودة للمتجر" : "Back to store"}</Link>
        </div>
      </main>
    );

  return (
    <main className="customer-account page-shell">
      <div className="customer-account-heading">
        <div>
          <span className="section-kicker">{isArabic ? "حساب العميل" : "YOUR ACCOUNT"}</span>
          <h1>{isArabic ? "أهلًا، " : "Welcome, "}<em>{name || (isArabic ? "عميلنا" : "there")}</em></h1>
          <p className="customer-account-email">{session.user.email}</p>
        </div>
        <button className="back-store" onClick={signOut}>{isArabic ? "تسجيل الخروج" : "Sign out"}</button>
      </div>
      <form className="customer-profile" onSubmit={async (event) => {
        event.preventDefault();
        if (!name.trim()) return setNotice(isArabic ? "اكتب اسمك أولًا." : "Enter your name first.");
        const error = await updateAccount({ name: name.trim() });
        if (error) return setNotice(error);
        setNotice(isArabic ? "تم حفظ اسمك." : "Your name has been saved.");
      }}>
        <label>{isArabic ? "اسمك" : "YOUR NAME"}
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder={isArabic ? "اكتب اسمك" : "Enter your name"} required />
        </label>
        <button className="button button-dark" type="submit">{isArabic ? "حفظ الاسم" : "Save name"}</button>
      </form>
      <section className="customer-orders">
        <h2>{isArabic ? "طلباتي" : "My orders"}</h2>
        {ordersLoading ? <p>{isArabic ? "جارٍ تحميل الطلبات…" : "Loading your orders…"}</p> : orders.length ? orders.map((order) => (
          <article className="admin-order-card customer-order-card" key={order.id}>
            <div className="admin-order-head"><strong>{order.id}</strong><span>{new Date(order.createdAt || Date.now()).toLocaleString(isArabic ? "ar-EG" : "en-EG")}</span><strong>{money(order.total)}</strong></div>
            <p>{isArabic ? "حالة الطلب:" : "Order status:"} {order.status || "Pending"} · {isArabic ? "الدفع:" : "Payment:"} {order.paymentStatus || "Pending review"}</p>
            <ul>{(order.items || []).map((item, index) => <li key={`${item.key || item.id || item.name}-${index}`}>{item.name} × {item.qty || 1}{item.size ? ` · ${item.size}` : ""}</li>)}</ul>
          </article>
        )) : <p>{isArabic ? "لسه مفيش طلبات مرتبطة بالحساب. الطلبات الجديدة هتظهر هنا." : "No orders are linked to this account yet. New orders will appear here."}</p>}
        {notice && <p className="admin-notice">{notice}</p>}
      </section>
      <Link className="button button-dark customer-shop-link" to="/shop">{isArabic ? "متابعة التسوق" : "Continue shopping"} <ArrowRight size={16} /></Link>
    </main>
  );
}

function Footer() {
  const navigate = useNavigate();
  const [helpDialog, setHelpDialog] = useState("");
  const helpContent = readHelpContent();
  const taps = useRef({ n: 0, t: 0 });
  const secretTap = () => {
    const now = Date.now();
    taps.current = {
      n: now - taps.current.t < 2500 ? taps.current.n + 1 : 1,
      t: now,
    };
    if (taps.current.n >= 5) {
      taps.current.n = 0;
      navigate(siteConfig.adminPath);
    }
  };
  const wa = getWhatsapp();
  const helpWhatsapp = String(helpContent.contactWhatsapp || wa).replace(/[^0-9]/g, "");
  const contactHref = helpWhatsapp
    ? `https://wa.me/${helpWhatsapp}`
    : helpContent.contactEmail
      ? `mailto:${helpContent.contactEmail}`
      : "#help-contact";
  const social = readPaymentDetails();
  return (
    <footer className="site-footer" id="story">
      <div className="footer-top page-shell">
        <div className="footer-brand">
          <Brand light />
          <p>
            Everyday pieces. Better made.
            <br />
            Designed to move with you.
          </p>
          <div className="social-row">
            {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            )}
            {social.tiktok && (
              <a
                href={social.tiktok}
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
            )}
            {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
            )}
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            )}
          </div>
        </div>
        <div className="footer-column">
          <span className="footer-label">EXPLORE</span>
          <Link to="/shop">Shop all</Link>
          <Link to="/shop?category=T-Shirts">T-shirts</Link>
          <Link to="/shop?category=Pants">Pants</Link>
        </div>
        <div className="footer-column">
          <span className="footer-label">NEED HELP?</span>
          <a
            href={contactHref}
            target={helpWhatsapp ? "_blank" : undefined}
            rel={helpWhatsapp ? "noreferrer" : undefined}
            onClick={(event) => {
              if (!helpWhatsapp && !helpContent.contactEmail) {
                event.preventDefault();
                setHelpDialog("contact");
              }
            }}
          >Contact us</a>
          <button className="footer-help-link" onClick={() => setHelpDialog("shipping")}>Shipping &amp; delivery</button>
          <button className="footer-help-link" onClick={() => setHelpDialog("returns")}>Returns &amp; exchanges</button>
        </div>
        <div className="footer-news">
          <span className="footer-label">THE PRIME LIST</span>
          <h3>
            Good things
            <br />
            are on the way.
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.currentTarget.reset();
              alert("Thanks for joining the list.");
            }}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              aria-label="Email address"
            />
            <button aria-label="Subscribe">
              <ArrowRight size={18} />
            </button>
          </form>
          <small>New drops. No noise. Just the good stuff.</small>
        </div>
      </div>
      <div className="footer-bottom page-shell">
        <span
          onClick={secretTap}
          style={{ cursor: "default", userSelect: "none" }}
        >
          © 2026 PRIME STREETWEAR
        </span>
        <span>BUILT FOR THE EVERYDAY.</span>
        <a href="#top">BACK TO TOP ↑</a>
      </div>
      {helpDialog && (
        <div className="help-dialog-backdrop" onClick={() => setHelpDialog("")}>
          <section
            id={helpDialog === "contact" ? "help-contact" : undefined}
            className="help-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="help-dialog-close" onClick={() => setHelpDialog("")} aria-label="Close">×</button>
            <span className="footer-label">NEED HELP?</span>
            <h2 id="help-dialog-title">{helpDialog === "shipping" ? "Shipping & delivery" : helpDialog === "returns" ? "Returns & exchanges" : "Contact us"}</h2>
            <p>{helpDialog === "shipping"
              ? helpContent.shipping
              : helpDialog === "returns"
                ? helpContent.returns
                : "Contact details are not set yet. Please check back soon."}</p>
            {helpDialog === "contact" && helpContent.contactEmail && <a href={`mailto:${helpContent.contactEmail}`}>{helpContent.contactEmail}</a>}
            {helpDialog === "contact" && helpWhatsapp && <a href={`https://wa.me/${helpWhatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </section>
        </div>
      )}
    </footer>
  );
}

function ProductVisual({ product, index = 0, className = "" }) {
  const images = Array.isArray(product.images)
    ? product.images
    : product.image
      ? [product.image]
      : [];
  return (
    <div className={`product-photo ${className}`}>
      {images[0] ? (
        <img src={images[0]} alt={product.name} loading="lazy" />
      ) : (
        <div className="image-placeholder">
          <span className="placeholder-index">
            PRIME / {String(index + 1).padStart(2, "0")}
          </span>
          <span className="placeholder-mark">
            P<span>—</span>
          </span>
          <span className="placeholder-category">
            {product.category || "EVERYDAY ESSENTIALS"}
          </span>
        </div>
      )}
      <span className="photo-index">{String(index + 1).padStart(2, "0")}</span>
      {product.badge && <span className="product-badge">{product.badge}</span>}
      <span className="quick-view">
        VIEW PROUDUCT <ArrowUpRight size={15} />
      </span>
    </div>
  );
}

function ProductCard({ product, index = 0 }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="product-card reveal"
      style={{ "--delay": `${index * 70}ms` }}
    >
      <ProductVisual product={product} index={index} />
      {product.inStock === false && (
        <span className="product-stock-out">OUT OF STOCK</span>
      )}
      <div className="product-meta">
        <div>
          <span className="product-category">
            {product.category} / PRIME ESSENTIALS
          </span>
          <h3>{product.name}</h3>
          <span className="product-color">
            {product.color || "Everyday fit"}
          </span>
        </div>
        <div className="product-prices">
          <strong>{money(product.price)}</strong>
          {product.oldPrice > product.price && (
            <del>{money(product.oldPrice)}</del>
          )}
        </div>
      </div>
    </Link>
  );
}

const collectionCategories = [
  { name: "Pants", number: "01", note: "Relaxed fits. Everyday movement." },
  { name: "T-Shirts", number: "02", note: "The pieces you reach for most." },
  { name: "Hoodies", number: "03", note: "Comfort with a cleaner silhouette." },
  { name: "Outerwear", number: "04", note: "Layers that complete the look." },
];

function Home({ products }) {
  const { lang } = useLanguage();
  const featured = products.slice(0, 4);
  const homeCategories = readStored(
    "prime_categories",
    collectionCategories.map((c) => ({ ...c, image: "" })),
  ).map((c, i) =>
    typeof c === "string"
      ? {
          name: c,
          number: String(i + 1).padStart(2, "0"),
          note: "Explore the collection.",
          image: "",
        }
      : {
          ...c,
          number: c.number || String(i + 1).padStart(2, "0"),
          note: c.note || "Explore the collection.",
        },
  );
  return (
    <main id="top">
      <section className="hero-section">
        <div className="hero-backdrop">
          <div className="hero-ghost-logo">PRIME</div>
          <div className="hero-panel-shape hero-panel-one" />
          <div className="hero-panel-shape hero-panel-two" />
          <div className="hero-glow" />
        </div>
        <div className="hero-content page-shell">
          <div className="hero-eyebrow">
            <span className="eyebrow-line" /> NEW SEASON / 2026
          </div>
          <h1>
            {lang === "ar" ? (
              <>
                قطع يومية.
                <br />
                <em>بجودة أفضل.</em>
              </>
            ) : (
              <>
                Everyday pieces.
                <br />
                <em>Better made.</em>
              </>
            )}
          </h1>
          <p>
            {lang === "ar"
              ? "تصميمات بسيطة ومريحة وقطع أساسية بجودة عالية لخزانة ملابسك اليومية."
              : "Clean silhouettes, comfortable fits and quality essentials built for your everyday wardrobe."}
          </p>
          <div className="hero-buttons">
            <Link className="button button-light" to="/shop">
              {lang === "ar" ? "تسوق المجموعة" : "Shop collection"}{" "}
              <ArrowUpRight size={16} />
            </Link>
            <Link
              className="button button-outline-light"
              to="/shop?category=Pants"
            >
              {lang === "ar" ? "اكتشف البنطلونات" : "Explore pants"}{" "}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="hero-bottom-note">
            <span>01 / THE EVERYDAY COLLECTION</span>
            <span>
              DESIGNED WITH INTENTION <ArrowDownRight size={14} />
            </span>
          </div>
        </div>
        <div className="hero-side-label">PRIME — EST. 2026</div>
        <div className="hero-art-caption">
          NO ARTIFICIAL CAMPAIGN IMAGES <span>MONOCHROME / BURGUNDY</span>
        </div>
      </section>
      <section className="ticker" aria-label="Brand values">
        <div className="ticker-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              LESS, BUT BETTER <Sparkles size={14} /> MADE FOR EVERYDAY{" "}
              <Sparkles size={14} /> PRIME STREETWEAR <Sparkles size={14} />
            </span>
          ))}
        </div>
      </section>
      <section className="category-section page-shell">
        <div className="section-heading">
          <div>
            <span className="section-kicker">SHOP BY CATEGORY / 001</span>
            <h2>
              Find your
              <br />
              <em>everyday.</em>
            </h2>
          </div>
          <div className="section-heading-side">
            <p>
              {lang === "ar"
                ? "اختر قسمًا واستكشف المجموعة."
                : "Choose a category and explore the collection."}
            </p>
            <Link className="text-link" to="/shop">
              DISCOVER ALL PIECES <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="category-grid">
          {homeCategories.map((c) => (
            <Link
              key={c.name}
              className={`category-tile ${c.image ? "has-cover" : ""}`}
              to={`/shop?category=${encodeURIComponent(c.name)}`}
            >
              {c.image && (
                <img
                  className="category-cover-image"
                  src={c.image}
                  alt={c.name}
                />
              )}
              <div className="category-tile-top">
                <span>{c.number} / COLLECTION</span>
                <ArrowUpRight size={18} />
              </div>
              <div className="category-tile-mark">
                {c.image
                  ? ""
                  : c.name === "T-Shirts"
                    ? "TEE"
                    : c.name.toUpperCase()}
              </div>
              <div className="category-tile-bottom">
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.note}</p>
                </div>
                <span className="category-tile-arrow">
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="collection-section page-shell">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE CURRENT ROTATION / 002</span>
            <h2>
              Pieces worth
              <br />
              <em>reaching for.</em>
            </h2>
          </div>
          <div className="section-heading-side">
            <p>
              Considered essentials. Easy layers.
              <br />
              Your everyday, elevated.
            </p>
            <Link className="text-link" to="/shop">
              DISCOVER ALL PIECES <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        {featured.length ? (
          <div className="product-grid">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2>New pieces are on the way.</h2>
            <p>Products added in management will appear here.</p>
          </div>
        )}
        <div className="center-cta">
          <Link className="button button-dark" to="/shop">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="values-section page-shell">
        <div className="value-intro">
          <span className="section-kicker">THE PRIME APPROACH</span>
          <h2>
            Good design
            <br />
            doesn't need
            <br />
            <em>to shout.</em>
          </h2>
        </div>
        <div className="value-list">
          <div className="value-row">
            <span>01</span>
            <div>
              <h3>Considered fit</h3>
              <p>Comfortable shapes with a clean, intentional silhouette.</p>
            </div>
            <ArrowUpRight size={19} />
          </div>
          <div className="value-row">
            <span>02</span>
            <div>
              <h3>Everyday versatility</h3>
              <p>Easy pieces that work together and work harder.</p>
            </div>
            <ArrowUpRight size={19} />
          </div>
          <div className="value-row">
            <span>03</span>
            <div>
              <h3>Made to be worn</h3>
              <p>Less overthinking. More living in what feels right.</p>
            </div>
            <ArrowUpRight size={19} />
          </div>
        </div>
      </section>
    </main>
  );
}

function Shop({ products }) {
  const { lang } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("featured");
  useEffect(() => setCategory(params.get("category") || "All"), [params]);
  const categories = [
    "All",
    ...readStored("prime_categories", [
      "T-Shirts",
      "Pants",
      "Hoodies",
      "Outerwear",
    ]).map((c) => (typeof c === "string" ? c : c.name)),
  ];
  const shown = useMemo(() => {
    let list = products.filter(
      (p) => category === "All" || p.category === category,
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, category, sort]);
  return (
    <main className="shop-page page-shell">
      <div className="shop-title-row">
        <div>
          <span className="section-kicker">THE PRIME COLLECTION</span>
          <h1>
            {lang === "ar" ? (
              <>
                اكتشف <em>أسلوبك.</em>
              </>
            ) : (
              <>
                Find your <em>uniform.</em>
              </>
            )}
          </h1>
          <p>
            {lang === "ar"
              ? "أساسيات يومية، بدون إضافات زائدة."
              : "Everyday essentials. Nothing extra."}
          </p>
        </div>
        <div className="shop-count">
          {String(shown.length).padStart(2, "0")} <span>PIECES</span>
        </div>
      </div>
      <div className="shop-toolbar">
        <div className="category-filters">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "filter-pill active" : "filter-pill"}
              onClick={() => {
                setCategory(c);
                setParams(c === "All" ? {} : { category: c });
              }}
            >
              {lang === "ar"
                ? {
                    All: "الكل",
                    "T-Shirts": "تيشيرتات",
                    Pants: "بنطلونات",
                    Hoodies: "هوديز",
                    Outerwear: "ملابس خارجية",
                  }[c] || c
                : c}
            </button>
          ))}
        </div>
        <div className="shop-tools">
          <label className="sort-control">
            <SlidersHorizontal size={15} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
            >
              <option value="featured">
                {lang === "ar" ? "الأبرز" : "Featured"}
              </option>
              <option value="low">
                {lang === "ar"
                  ? "السعر: من الأقل للأعلى"
                  : "Price: low to high"}
              </option>
              <option value="high">
                {lang === "ar"
                  ? "السعر: من الأعلى للأقل"
                  : "Price: high to low"}
              </option>
            </select>
            <ChevronDown size={14} />
          </label>
        </div>
      </div>
      {shown.length ? (
        <div className="product-grid shop-grid">
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ShoppingBag size={28} />
          <h2>{lang === "ar" ? "لا توجد منتجات." : "No pieces found."}</h2>
          <p>{lang === "ar" ? "جرّب قسمًا آخر." : "Try another category."}</p>
          <button
            className="button button-dark"
            onClick={() => {
              setCategory("All");
              setParams({});
            }}
          >
            {lang === "ar" ? "مسح التصفية" : "Clear filters"}
          </button>
        </div>
      )}
    </main>
  );
}

function ProductDetails({ products, add }) {
  const { lang } = useLanguage();
  const { id } = useParams();
  const product = products.find((p) => String(p.id) === id);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const images = Array.isArray(product?.images)
    ? product.images
    : product?.image
      ? [product.image]
      : [];
  if (!product)
    return (
      <main className="page-shell not-found">
        <h1>Piece not found.</h1>
        <Link className="text-link" to="/shop">
          Back to shop <ArrowRight size={16} />
        </Link>
      </main>
    );
  return (
    <main className="detail-page page-shell">
      <div className="breadcrumbs">
        <Link to="/">HOME</Link>
        <span>/</span>
        <Link to="/shop">SHOP</Link>
        <span>/</span>
        <span>{product.name.toUpperCase()}</span>
      </div>
      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-image">
            {images[activeImage] ? (
              <img
                src={images[activeImage]}
                alt={`${product.name} view ${activeImage + 1}`}
              />
            ) : (
              <div className="detail-image-placeholder">
                <span>PRIME</span>
                <small>
                  {product.category} / {String(product.id).padStart(3, "0")}
                </small>
              </div>
            )}
            <span className="detail-image-label">
              PRIME ESSENTIALS / {String(product.id).padStart(3, "0")}
            </span>
          </div>
          {images.length > 1 && (
            <div className="detail-thumbnails">
              {images.map((src, i) => (
                <button
                  type="button"
                  key={`${src}-${i}`}
                  className={activeImage === i ? "active" : ""}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                >
                  <img src={src} alt={`${product.name} thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="detail-info">
          <span className="section-kicker">
            {product.category} / THE EVERYDAY COLLECTION
          </span>
          <h1>{product.name}</h1>
          <div className="detail-price">
            {money(product.price)}{" "}
            {product.oldPrice > product.price && (
              <del>{money(product.oldPrice)}</del>
            )}
          </div>
          <p className="detail-description">
            Clean lines. Easy comfort. A considered everyday essential designed
            to fit into your rotation and stay there.
          </p>
          <div className="detail-divider" />
          <div className="option-heading">
            <span>SELECT SIZE</span>
            <button onClick={() => setShowSizeGuide(true)}>SIZE GUIDE ↗</button>
          </div>
          <div className="size-options">
            {["S", "M", "L", "XL", "XXL"].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={size === s ? "size-option selected" : "size-option"}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="option-heading quantity-heading">
            <span>QUANTITY</span>
            <span
              className={product.inStock === false ? "stock-out" : "stock-in"}
            >
              {product.inStock === false ? "OUT OF STOCK" : "IN STOCK"}
            </span>
          </div>
          <div className="quantity-control">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={15} />
            </button>
            <span>{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
            >
              <Plus size={15} />
            </button>
          </div>
          <button
            className="add-to-bag"
            disabled={product.inStock === false}
            onClick={() => {
              add(product, qty, size);
              setAdded(true);
              setTimeout(() => setAdded(false), 1800);
            }}
          >
            {added ? (
              <>
                <Check size={18} /> ADDED TO BAG
              </>
            ) : (
              <>
                {product.inStock === false ? (
                  lang === "ar" ? (
                    "غير متوفر"
                  ) : (
                    "OUT OF STOCK"
                  )
                ) : (
                  <>
                    {lang === "ar" ? "أضف للسلة" : "ADD TO BAG"}{" "}
                    <span>{money(product.price * qty)}</span>
                  </>
                )}
              </>
            )}
          </button>
          {showSizeGuide && (
            <div
              className="modal-backdrop"
              role="presentation"
              onClick={() => setShowSizeGuide(false)}
            >
              <section
                className="size-guide-modal"
                role="dialog"
                aria-modal="true"
                aria-label="Size guide"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close"
                  onClick={() => setShowSizeGuide(false)}
                  aria-label="Close"
                >
                  <X />
                </button>
                <span className="section-kicker">PRIME / FIT GUIDE</span>
                <h2>Size Guide</h2>
                {product.sizeGuideImage ? (
                  <img
                    className="size-guide-upload"
                    src={product.sizeGuideImage}
                    alt="Size guide"
                  />
                ) : product.sizeGuide?.length ? (
                  <table className="size-guide-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest (cm)</th>
                        <th>Length (cm)</th>
                        <th>Sleeve (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.sizeGuide.map((r, i) => (
                        <tr key={i}>
                          <td>{r.size}</td>
                          <td>{r.chest || "—"}</td>
                          <td>{r.length || "—"}</td>
                          <td>{r.sleeve || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>
                    Size information has not been added for this product yet.
                  </p>
                )}
              </section>
            </div>
          )}
          <div className="detail-benefits">
            <div>
              <span>01</span>
              <p>Reliable delivery across Egypt</p>
            </div>
            <div>
              <span>02</span>
              <p>Easy exchange on eligible items</p>
            </div>
            <div>
              <span>03</span>
              <p>Designed for everyday wear</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Cart({ cart, changeQty, remove, clearCart }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const total = cart.reduce((sum, p) => sum + p.price * p.qty, 0);
  const [checkout, setCheckout] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    governorate: "",
    area: "",
    address: "",
    notes: "",
  });
  const [payment, setPayment] = useState("instapay");
  const [transferRef, setTransferRef] = useState("");
  const [proof, setProof] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  useEffect(() => {
    if (!remoteEnabled) return;
    getSession().then((session) => {
      const accountEmail = session?.user?.email;
      if (accountEmail) setCustomer((current) => ({ ...current, email: current.email || accountEmail }));
    });
  }, []);
  const storePaymentDetails = readPaymentDetails();
  const shipping = parseShipping(storePaymentDetails.shippingFee);
  const cartMessage = String(storePaymentDetails.cartMessage || "")
    .trim()
    .replace(
      /\{(\w+)\}/g,
      (m, k) =>
        ({
          shipping: shipping.toLocaleString("en-EG"),
          subtotal: total.toLocaleString("en-EG"),
          total: (total + shipping).toLocaleString("en-EG"),
          instapay: storePaymentDetails.instapay,
          wallet: storePaymentDetails.wallet,
        })[k] ?? m,
    );
  const selectedPaymentDetails =
    payment === "instapay"
      ? storePaymentDetails.instapay
      : payment === "wallet"
        ? storePaymentDetails.wallet
        : payment === "bank"
          ? storePaymentDetails.bank
          : "Contact the store to confirm an available method.";
  const update = (e) =>
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  const saveOrder = async (e) => {
    e.preventDefault();
    if (!cart.length || placing) return;
    setPlacing(true);
    setOrderError("");
    let proofUrl = proof;
    if (remoteEnabled && isDataUrl(proof)) {
      try {
        proofUrl = await uploadDataUrl(proof, "proofs");
      } catch {
        proofUrl = "";
      }
    }
    const order = {
      id: `PS-${Date.now().toString().slice(-7)}`,
      notificationToken: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      customer,
      items: cart,
      subtotal: total,
      shipping,
      total: total + shipping,
      payment,
      transferRef,
      proof: proofUrl,
      lang,
      paymentStatus: "Pending review",
      status: "Pending payment",
    };
    if (remoteEnabled) {
      try {
        const session = await getSession();
        await insertOrder(order, session?.user?.id || null);
      } catch (err) {
        console.error(err);
        setPlacing(false);
        const technicalDetails = import.meta.env.DEV && err?.message
          ? `\n${err.message}`
          : "";
        setOrderError(
          (lang === "ar"
            ? "تعذّر حفظ الطلب في قاعدة البيانات."
            : "We could not save the order to the database.") + technicalDetails,
        );
        return;
      }
    } else {
      const orders = readStored("prime_orders", []);
      localStorage.setItem("prime_orders", JSON.stringify([order, ...orders]));
    }
    if (remoteEnabled)
      notifyOrderByEmail(order.id, order.notificationToken).catch((err) =>
        console.error("Order email notification failed", err),
      );
    clearCart();
    setPlacing(false);
    setConfirmedOrder(order);
  };
  if (confirmedOrder)
    return (
      <main className="checkout-page page-shell">
        <div className="checkout-success">
          <Check size={34} />
          <span className="section-kicker">{tr("ORDER RECEIVED", lang)}</span>
          <h1>{tr("Thank you for your order.", lang)}</h1>
          <p>
            {tr("Your reference is", lang)} <strong>{confirmedOrder.id}</strong>
            .{" "}
            {tr(
              "Your order is pending payment review. We will confirm it after checking the transfer.",
              lang,
            )}
          </p>
          <div className="payment-instructions">
            <strong>{tr("Transfer details", lang)}</strong>
            <p>
              {tr("Shipping fee to transfer now", lang)}:{" "}
              <strong>{money(confirmedOrder.shipping)}</strong>
            </p>
            {paymentLines(storePaymentDetails, confirmedOrder.payment, "en")
              .length ? (
              paymentLines(
                storePaymentDetails,
                confirmedOrder.payment,
                lang,
              ).map((l) => (
                <p key={l} className="payment-line">
                  <span>{l}</span>
                  <CopyValue value={l.split(": ").slice(1).join(": ")} />
                </p>
              ))
            ) : (
              <p>
                <strong>
                  {tr(
                    "Store payment details have not been configured yet.",
                    lang,
                  )}
                </strong>{" "}
                {tr("Contact the store before transferring money.", lang)}
              </p>
            )}
            <p>
              {tr("Add the transfer reference to help us review it.", lang)}
            </p>
          </div>
          <button className="button button-dark" onClick={() => navigate("/")}>
            {tr("Back to storefront", lang)} <ArrowRight size={16} />
          </button>
        </div>
      </main>
    );
  return (
    <main className="cart-page page-shell">
      <div className="cart-heading">
        <div>
          <span className="section-kicker">YOUR SELECTION</span>
          <h1>
            {lang === "ar" ? "سلتك" : "The bag"}
            <span>.</span>
          </h1>
        </div>
        <span>
          {String(cart.reduce((n, p) => n + p.qty, 0)).padStart(2, "0")}{" "}
          {tr("ITEMS", lang)}
        </span>
      </div>
      {!cart.length ? (
        <div className="empty-state cart-empty">
          <ShoppingBag size={30} />
          <h2>{tr("Your bag is waiting.", lang)}</h2>
          <p>{tr("Find the pieces that feel like you.", lang)}</p>
          <Link className="button button-dark" to="/shop">
            {tr("Explore the collection", lang)} <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map((item) => (
              <article className="cart-item" key={item.key}>
                <Link className="cart-item-photo" to={`/product/${item.id}`}>
                  {item.images?.[0] || item.image ? (
                    <img src={item.images?.[0] || item.image} alt={item.name} />
                  ) : (
                    <span className="cart-placeholder">PRIME</span>
                  )}
                </Link>
                <div className="cart-item-info">
                  <span className="product-category">{item.category}</span>
                  <Link to={`/product/${item.id}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <span className="cart-size">
                    {tr("SIZE", lang)}: {item.size}
                  </span>
                  <div className="cart-item-bottom">
                    <div className="quantity-control small-quantity">
                      <button
                        onClick={() => changeQty(item.key, -1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        onClick={() => changeQty(item.key, 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => remove(item.key)}
                    >
                      <Trash2 size={14} /> {tr("REMOVE", lang)}
                    </button>
                  </div>
                </div>
                <strong className="cart-line-total">
                  {money(item.price * item.qty)}
                </strong>
              </article>
            ))}
          </div>
          <aside className="order-summary">
            <span className="section-kicker">{tr("THE DETAILS", lang)}</span>
            <h2>{tr("Order summary", lang)}</h2>
            <div className="summary-line">
              <span>{tr("Subtotal", lang)}</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="summary-line">
              <span>{tr("Shipping", lang)}</span>
              <strong>{money(shipping)}</strong>
            </div>
            <div className="summary-total">
              <span>{tr("TOTAL", lang)}</span>
              <strong>{money(total + shipping)}</strong>
            </div>
            {(storePaymentDetails.instapay ||
              storePaymentDetails.wallet ||
              cartMessage) && (
              <div className="payment-instructions cart-pay-box">
                {cartMessage ? (
                  <strong className="cart-message">{cartMessage}</strong>
                ) : (
                  <strong>
                    {tr("Pay the shipping fee to", lang)} — {money(shipping)}
                  </strong>
                )}
                {storePaymentDetails.instapay && (
                  <p className="payment-line">
                    <span>
                      {tr("InstaPay", lang)}:{" "}
                      <b dir="ltr">{storePaymentDetails.instapay}</b>
                    </span>
                    <CopyValue value={storePaymentDetails.instapay} />
                  </p>
                )}
                {storePaymentDetails.wallet && (
                  <p className="payment-line">
                    <span>
                      {tr("Mobile wallet", lang)}:{" "}
                      <b dir="ltr">{storePaymentDetails.wallet}</b>
                    </span>
                    <CopyValue value={storePaymentDetails.wallet} />
                  </p>
                )}
              </div>
            )}
            {!checkout ? (
              <button
                className="add-to-bag checkout-button"
                onClick={() => setCheckout(true)}
              >
                {tr("CONTINUE TO CHECKOUT", lang)} <ArrowRight size={17} />
              </button>
            ) : (
              <form className="checkout-form" onSubmit={saveOrder}>
                <span className="section-kicker">
                  {tr("DELIVERY DETAILS", lang)}
                </span>
                <h3>{tr("Where should we deliver?", lang)}</h3>
                <label>
                  {tr("Full name", lang)}
                  <input
                    name="name"
                    value={customer.name}
                    onChange={update}
                    required
                    autoComplete="name"
                  />
                </label>
                <div className="manage-form-row">
                  <label>
                    {tr("Mobile number", lang)}
                    <input
                      name="phone"
                      value={customer.phone}
                      onChange={update}
                      required
                      type="tel"
                      autoComplete="tel"
                    />
                  </label>
                  <label>
                    {tr("Email (optional)", lang)}
                    <input
                      name="email"
                      value={customer.email}
                      onChange={update}
                      type="email"
                      autoComplete="email"
                    />
                  </label>
                </div>
                <div className="manage-form-row">
                  <label>
                    {tr("Governorate", lang)}
                    <input
                      name="governorate"
                      value={customer.governorate}
                      onChange={update}
                      required
                    />
                  </label>
                  <label>
                    {tr("Area / district", lang)}
                    <input
                      name="area"
                      value={customer.area}
                      onChange={update}
                      required
                    />
                  </label>
                </div>
                <label>
                  {tr("Full address", lang)}
                  <input
                    name="address"
                    value={customer.address}
                    onChange={update}
                    required
                    placeholder={tr("Street, building, floor, apartment", lang)}
                    autoComplete="street-address"
                  />
                </label>
                <label>
                  {tr("Order notes (optional)", lang)}
                  <textarea
                    name="notes"
                    value={customer.notes}
                    onChange={update}
                    rows="2"
                  />
                </label>
                <span className="section-kicker">
                  {tr("SHIPPING FEE PAYMENT", lang)}
                </span>
                <p className="checkout-note">
                  {tr(
                    "Transfer the shipping fee only. The order remains pending until the transfer is reviewed.",
                    lang,
                  )}
                </p>
                <label>
                  {tr("Payment method", lang)}
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                  >
                    <option value="instapay">{tr("InstaPay", lang)}</option>
                    <option value="wallet">{tr("Mobile wallet", lang)}</option>
                    <option value="bank">{tr("Bank transfer", lang)}</option>
                    <option value="other">
                      {tr("Other / confirm with store", lang)}
                    </option>
                  </select>
                </label>
                <label>
                  {tr("Transfer reference (if already paid)", lang)}
                  <input
                    value={transferRef}
                    onChange={(e) => setTransferRef(e.target.value)}
                    placeholder={tr("Transaction reference", lang)}
                  />
                </label>
                <label>
                  {tr("Transfer proof image (optional)", lang)}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        try {
                          setProof(await compressImage(f, 1400));
                        } catch {
                          setProof("");
                        }
                      }
                    }}
                  />
                </label>
                {proof && (
                  <img
                    className="proof-preview"
                    src={proof}
                    alt="Transfer proof preview"
                  />
                )}
                <div className="payment-instructions">
                  <strong>
                    {tr("Transfer details", lang)} —{" "}
                    {tr(
                      payment === "instapay"
                        ? "InstaPay"
                        : payment === "wallet"
                          ? "Mobile wallet"
                          : payment === "bank"
                            ? "Bank transfer"
                            : "Other method",
                      lang,
                    )}
                  </strong>
                  <p>
                    {selectedPaymentDetails ||
                      tr(
                        "Payment details have not been configured yet. Do not transfer money until the store shares verified details.",
                        lang,
                      )}
                  </p>
                  {cartMessage ? (
                    <p className="cart-message">
                      <strong>{cartMessage}</strong>
                    </p>
                  ) : (
                    <p>
                      {tr("Shipping fee to transfer:", lang)}{" "}
                      <strong>{money(shipping)}</strong>.{" "}
                      {tr(
                        "Your order remains pending until payment is reviewed.",
                        lang,
                      )}
                    </p>
                  )}
                </div>
                {orderError && (
                  <p className="admin-notice order-error">{orderError}</p>
                )}
                <button className="add-to-bag" type="submit" disabled={placing}>
                  {placing ? "…" : tr("PLACE ORDER — PENDING REVIEW", lang)}{" "}
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className="button button-outline-dark"
                  onClick={() => setCheckout(false)}
                >
                  {tr("Back to cart", lang)}
                </button>
              </form>
            )}
            <p className="checkout-note">
              {remoteEnabled
                ? ""
                : tr(
                    "Your order will be saved in this browser for this prototype. Shared order management requires the later backend connection.",
                    lang,
                  )}
            </p>
            <Link className="text-link" to="/shop">
              <ArrowLeft size={15} /> {tr("CONTINUE SHOPPING", lang)}
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}

function AccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const changeEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setMsg("Enter the new sign-in email.");
    setBusy(true);
    setMsg("");
    const err = await updateAccount({ email: email.trim() });
    setBusy(false);
    if (err) return setMsg(err);
    setMsg(
      "Confirmation link sent. Open the message sent by Supabase to confirm the new email.",
    );
    setEmail("");
  };
  const changePassword = async (e) => {
    e.preventDefault();
    if (password.length < 8)
      return setMsg("The password must be at least 8 characters.");
    if (password !== confirm) return setMsg("The two passwords do not match.");
    setBusy(true);
    setMsg("");
    const err = await updateAccount({ password });
    setBusy(false);
    if (err) return setMsg(err);
    setPassword("");
    setConfirm("");
    setMsg("Password changed successfully.");
  };
  return (
    <div className="manage-editor-grid">
      <form className="manage-form-card" onSubmit={changeEmail}>
        <div className="manage-card-heading">
          <div>
            <span className="section-kicker">SIGN-IN EMAIL</span>
            <h2>Change email</h2>
          </div>
        </div>
        <p className="upload-hint">
          Supabase sends a confirmation link. The new email takes effect after
          you open it.
        </p>
        <label>
          NEW EMAIL
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="new@example.com"
            autoComplete="email"
            required
          />
        </label>
        <button className="add-to-bag" disabled={busy}>
          SEND CONFIRMATION LINK <ArrowRight size={16} />
        </button>
      </form>
      <form className="manage-form-card" onSubmit={changePassword}>
        <div className="manage-card-heading">
          <div>
            <span className="section-kicker">SIGN-IN PASSWORD</span>
            <h2>Change password</h2>
          </div>
        </div>
        <label>
          NEW PASSWORD
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label>
          CONFIRM NEW PASSWORD
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <button className="add-to-bag" disabled={busy}>
          SAVE NEW PASSWORD <Check size={16} />
        </button>
      </form>
      {msg && <p className="admin-notice">{msg}</p>}
    </div>
  );
}

function OrderCard({ order, details, onChange, onDelete }) {
  const { lang: uiLang } = useLanguage();
  const [msgLang, setMsgLang] = useState(order.lang || "ar");
  const [override, setOverride] = useState(null);
  const generated = useMemo(
    () => buildOrderMessage(order, details, msgLang),
    [order, details, msgLang],
  );
  const message = override ?? generated;
  const phone = toWaNumber(order.customer.phone);
  const markPrepared = (channel) => onChange({
    messagePreparedAt: new Date().toISOString(),
    messageChannel: channel,
  });
  const validWhatsAppNumber = phone.length >= 8 && phone.length <= 15;
  const setShipping = (value) => {
    const fee = value === "" ? 0 : Math.max(0, Number(value) || 0);
    onChange({ shipping: fee, total: Number(order.subtotal || 0) + fee });
    setOverride(null);
  };
  return (
    <article className="admin-order-card">
      <div className="admin-order-head">
        <strong>{order.id}</strong>
        <span>{new Date(order.createdAt).toLocaleString()}</span>
        <strong>{money(order.total)}</strong>
      </div>
      <p>
        <b>{order.customer.name}</b> · {order.customer.phone} ·{" "}
        {order.customer.email || "No email"}
      </p>
      <p>
        {order.customer.governorate}, {order.customer.area},{" "}
        {order.customer.address}
      </p>
      <p>
        Payment: {order.payment} · Transfer ref:{" "}
        {order.transferRef || "Not provided"} · {order.paymentStatus}
      </p>
      {order.proof && (
        <a href={order.proof} target="_blank" rel="noreferrer">
          View transfer proof
        </a>
      )}
      <ul>
        {order.items.map((it, i) => (
          <li key={i}>
            {it.name} — {it.size} × {it.qty}
          </li>
        ))}
      </ul>
      <div className="admin-order-controls">
        <label>
          Order status
          <select
            value={order.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option>Pending payment</option>
            <option>Pending review</option>
            <option>Confirmed</option>
            <option>Preparing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Rejected</option>
            <option>Cancelled</option>
          </select>
        </label>
        <label>
          Payment review
          <select
            value={order.paymentStatus}
            onChange={(e) =>
              onChange({
                paymentStatus: e.target.value,
                status:
                  e.target.value === "Approved" ? "Confirmed" : order.status,
              })
            }
          >
            <option>Pending review</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </label>
      </div>
      <div className="order-message-box">
        <strong>{tr("Message to customer", uiLang)}</strong>
        <div className="admin-order-controls">
          <label>
            {tr("Shipping fee for this order (EGP)", uiLang)}
            <input
              type="number"
              min="0"
              value={order.shipping ?? 0}
              onChange={(e) => setShipping(e.target.value)}
            />
          </label>
          <label>
            {tr("Message language", uiLang)}
            <select
              value={msgLang}
              onChange={(e) => {
                setMsgLang(e.target.value);
                setOverride(null);
              }}
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>
        <textarea
          rows="10"
          value={message}
          onChange={(e) => setOverride(e.target.value)}
          dir={msgLang === "ar" ? "rtl" : "ltr"}
        />
        <p className="upload-hint">
          {tr("Edit the text freely before sending.", uiLang)}
        </p>
        <div className="order-message-actions">
          {validWhatsAppNumber ? (
            <a
              className="button button-dark"
              href={`https://wa.me/${phone}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => markPrepared("whatsapp")}
            >
              {tr("Send on WhatsApp", uiLang)} <MessageCircle size={15} />
            </a>
          ) : (
            <button
              type="button"
              className="button button-dark"
              disabled
              title={tr("Enter a valid customer phone number to use WhatsApp.", uiLang)}
            >
              {tr("Send on WhatsApp", uiLang)} <MessageCircle size={15} />
            </button>
          )}
          {order.customer.email && (
            <a
              className="button button-outline-dark"
              href={`mailto:${order.customer.email}?subject=${encodeURIComponent(`PRIME STREETWEAR — ${order.id}`)}&body=${encodeURIComponent(message)}`}
              onClick={() => markPrepared("email")}
            >
              {tr("Send by email", uiLang)}
            </a>
          )}
          <CopyValue value={message} label={tr("Copy message", uiLang)} />
          {override !== null && (
            <button
              type="button"
              className="copy-chip"
              onClick={() => setOverride(null)}
            >
              {tr("Reset message", uiLang)}
            </button>
          )}
        </div>
        {order.messagePreparedAt && (
          <p className="upload-hint">
            ✓ {tr(order.messageChannel === "whatsapp"
              ? "WhatsApp opened. Review the message and press Send in WhatsApp."
              : "Email draft opened. Send it from your email app.", uiLang)} ·{" "}
            {new Date(order.messagePreparedAt).toLocaleString()}
          </p>
        )}
        {!order.messagePreparedAt && order.messageSentAt && (
          <p className="upload-hint">{tr("Message sent", uiLang)} · {new Date(order.messageSentAt).toLocaleString()}</p>
        )}
      </div>
      <div className="admin-order-actions">
        {order.status !== "Rejected" && order.status !== "Cancelled" && (
          <button
            type="button"
            className="order-reject-button"
            onClick={() => onChange({ status: "Rejected" })}
          >
            Reject order
          </button>
        )}
        <button
          type="button"
          className="order-delete-button"
          onClick={() => onDelete(order.id)}
        >
          Delete order
        </button>
      </div>
    </article>
  );
}

function Manage({ products, setProducts, importLocalProducts, productsSyncError }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(() =>
    window.location.hash.includes("type=recovery"),
  );
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirm, setRecoveryConfirm] = useState("");
  const [editing, setEditing] = useState(null);
  const [section, setSection] = useState("products");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigateSection = (nextSection) => {
    setSection(nextSection);
    setMobileNavOpen(false);
  };
  const [categories, setCategories] = useState(() =>
    readStored("prime_categories", [
      "T-Shirts",
      "Pants",
      "Hoodies",
      "Outerwear",
    ]).map(normalizeCategory),
  );
  const blankCat = { name: "", note: "", image: "" };
  const [catForm, setCatForm] = useState(blankCat);
  const [editingCat, setEditingCat] = useState(null);
  const [orders, setOrders] = useState(() =>
    remoteEnabled ? [] : readStored("prime_orders", []),
  );
  const [paymentDetails, setPaymentDetails] = useState(readPaymentDetails);
  const [helpContent, setHelpContent] = useState(readHelpContent);
  const [orderNotificationEmail, setOrderNotificationEmail] = useState("");
  const [savingNotificationEmail, setSavingNotificationEmail] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const { lang, setLang } = useLanguage();
  const blankForm = {
    name: "",
    category: "T-Shirts",
    price: "",
    oldPrice: "",
    badge: "",
    color: "",
    images: [],
    inStock: true,
    sizeGuide: [],
    sizeGuideImage: "",
  };
  const [form, setForm] = useState(blankForm);
  const [notice, setNotice] = useState("");
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const lastCats = useRef(JSON.stringify(categories));
  const lastPay = useRef(JSON.stringify(paymentDetails));
  // keep the signed-in admin signed in across reloads
  useEffect(() => {
    if (!remoteEnabled) return;
    getSession().then((sess) => {
      if (window.location.hash.includes("type=recovery")) setRecoveryMode(true);
      if (sess) {
        if (!isStoreOwner(sess)) {
          setNotice("This account does not have store management access.");
          return;
        }
        setAuthenticated(true);
        setAdminUser(sess.user?.email || "Store administrator");
        fetchPrivateSetting("order_notification_email")
          .then((savedEmail) => {
            setOrderNotificationEmail(String(savedEmail || ""));
          })
          .catch((e) =>
            console.error("Could not load notification settings", e),
          );
      }
    });
  }, []);
  // once signed in, load the orders from the database
  useEffect(() => {
    if (!remoteEnabled || !authenticated) return;
    fetchOrders()
      .then(setOrders)
      .catch((e) => console.error("Could not load orders", e));
  }, [authenticated]);
  useEffect(() => {
    localStorage.setItem("prime_categories", JSON.stringify(categories));
    if (!remoteEnabled || !authenticated) return;
    const str = JSON.stringify(categories);
    if (str === lastCats.current) return;
    const t = setTimeout(async () => {
      try {
        let next = categories;
        if (categories.some((c) => isDataUrl(c.image)))
          next = await Promise.all(
            categories.map(async (c) =>
              isDataUrl(c.image)
                ? { ...c, image: await uploadDataUrl(c.image, "categories") }
                : c,
            ),
          );
        await saveSetting("categories", next);
        lastCats.current = JSON.stringify(next);
        if (next !== categories) setCategories(next);
      } catch (e) {
        console.error(e);
        setNotice("Could not save categories to the database.");
      }
    }, 500);
    return () => clearTimeout(t);
  }, [categories, authenticated]);
  useEffect(() => {
    if (!remoteEnabled)
      localStorage.setItem("prime_orders", JSON.stringify(orders));
  }, [orders]);
  useEffect(() => {
    localStorage.setItem(
      "prime_payment_details",
      JSON.stringify(paymentDetails),
    );
    if (!remoteEnabled || !authenticated) return;
    const str = JSON.stringify(paymentDetails);
    if (str === lastPay.current) return;
    const t = setTimeout(
      () =>
        saveSetting("payment", paymentDetails)
          .then(() => {
            lastPay.current = str;
          })
          .catch((e) => {
            console.error(e);
            setNotice("Could not save settings to the database.");
          }),
      500,
    );
    return () => clearTimeout(t);
  }, [paymentDetails, authenticated]);
  const readImage = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  const updateOrder = (id, patch) => {
    const cur = orders.find((o) => o.id === id);
    if (!cur) return;
    const next = { ...cur, ...patch };
    setOrders((old) => old.map((o) => (o.id === id ? next : o)));
    if (remoteEnabled)
      updateOrderRow(next).catch((e) => {
        console.error(e);
        setNotice("Could not save the order change.");
      });
  };
  const deleteOrder = async (id) => {
    if (!window.confirm(`Delete order ${id} permanently? This cannot be undone.`))
      return;
    try {
      if (remoteEnabled) await deleteOrderRow(id);
      setOrders((old) => old.filter((order) => order.id !== id));
      setNotice(`Order ${id} deleted.`);
    } catch (e) {
      console.error(e);
      setNotice("Could not delete the order. Check your Supabase permissions.");
    }
  };
  const resetCatForm = () => {
    setCatForm(blankCat);
    setEditingCat(null);
  };
  const saveCategory = (e) => {
    e.preventDefault();
    const name = catForm.name.trim();
    if (!name) return;
    if (
      categories.some(
        (c, i) =>
          i !== editingCat && c.name.toLowerCase() === name.toLowerCase(),
      )
    )
      return setNotice(tr("A category with this name already exists.", lang));
    const next = {
      name,
      note: catForm.note.trim() || "Explore the collection.",
      image: catForm.image,
    };
    if (editingCat === null) {
      setCategories((old) => [...old, next]);
      setNotice(tr("Category added.", lang));
    } else {
      const oldName = categories[editingCat].name;
      setCategories((old) => old.map((c, i) => (i === editingCat ? next : c)));
      if (oldName !== name)
        setProducts((old) =>
          old.map((p) =>
            p.category === oldName ? { ...p, category: name } : p,
          ),
        );
      setNotice(tr("Category saved.", lang));
    }
    resetCatForm();
  };
  const startNew = () => {
    setEditing(null);
    setForm(blankForm);
    setPreviews([]);
    setNotice("");
  };
  const edit = (p) => {
    const images = Array.isArray(p.images)
      ? p.images
      : p.image
        ? [p.image]
        : [];
    setEditing(p.id);
    setForm({
      ...blankForm,
      ...p,
      price: String(p.price),
      oldPrice: String(p.oldPrice || ""),
      images,
      inStock: p.inStock !== false,
      sizeGuide: p.sizeGuide || [],
      sizeGuideImage: p.sizeGuideImage || "",
    });
    setPreviews(images);
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const fileToData = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  const addImages = async (files) => {
    const chosen = Array.from(files || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!chosen.length) return;
    try {
      const loaded = await Promise.all(chosen.map(fileToData));
      setPreviews((old) => [...old, ...loaded]);
      setForm((old) => ({ ...old, images: [...old.images, ...loaded] }));
      setNotice("");
    } catch {
      setNotice("One or more images could not be loaded.");
    }
  };
  const removeImage = (index) => {
    setPreviews((old) => old.filter((_, i) => i !== index));
    setForm((old) => ({
      ...old,
      images: old.images.filter((_, i) => i !== index),
    }));
  };
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || Number(form.price) <= 0)
      return setNotice("Enter a product name and valid price.");
    const data = {
      ...form,
      id: editing ?? Math.max(0, ...products.map((p) => Number(p.id))) + 1,
      name: form.name.trim(),
      price: Number(form.price),
      oldPrice: Number(form.oldPrice || 0),
      images: previews,
      image: previews[0] || "",
    };
    setProducts((old) =>
      editing ? old.map((p) => (p.id === editing ? data : p)) : [...old, data],
    );
    setNotice(editing ? "Product updated." : "Product added.");
    startNew();
    setNotice(editing ? "Product updated." : "Product added.");
  };
  const deleteProduct = (id) => {
    if (window.confirm("Delete this product?")) {
      setProducts((old) => old.filter((p) => p.id !== id));
      setNotice("Product deleted.");
    }
  };
  if (recoveryMode)
    return (
      <main className="manage-login">
        <div className="manage-login-card">
          <Brand />
          <span className="section-kicker">PASSWORD RECOVERY</span>
          <h1>Choose a new password</h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                recoveryPassword.length < 8 ||
                recoveryPassword !== recoveryConfirm
              )
                return setNotice(
                  "Enter matching passwords with at least 8 characters.",
                );
              setLoggingIn(true);
              const err = await updateAccount({ password: recoveryPassword });
              setLoggingIn(false);
              if (err) return setNotice(err);
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
              );
              setRecoveryMode(false);
              setAuthenticated(true);
              setNotice("Password updated successfully.");
            }}
          >
            <label>
              NEW PASSWORD
              <input
                type="password"
                minLength={8}
                required
                value={recoveryPassword}
                onChange={(e) => setRecoveryPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <label>
              CONFIRM NEW PASSWORD
              <input
                type="password"
                minLength={8}
                required
                value={recoveryConfirm}
                onChange={(e) => setRecoveryConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </label>
            <button className="add-to-bag" disabled={loggingIn}>
              UPDATE PASSWORD <Check size={16} />
            </button>
          </form>
          {notice && <p className="admin-notice">{notice}</p>}
        </div>
      </main>
    );
  if (!authenticated)
    return (
      <main className="manage-login">
        <div className="manage-login-card">
          <Brand />
          <span className="section-kicker">PRIVATE STORE ACCESS</span>
          <h1>
            Welcome
            <br />
            <em>behind the scenes.</em>
          </h1>
          <p>This management area is separate from the storefront.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (remoteEnabled) {
                setLoggingIn(true);
                setNotice("");
                const err = await signIn(email.trim(), password);
                setLoggingIn(false);
                if (err)
                  setNotice(
                    err === "Invalid login credentials"
                      ? "Incorrect email or password."
                      : err,
                  );
                else {
                  const sess = await getSession();
                  if (!isStoreOwner(sess)) {
                    await signOutAdmin();
                    setNotice("This account does not have store management access.");
                    return;
                  }
                  setAuthenticated(true);
                  setAdminUser(email.trim());
                  fetchPrivateSetting("order_notification_email")
                    .then((savedEmail) => {
                      setOrderNotificationEmail(String(savedEmail || ""));
                    })
                    .catch((e) =>
                      console.error("Could not load notification settings", e),
                    );
                  setPassword("");
                }
                return;
              }
              if (
                password ===
                (localStorage.getItem("prime_admin_password") || "prime2026")
              ) {
                setAuthenticated(true);
                setAdminUser("Store administrator");
              } else setNotice("Incorrect demo password.");
            }}
          >
            {remoteEnabled && (
              <label>
                ADMIN EMAIL
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="username"
                  required
                />
              </label>
            )}
            <label>
              {remoteEnabled ? "PASSWORD" : "DEMO PASSWORD"}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                autoComplete="current-password"
              />
            </label>
            {remoteEnabled && (
              <button
                type="button"
                className="back-store"
                disabled={!email.trim() || loggingIn}
                onClick={async () => {
                  setLoggingIn(true);
                  setNotice("");
                  const err = await sendPasswordReset(email.trim());
                  setLoggingIn(false);
                  setNotice(
                    err || "Password reset link sent. Check your email.",
                  );
                }}
              >
                Forgot password? Send a reset link
              </button>
            )}
            <button className="add-to-bag">
              ENTER MANAGEMENT <ArrowRight size={16} />
            </button>
          </form>
          {notice && <p className="admin-notice">{notice}</p>}
          {!remoteEnabled && (
            <small>
              Local prototype only. This password gate is not secure for a
              public deployment; connect Supabase for real admin sign-in.
            </small>
          )}
          <button className="back-store" onClick={() => navigate("/")}>
            ← BACK TO STOREFRONT
          </button>
        </div>
      </main>
    );
  return (
    <main className="manage-page">
      <aside
        className={`manage-sidebar ${mobileNavOpen ? "manage-sidebar-open" : ""}`}
      >
        <Brand light />
        <button
          className="manage-mobile-menu-toggle"
          type="button"
          aria-label={mobileNavOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={mobileNavOpen}
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="manage-sidebar-label">WORKSPACE</span>
        <button
          className={
            section === "products" ? "manage-nav-active" : "manage-nav-item"
          }
          onClick={() => navigateSection("products")}
        >
          <SlidersHorizontal size={17} /> Product management
        </button>
        <button
          className={
            section === "categories" ? "manage-nav-active" : "manage-nav-item"
          }
          onClick={() => navigateSection("categories")}
        >
          <FolderPlus size={17} /> Categories
        </button>
        <button
          className={
            section === "orders" ? "manage-nav-active" : "manage-nav-item"
          }
          onClick={() => {
            if (remoteEnabled)
              fetchOrders().then(setOrders).catch(console.error);
            else setOrders(readStored("prime_orders", []));
            navigateSection("orders");
          }}
        >
          <ClipboardList size={17} /> Orders ({orders.length})
        </button>
        {remoteEnabled && (
          <button
            className={
              section === "account" ? "manage-nav-active" : "manage-nav-item"
            }
            onClick={() => navigateSection("account")}
          >
            <SlidersHorizontal size={17} /> Account
          </button>
        )}
        {remoteEnabled && (
          <button
            className={
              section === "notifications"
                ? "manage-nav-active"
                : "manage-nav-item"
            }
            onClick={() => navigateSection("notifications")}
          >
            <MessageCircle size={17} /> Email notifications
          </button>
        )}
        <button
          className={section === "help" ? "manage-nav-active" : "manage-nav-item"}
          onClick={() => navigateSection("help")}
        >
          <MessageCircle size={17} /> Help &amp; policies
        </button>
        <button
          className={
            section === "payments" ? "manage-nav-active" : "manage-nav-item"
          }
          onClick={() => navigateSection("payments")}
        >
          <PackageCheck size={17} /> Payment settings
        </button>
        <button
          className="manage-nav-item"
          onClick={() => {
            if (remoteEnabled) signOutAdmin();
            setAuthenticated(false);
            setPassword("");
            setMobileNavOpen(false);
          }}
        >
          <ArrowLeft size={17} /> Lock workspace
        </button>
        <div className="manage-sidebar-bottom">
          <span>PRIME / ADMIN</span>
          <span>LOCAL DEMO MODE</span>
        </div>
      </aside>
      <section className="manage-main">
        <div className="manage-topbar">
          <div>
            <span className="section-kicker">STORE WORKSPACE / 01</span>
            <h1>Product management</h1>
          </div>
          <div className="manage-top-actions">
            <button
              className="language-toggle"
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
            >
              {lang === "en" ? "العربية" : "English"}
            </button>
            <button
              className="button button-dark"
              onClick={() => navigate("/")}
            >
              View storefront <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
        <div className="manage-stats">
          <div>
            <span>TOTAL PIECES</span>
            <strong>{String(products.length).padStart(2, "0")}</strong>
          </div>
          <div>
            <span>COLLECTION VALUE</span>
            <strong>
              {money(
                products.reduce((sum, p) => sum + Number(p.price || 0), 0),
              )}
            </strong>
          </div>
          <div>
            <span>ACTIVE CATEGORIES</span>
            <strong>{new Set(products.map((p) => p.category)).size}</strong>
          </div>
        </div>
        {section === "account" ? (
          <AccountForm />
        ) : section === "notifications" ? (
          <form
            className="manage-form-card"
            onSubmit={async (e) => {
              e.preventDefault();
              setSavingNotificationEmail(true);
              setNotice("");
              try {
                await savePrivateSetting(
                  "order_notification_email",
                  orderNotificationEmail.trim(),
                );
                setNotice("Order notification email saved.");
              } catch (err) {
                console.error(err);
                setNotice(
                  "Could not save the notification email. Check your Supabase permissions.",
                );
              } finally {
                setSavingNotificationEmail(false);
              }
            }}
          >
            <div className="manage-card-heading">
              <div>
                <span className="section-kicker">NEW ORDER ALERTS</span>
                <h2>Email notifications</h2>
              </div>
            </div>
            <p className="upload-hint">
              A secure Supabase function emails this address when a new order is
              placed. Order details include the order number, customer contact
              and delivery details, items, totals, and payment method.
            </p>
            <label>
              ORDER NOTIFICATION EMAIL
              <input
                type="email"
                value={orderNotificationEmail}
                onChange={(e) => setOrderNotificationEmail(e.target.value)}
                placeholder="orders@example.com"
                required
              />
            </label>
            <button className="add-to-bag" disabled={savingNotificationEmail}>
              {savingNotificationEmail ? "SAVING…" : "SAVE EMAIL ADDRESS"}{" "}
              <Check size={16} />
            </button>
            {notice && <p className="admin-notice">{notice}</p>}
          </form>
        ) : section === "help" ? (
          <form
            className="manage-form-card"
            onSubmit={async (event) => {
              event.preventDefault();
              setNotice("");
              try {
                localStorage.setItem("prime_help_content", JSON.stringify(helpContent));
                if (remoteEnabled) await saveSetting("help_content", helpContent);
                setNotice("Help links saved and published to the storefront.");
              } catch (error) {
                console.error(error);
                setNotice("Could not save the help information. Check your Supabase permissions.");
              }
            }}
          >
            <div className="manage-card-heading">
              <div>
                <span className="section-kicker">STOREFRONT FOOTER</span>
                <h2>Help &amp; policies</h2>
              </div>
            </div>
            <p className="upload-hint">Edit the contact details, delivery information, and returns text customers see in the footer. These details are public.</p>
            <label>
              CONTACT EMAIL
              <input type="email" value={helpContent.contactEmail} onChange={(event) => setHelpContent({ ...helpContent, contactEmail: event.target.value })} placeholder="support@example.com" />
            </label>
            <label>
              CONTACT WHATSAPP (country code, numbers only)
              <input value={helpContent.contactWhatsapp} onChange={(event) => setHelpContent({ ...helpContent, contactWhatsapp: event.target.value })} placeholder="201xxxxxxxxx" />
            </label>
            <label>
              SHIPPING &amp; DELIVERY
              <textarea rows="5" value={helpContent.shipping} onChange={(event) => setHelpContent({ ...helpContent, shipping: event.target.value })} placeholder="Delivery fees, covered areas, and estimated delivery times" />
            </label>
            <label>
              RETURNS &amp; EXCHANGES
              <textarea rows="5" value={helpContent.returns} onChange={(event) => setHelpContent({ ...helpContent, returns: event.target.value })} placeholder="Your return and exchange conditions and how to contact the store" />
            </label>
            <button className="add-to-bag">SAVE HELP INFORMATION <Check size={16} /></button>
            {notice && <p className="admin-notice">{notice}</p>}
          </form>
        ) : section === "payments" ? (
          <form
            className="manage-form-card payment-settings-form"
            onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem(
                "prime_whatsapp",
                paymentDetails.whatsapp || "",
              );
              setNotice("Payment settings saved in this browser.");
            }}
          >
            <div className="manage-card-heading">
              <div>
                <span className="section-kicker">CHECKOUT CONFIGURATION</span>
                <h2>Payment settings</h2>
              </div>
            </div>
            <p className="upload-hint">
              Enter verified store payment details. Customers will see the
              method they choose at checkout. This is stored locally until the
              backend is connected.
            </p>
            <label>
              {tr("SHIPPING FEE (EGP)", lang)}
              <input
                type="number"
                min="0"
                step="1"
                value={paymentDetails.shippingFee}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    shippingFee: e.target.value,
                  })
                }
              />
            </label>
            <p className="upload-hint">
              {tr(
                "Default shipping fee for new orders. You can also change the fee per order from the Orders tab.",
                lang,
              )}
            </p>
            <label>
              INSTA PAY HANDLE / NUMBER
              <input
                value={paymentDetails.instapay}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    instapay: e.target.value,
                  })
                }
                placeholder="InstaPay address or number"
              />
            </label>
            <label>
              MOBILE WALLET NUMBER
              <input
                value={paymentDetails.wallet}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    wallet: e.target.value,
                  })
                }
                placeholder="Wallet number with country code"
              />
            </label>
            <label>
              BANK TRANSFER DETAILS
              <textarea
                rows="3"
                value={paymentDetails.bank}
                onChange={(e) =>
                  setPaymentDetails({ ...paymentDetails, bank: e.target.value })
                }
                placeholder="Bank name, account holder, IBAN/account number"
              />
            </label>
            <label>
              {tr("CART MESSAGE (shown to the customer in the cart)", lang)}
              <textarea
                rows="4"
                value={paymentDetails.cartMessage}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    cartMessage: e.target.value,
                  })
                }
                placeholder="حوّل {shipping} جنيه مصاريف الشحن على الأرقام التالية لتأكيد طلبك"
              />
            </label>
            <p className="upload-hint">
              {tr(
                "Replaces the default 'Pay the shipping fee' sentence. Placeholders:",
                lang,
              )}{" "}
              {"{shipping} {subtotal} {total} {instapay} {wallet}"}
            </p>
            <label>
              {tr("MESSAGE TEMPLATE FOR CUSTOMERS", lang)}
              <textarea
                rows="9"
                value={paymentDetails.messageTemplate}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    messageTemplate: e.target.value,
                  })
                }
                placeholder={exampleTemplate}
              />
            </label>
            <p className="upload-hint">
              {tr(
                "Write your own shipping-fee message. Available placeholders:",
                lang,
              )}{" "}
              {
                "{name} {order_id} {shipping} {subtotal} {total} {items} {payment} {phone}"
              }
              .{" "}
              {tr(
                "Leave empty to use the built-in message. You can still edit the text per order.",
                lang,
              )}
            </p>
            <button
              type="button"
              className="button button-outline-dark"
              onClick={() =>
                setPaymentDetails({
                  ...paymentDetails,
                  messageTemplate: exampleTemplate,
                })
              }
            >
              {tr("Insert example text", lang)}
            </button>
            <label>
              WHATSAPP NUMBER
              <input
                value={paymentDetails.whatsapp}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    whatsapp: e.target.value,
                  })
                }
                placeholder="201xxxxxxxxx"
              />
            </label>
            <label>
              INSTAGRAM LINK
              <input
                value={paymentDetails.instagram}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    instagram: e.target.value,
                  })
                }
                placeholder="https://instagram.com/yourpage"
              />
            </label>
            <label>
              TIKTOK LINK
              <input
                value={paymentDetails.tiktok}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    tiktok: e.target.value,
                  })
                }
                placeholder="https://www.tiktok.com/@yourpage"
              />
            </label>
            <label>
              FACEBOOK LINK
              <input
                value={paymentDetails.facebook}
                onChange={(e) =>
                  setPaymentDetails({
                    ...paymentDetails,
                    facebook: e.target.value,
                  })
                }
                placeholder="https://facebook.com/yourpage"
              />
            </label>
            <button className="add-to-bag">
              SAVE PAYMENT SETTINGS <Check size={16} />
            </button>
            {notice && <p className="admin-notice">{notice}</p>}
          </form>
        ) : section === "categories" ? (
          <div className="manage-editor-grid">
            <form className="manage-form-card" onSubmit={saveCategory}>
              <div className="manage-card-heading">
                <div>
                  <span className="section-kicker">
                    {tr("COLLECTION SETUP", lang)}
                  </span>
                  <h2>
                    {editingCat === null
                      ? tr("Add category", lang)
                      : tr("Edit category", lang)}
                  </h2>
                </div>
              </div>
              <label>
                {tr("CATEGORY NAME", lang)}
                <input
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm({ ...catForm, name: e.target.value })
                  }
                  required
                  placeholder="e.g. Accessories"
                />
              </label>
              <label>
                {tr("CATEGORY DESCRIPTION (optional)", lang)}
                <input
                  value={catForm.note}
                  onChange={(e) =>
                    setCatForm({ ...catForm, note: e.target.value })
                  }
                  placeholder="Comfort with a cleaner silhouette."
                />
              </label>
              <label className="upload-field">
                {tr("CATEGORY COVER IMAGE", lang)}
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (f) {
                      try {
                        setCatForm((old) => ({ ...old, image: "" }));
                        const img = await compressImage(f);
                        setCatForm((old) => ({ ...old, image: img }));
                      } catch {
                        setNotice("The image could not be loaded.");
                      }
                    }
                  }}
                />
              </label>
              {catForm.image && (
                <>
                  <img
                    className="category-image-preview"
                    src={catForm.image}
                    alt="Category preview"
                  />
                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={() => setCatForm({ ...catForm, image: "" })}
                  >
                    {tr("Remove image", lang)}
                  </button>
                </>
              )}
              <div className="manage-form-actions">
                <button className="add-to-bag">
                  {editingCat === null
                    ? tr("ADD CATEGORY", lang)
                    : tr("SAVE CATEGORY", lang)}{" "}
                  <ArrowRight size={16} />
                </button>
                {editingCat !== null && (
                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={resetCatForm}
                  >
                    {tr("CANCEL", lang)}
                  </button>
                )}
              </div>
              {notice && <p className="admin-notice">{notice}</p>}
            </form>
            <div className="manage-products-card">
              <div className="manage-card-heading">
                <div>
                  <span className="section-kicker">
                    {tr("YOUR COLLECTION", lang)}
                  </span>
                  <h2>
                    {tr("Categories", lang)} ({categories.length})
                  </h2>
                </div>
              </div>
              <div className="category-admin-grid">
                {categories.map((c, i) => (
                  <article
                    className={`category-admin-card ${editingCat === i ? "is-editing" : ""}`}
                    key={`${c.name}-${i}`}
                  >
                    {c.image ? (
                      <img src={c.image} alt={c.name} />
                    ) : (
                      <div className="manage-row-placeholder">P</div>
                    )}
                    <strong>{c.name}</strong>
                    <div className="category-admin-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCat(i);
                          setCatForm({
                            name: c.name,
                            note:
                              c.note === "Explore the collection."
                                ? ""
                                : c.note,
                            image: c.image || "",
                          });
                          setNotice("");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        {tr("EDIT", lang)}
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete category ${c.name}? Products in this category will remain but be uncategorized.`,
                            )
                          ) {
                            setCategories((old) =>
                              old.filter((_, j) => j !== i),
                            );
                            setProducts((old) =>
                              old.map((p) =>
                                p.category === c.name
                                  ? { ...p, category: "Uncategorized" }
                                  : p,
                              ),
                            );
                            if (editingCat === i) resetCatForm();
                          }
                        }}
                      >
                        {tr("DELETE", lang)}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : section === "orders" ? (
          <div className="manage-products-card orders-admin">
            <div className="manage-card-heading">
              <div>
                <span className="section-kicker">CUSTOMER ORDERS</span>
                <h2>Orders ({orders.length})</h2>
              </div>
            </div>
            {orders.length ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  details={paymentDetails}
                  onChange={(patch) => updateOrder(order.id, patch)}
                  onDelete={deleteOrder}
                />
              ))
            ) : (
              <p className="upload-hint">
                No orders have been placed in this browser yet.
              </p>
            )}
          </div>
        ) : (
          <div className="manage-editor-grid">
            <form className="manage-form-card" onSubmit={submit}>
              <div className="manage-card-heading">
                <div>
                  <span className="section-kicker">
                    {editing ? "UPDATE EXISTING" : "ADD SOMETHING NEW"}
                  </span>
                  <h2>{editing ? "Edit piece" : "New piece"}</h2>
                </div>
                <span className="form-step">01 / 02</span>
              </div>
              <label>
                PRODUCT NAME
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Essential Oversized Tee"
                  required
                />
              </label>
              <div className="manage-form-row">
                <label>
                  CATEGORY
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {categories.map((c) => (
                      <option key={typeof c === "string" ? c : c.name}>
                        {typeof c === "string" ? c : c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  COLOR
                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="Washed black"
                  />
                </label>
              </div>
              <div className="manage-form-row">
                <label>
                  PRICE (EGP)
                  <input
                    type="number"
                    min="1"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  OLD PRICE (EGP)
                  <input
                    type="number"
                    min="0"
                    value={form.oldPrice}
                    onChange={(e) =>
                      setForm({ ...form, oldPrice: e.target.value })
                    }
                  />
                </label>
              </div>
              <label>
                BADGE
                <input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="NEW DROP / BESTSELLER"
                />
              </label>
              <label className="stock-toggle-label">
                <span>PRODUCT AVAILABILITY</span>
                <select
                  value={form.inStock === false ? "out" : "in"}
                  onChange={(e) =>
                    setForm({ ...form, inStock: e.target.value === "in" })
                  }
                >
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </label>
              <div className="size-guide-editor">
                <div className="manage-card-heading">
                  <div>
                    <span className="section-kicker">FIT INFORMATION</span>
                    <h3>Size Guide</h3>
                  </div>
                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={() =>
                      setForm({
                        ...form,
                        sizeGuide: [
                          ...(form.sizeGuide || []),
                          { size: "S", chest: "", length: "", sleeve: "" },
                        ],
                      })
                    }
                  >
                    + Add size row
                  </button>
                </div>
                {(form.sizeGuide || []).map((r, i) => (
                  <div className="size-guide-row" key={i}>
                    <input
                      aria-label="Size"
                      value={r.size}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sizeGuide: form.sizeGuide.map((x, j) =>
                            j === i ? { ...x, size: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Size (M)"
                    />
                    <input
                      aria-label="Chest cm"
                      value={r.chest}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sizeGuide: form.sizeGuide.map((x, j) =>
                            j === i ? { ...x, chest: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Chest cm"
                    />
                    <input
                      aria-label="Length cm"
                      value={r.length}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sizeGuide: form.sizeGuide.map((x, j) =>
                            j === i ? { ...x, length: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Length cm"
                    />
                    <input
                      aria-label="Sleeve cm"
                      value={r.sleeve}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sizeGuide: form.sizeGuide.map((x, j) =>
                            j === i ? { ...x, sleeve: e.target.value } : x,
                          ),
                        })
                      }
                      placeholder="Sleeve cm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          sizeGuide: form.sizeGuide.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <label className="upload-field">
                  OR UPLOAD SIZE GUIDE IMAGE
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        setForm({
                          ...form,
                          sizeGuideImage: await readImage(f),
                        });
                    }}
                  />
                </label>
                {form.sizeGuideImage && (
                  <div className="size-guide-image-admin">
                    <img src={form.sizeGuideImage} alt="Size guide preview" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sizeGuideImage: "" })}
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
              <label className="upload-field">
                UPLOAD PRODUCT IMAGES
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addImages(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
              <p className="upload-hint">
                You can select multiple photos. Images use a gray background
                when no photo is added.
              </p>
              {previews.length > 0 && (
                <div className="manage-preview-grid">
                  {previews.map((src, i) => (
                    <div
                      className="manage-preview"
                      key={`${src.slice(0, 30)}-${i}`}
                    >
                      <img src={src} alt={`Product preview ${i + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        aria-label={`Remove image ${i + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="manage-form-actions">
                <button type="submit" className="add-to-bag">
                  {editing ? "SAVE CHANGES" : "ADD PRODUCT"}{" "}
                  <ArrowRight size={16} />
                </button>
                {editing && (
                  <button
                    type="button"
                    className="button button-outline-dark"
                    onClick={startNew}
                  >
                    CANCEL
                  </button>
                )}
              </div>
              {notice && <p className="admin-notice">{notice}</p>}
            </form>
            <div className="manage-products-card">
              <div className="manage-card-heading">
                <div>
                  <span className="section-kicker">YOUR CURRENT LINEUP</span>
                  <h2>
                    All products <span>({products.length})</span>
                  </h2>
                </div>
              </div>
              {remoteEnabled && products.length === 0 && (
                <div
                  className="order-message-box"
                  style={{ margin: "0 0 16px" }}
                >
                  <p className="upload-hint">
                    The database has no products yet. You can import the
                    products that are in this browser (or the 8 starter pieces)
                    in one click, then edit them normally.
                  </p>
                  <button
                    type="button"
                    className="button button-dark"
                    onClick={importLocalProducts}
                  >
                    Import products into the database
                  </button>
                </div>
              )}
              {productsSyncError && (
                <p className="admin-notice">
                  Supabase product sync failed: {productsSyncError}
                </p>
              )}
              <div className="manage-product-list">
                {products.map((p) => {
                  const images = Array.isArray(p.images)
                    ? p.images
                    : p.image
                      ? [p.image]
                      : [];
                  return (
                    <article className="manage-product-row" key={p.id}>
                      {images[0] ? (
                        <img src={images[0]} alt={p.name} />
                      ) : (
                        <div className="manage-row-placeholder">P</div>
                      )}
                      <div className="manage-product-details">
                        <strong>{p.name}</strong>
                        <span>
                          {p.category} · {money(p.price)} · {images.length}{" "}
                          photo{images.length === 1 ? "" : "s"}
                        </span>
                        <span
                          className={
                            p.inStock === false ? "stock-out" : "stock-in"
                          }
                        >
                          {p.inStock === false ? "OUT OF STOCK" : "IN STOCK"}
                        </span>
                      </div>
                      <div className="manage-product-actions">
                        <button
                          onClick={() => edit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          aria-label={`Delete ${p.name}`}
                        >
                          DELETE
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        <p className="manage-warning">
          {remoteEnabled
            ? "Connected to Supabase — products, categories, settings, photos and orders are shared across all devices."
            : "This prototype stores products and uploaded photos in this browser only. Add your Supabase keys to the .env file to share them across devices."}
        </p>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <main className="page-shell not-found">
      <span className="section-kicker">404 / WRONG TURN</span>
      <h1>
        This page isn't
        <br />
        <em>in the collection.</em>
      </h1>
      <Link className="button button-dark" to="/">
        Back to home <ArrowRight size={16} />
      </Link>
    </main>
  );
}

export default function App() {
  const store = useStore();
  const [lang, setLang] = useState(
    () => localStorage.getItem("prime_language") || "en",
  );
  useEffect(() => {
    localStorage.setItem("prime_language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const count = store.cart.reduce((n, p) => n + p.qty, 0);
  // store-wide settings + categories live in the database; keep a local cache so pages render instantly
  const [, bump] = useState(0);
  const [settingsReady, setSettingsReady] = useState(!remoteEnabled);
  useEffect(() => {
    if (!remoteEnabled) return;
    fetchSettings()
      .then((s) => {
        if (s.payment)
          localStorage.setItem(
            "prime_payment_details",
            JSON.stringify(s.payment),
          );
        if (s.categories)
          localStorage.setItem(
            "prime_categories",
            JSON.stringify(s.categories),
          );
        if (s.help_content)
          localStorage.setItem(
            "prime_help_content",
            JSON.stringify(s.help_content),
          );
        bump((n) => n + 1);
      })
      .catch((e) => console.error("Could not load settings", e))
      .finally(() => setSettingsReady(true));
  }, []);
  const navigateAdmin = useNavigate();
  useEffect(() => {
    // Keyboard shortcut to open the admin page: Alt + Shift + A
    const onKey = (e) => {
      if (e.altKey && e.shiftKey && e.code === "KeyA") {
        e.preventDefault();
        navigateAdmin(siteConfig.adminPath);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigateAdmin]);
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      <div className={lang === "ar" ? "app-root is-ar" : "app-root"}>
        <Routes>
          <Route
            path={siteConfig.adminPath}
            element={
              settingsReady && store.productsLoaded ? (
                <Manage
                  products={store.products}
                  setProducts={store.setProducts}
                  importLocalProducts={store.importLocalProducts}
                  productsSyncError={store.productsSyncError}
                />
              ) : (
                <main className="manage-login">
                  <p>Loading…</p>
                </main>
              )
            }
          />
          <Route
            path="/account"
            element={
              <>
                <Header count={count} />
                <CustomerAccount />
                <Footer />
              </>
            }
          />
          <Route
            path="*"
            element={
              <>
                <Header count={count} />
                <Routes>
                  <Route
                    path="/"
                    element={<Home products={store.products} />}
                  />
                  <Route
                    path="/shop"
                    element={<Shop products={store.products} />}
                  />
                  <Route
                    path="/product/:id"
                    element={
                      <ProductDetails
                        products={store.products}
                        add={store.add}
                      />
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <Cart
                        cart={store.cart}
                        changeQty={store.changeQty}
                        remove={store.remove}
                        clearCart={store.clearCart}
                      />
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
                {getWhatsapp() && (
                  <a
                    className="whatsapp-float"
                    href={`https://wa.me/${getWhatsapp()}?text=${encodeURIComponent(lang === "ar" ? "مرحبًا، أحتاج مساعدة بخصوص طلب من PRIME STREETWEAR" : "Hi, I need help with my PRIME STREETWEAR order.")}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Chat on WhatsApp"
                  >
                    <MessageCircle size={25} />
                    <span>WhatsApp</span>
                  </a>
                )}
              </>
            }
          />
        </Routes>
      </div>
    </LanguageContext.Provider>
  );
}


