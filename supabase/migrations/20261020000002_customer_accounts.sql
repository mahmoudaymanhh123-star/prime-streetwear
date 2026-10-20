-- Customer accounts own their order history. Store management remains limited
-- to users whose Supabase app_metadata.role is "owner".

alter table public.store_orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create or replace function public.is_store_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role' = 'owner', false);
$$;

revoke all on function public.is_store_owner() from public;
grant execute on function public.is_store_owner() to authenticated;

-- Replace older broad policies so newly registered customers cannot inherit
-- store-wide access merely because they have an authenticated session.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'store_products',
        'store_settings',
        'store_private_settings',
        'store_orders'
      )
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

alter table public.store_products enable row level security;
alter table public.store_settings enable row level security;
alter table public.store_private_settings enable row level security;
alter table public.store_orders enable row level security;

create policy "Anyone can read store products"
  on public.store_products for select to anon, authenticated
  using (true);
create policy "Store owners manage products"
  on public.store_products for all to authenticated
  using (public.is_store_owner()) with check (public.is_store_owner());

create policy "Anyone can read store settings"
  on public.store_settings for select to anon, authenticated
  using (true);
create policy "Store owners manage settings"
  on public.store_settings for all to authenticated
  using (public.is_store_owner()) with check (public.is_store_owner());

create policy "Store owners manage private settings"
  on public.store_private_settings for all to authenticated
  using (public.is_store_owner()) with check (public.is_store_owner());

create policy "Guests can place orders"
  on public.store_orders for insert to anon
  with check (user_id is null);
create policy "Customers can place orders for themselves"
  on public.store_orders for insert to authenticated
  with check (user_id = auth.uid() or public.is_store_owner());
create policy "Customers see their own orders and owners see all orders"
  on public.store_orders for select to authenticated
  using (user_id = auth.uid() or public.is_store_owner());
create policy "Only store owners update orders"
  on public.store_orders for update to authenticated
  using (public.is_store_owner()) with check (public.is_store_owner());

grant usage on schema public to anon, authenticated;
grant select on public.store_products, public.store_settings to anon, authenticated;
grant insert, update, delete on public.store_products, public.store_settings to authenticated;
grant select, insert, update on public.store_private_settings to authenticated;
grant insert on public.store_orders to anon, authenticated;
grant select, update on public.store_orders to authenticated;
