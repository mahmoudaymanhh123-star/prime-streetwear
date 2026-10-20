-- Let the storefront use only the Data API operations it needs.
-- RLS remains enabled and continues to decide which rows are allowed.
grant usage on schema public to anon, authenticated;

grant select on table public.store_products to anon, authenticated;
grant insert, update, delete on table public.store_products to authenticated;

grant select on table public.store_settings to anon, authenticated;
grant insert, update on table public.store_settings to authenticated;

grant insert on table public.store_orders to anon, authenticated;
grant select, update on table public.store_orders to authenticated;
