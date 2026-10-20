# Customer accounts setup

The storefront now supports customer email/password accounts at `/account`.
Signed-in customers can see orders created while signed in. Guest checkout
continues to work, but guest orders are not attached to an account.

## Apply the database migration

Run `migrations/20261020000002_customer_accounts.sql` in the Supabase SQL Editor.
It adds the order owner column and replaces broad policies on the store tables
so customer accounts cannot read other customers' orders or manage the store.

## Keep the existing store manager account

The existing manager account must have the trusted `owner` app metadata role.
In the SQL Editor, replace the email below with the email used to sign in to the
store management page and run:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"owner"}'::jsonb
where lower(email) = lower('YOUR-ADMIN-EMAIL');
```

Sign out and back in to the management page after running the update so the
session receives the new role claim. Do not assign this role to customers.

## Allow signup confirmation links during local development

In Supabase Dashboard, open Authentication → URL Configuration and add
`http://localhost:5173/**` to Redirect URLs. Keep the production site URL and
redirect URL updated after publishing the storefront on its domain.
