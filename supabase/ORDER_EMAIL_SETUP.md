# Order email setup

The admin page saves the notification recipient in the private `store_private_settings` table and invokes the `notify-order` Supabase Edge Function after storing each new order. The function reads the saved address and order details with the service role key, validates the unguessable per-order notification token, and sends one email per order through Resend. The service role key and Resend key stay in Supabase secrets.

## One-time setup

1. Run `supabase/migrations/20261020000000_order_email_notifications.sql` in the Supabase SQL Editor.
2. Create a Resend account and verify the sender domain/address you plan to use.
3. In Supabase Edge Function secrets, add `RESEND_API_KEY` and `ORDER_EMAIL_FROM` (for example, `PRIME STREETWEAR <orders@your-verified-domain.com>`). Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to Edge Functions.
4. From the project folder, deploy with the Supabase CLI: `supabase functions deploy notify-order`.
5. In Supabase Authentication URL Configuration, allow the deployed admin page URL for password recovery redirects.
6. In the admin page, open **Email notifications**, enter the recipient, and save.

The function can be called from the public storefront, so it verifies that the order exists and matches its random notification token. The SQL table records each sent order once; failed provider sends release the row so a later retry can succeed.
