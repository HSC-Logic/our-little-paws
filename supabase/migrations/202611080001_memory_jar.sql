begin;

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households on delete cascade,
  author uuid not null references public.profiles,
  body text not null check (length(body) between 1 and 1000 and body ~ '[^[:space:]]'),
  created_at timestamptz not null default now()
);
create index on public.memories(household_id, created_at desc);
alter table public.memories enable row level security;
revoke all on public.memories from anon, authenticated;
grant select on public.memories to authenticated;
create policy member_read on public.memories for select to authenticated
  using (household_id = public.my_household());

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.get_world()'::regprocedure);
  if position('''inventory'',coalesce' in definition) = 0 then
    raise exception 'Review get_world before adding memories';
  end if;
  definition := replace(definition, '''inventory'',coalesce',
    '''memories'',coalesce((select jsonb_agg(to_jsonb(m) order by created_at desc, id) from public.memories m where household_id=h),''[]''::jsonb), ''inventory'',coalesce');
  execute definition;

  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('elsif k=''letter'' then' in definition) = 0 then
    raise exception 'Review world_action before adding memories';
  end if;
  definition := replace(definition, 'elsif k=''letter'' then',
    'elsif k=''memory'' then
      if jsonb_typeof(p_command->''body'') is distinct from ''string'' then raise exception ''A memory needs a note''; end if;
      insert into public.memories(household_id,author,body) values(h,u,trim(p_command->>''body''));
      msg:=''A memory tucked into our jar.'';
    elsif k=''letter'' then');
  execute definition;
end $$;

commit;
