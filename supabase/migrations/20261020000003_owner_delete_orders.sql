grant delete on public.store_orders to authenticated;

drop policy if exists "Only store owners delete orders" on public.store_orders;

create policy "Only store owners delete orders"
  on public.store_orders for delete to authenticated
  using (public.is_store_owner());
