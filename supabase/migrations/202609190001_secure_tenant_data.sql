-- Each signed-in business sees and changes only its own operational data.
-- Legacy demonstration rows remain unowned and are deliberately not exposed.
do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'devices', 'sales', 'purchases', 'repair_orders', 'contacts',
    'financial_accounts', 'financial_transactions', 'alert_notifications'
  ]
  loop
    execute format(
      'alter table public.%I add column if not exists owner_id uuid references auth.users(id) on delete cascade default auth.uid()',
      target_table
    );

    execute format('drop policy if exists %I on public.%I', 'Public access ' || target_table, target_table);
    execute format('drop policy if exists %I on public.%I', 'Users manage own ' || target_table, target_table);
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id)',
      'Users manage own ' || target_table, target_table
    );
    execute format('revoke all on public.%I from anon', target_table);
    execute format('grant select, insert, update, delete on public.%I to authenticated', target_table);
  end loop;
end $$;
