-- Store notification destinations privately so they are not exposed with public storefront settings.
create table if not exists public.store_private_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.store_private_settings enable row level security;
revoke all on public.store_private_settings from anon, authenticated;
grant select, insert, update on public.store_private_settings to authenticated;
create policy "Authenticated managers can read private settings"
  on public.store_private_settings for select to authenticated using (true);
create policy "Authenticated managers can insert private settings"
  on public.store_private_settings for insert to authenticated with check (true);
create policy "Authenticated managers can update private settings"
  on public.store_private_settings for update to authenticated using (true) with check (true);

-- One row per order prevents duplicate email notifications.
create table if not exists public.order_email_notifications (
  order_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.order_email_notifications enable row level security;
revoke all on public.order_email_notifications from anon, authenticated;
