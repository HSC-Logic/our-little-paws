-- Read-only diagnostics for an existing project. Does not read personal records.
-- Run in the Supabase SQL editor and share the result before re-running migrations.
select
  c.table_name,
  jsonb_agg(jsonb_build_object(
    'column', c.column_name,
    'type', c.udt_name,
    'nullable', c.is_nullable,
    'default', c.column_default
  ) order by c.ordinal_position) as columns
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name in (
    'profiles', 'households', 'household_members', 'pets', 'pet_actions',
    'inventory', 'room_items', 'letters', 'songs', 'achievements',
    'activity_events', 'action_receipts'
  )
group by c.table_name
order by c.table_name;

select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname='public'
  and tablename in ('profiles','households','household_members','pets','pet_actions',
  'inventory','room_items','letters','songs','achievements','activity_events','action_receipts')
order by tablename,policyname;

select p.proname as function_name, pg_get_function_identity_arguments(p.oid) as arguments
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in ('get_world','world_action','my_household','limit_members')
order by p.proname;
