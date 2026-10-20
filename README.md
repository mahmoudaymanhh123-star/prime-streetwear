# PRIME STREETWEAR

React + Vite storefront prototype.

## Run locally

1. Install Node.js (LTS).
2. In this folder run `npm install`.
3. Run `npm run dev`.

## Added in this prototype

- English/Arabic language switch with page direction switching.
- Floating WhatsApp contact button.
- Checkout form for customer contact and delivery details.
- Shipping fee calculation (currently EGP 80; change `shipping` in `src/App.jsx` when the store sets its actual fee).
- InstaPay, mobile wallet and bank transfer options, plus optional transaction reference/proof.
- Local order records and order/payment status management under `/manage`.
- Product in-stock/out-of-stock control.
- Dynamic categories with optional cover image.
- Product size-guide table and optional uploaded size-guide image.
- Local payment detail settings in the admin panel.

## Prototype limitations — important

Supabase/backend is intentionally not connected yet, as requested. Product data, category images, orders, payment settings and image uploads are stored in the current browser's `localStorage`; they are not shared between devices and large image uploads can exceed browser storage limits.

The current admin password gate is only a local prototype gate, **not secure authentication**. Real secure admin access, shared order storage, and payment/order integrity require server-side authentication/database rules when the backend is connected. Do not use this prototype to collect real customer information or accept real payments until that stage is complete.

The WhatsApp number and payment account details have not been supplied yet. Set them in `/manage` → Payment settings. Shipping is currently a placeholder amount of EGP 80 and must be adjusted to the store's actual delivery pricing.
