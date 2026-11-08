begin;

alter table public.letters add column opens_at timestamptz;
alter table public.letters add column occasion text not null default 'just-because'
  check (occasion in ('just-because','birthday','anniversary','event'));

drop policy letters_private on public.letters;
create policy letters_private on public.letters for select to authenticated
  using (household_id=public.my_household() and auth.uid() in(sender,recipient)
    and (opens_at is null or opens_at<=now()));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.get_world()'::regprocedure);
  if position('jsonb_agg(to_jsonb(l) order by created_at desc)' in definition)=0 then
    raise exception 'Review get_world before adding scheduled letters';
  end if;
  definition := replace(definition,
    'jsonb_agg(to_jsonb(l) order by created_at desc)',
    'jsonb_agg((case when l.opens_at>now() then to_jsonb(l)-''body'' else to_jsonb(l) end) || jsonb_build_object(''locked'',coalesce(l.opens_at>now(),false)) order by created_at desc)');
  execute definition;

  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('insert into public.letters(household_id,sender,recipient,subject,body,envelope)' in definition)=0
    or position('elsif k=''letter-state'' then' in definition)=0 then
    raise exception 'Review world_action before adding scheduled letters';
  end if;
  definition := replace(definition,
    'insert into public.letters(household_id,sender,recipient,subject,body,envelope) values(h,u,recipient_id,trim(p_command->>''subject''),trim(p_command->>''body''),p_command->>''envelope'');',
    'if p_command->>''opens_at'' is not null and (p_command->>''opens_at'')::timestamptz<=now() then raise exception ''Choose a future opening time'';end if;
    insert into public.letters(household_id,sender,recipient,subject,body,envelope,opens_at,occasion) values(h,u,recipient_id,trim(p_command->>''subject''),trim(p_command->>''body''),p_command->>''envelope'',(p_command->>''opens_at'')::timestamptz,coalesce(p_command->>''occasion'',''just-because''));');
  definition := replace(definition, 'elsif k=''letter-state'' then',
    'elsif k=''letter-state'' then
    if exists(select 1 from public.letters where id=(p_command->>''id'')::uuid and household_id=h and u in(sender,recipient) and opens_at>now()) then raise exception ''This letter is sealed until its opening time'';end if;');
  execute definition;
end $$;

alter function public.get_world() security definer;

commit;
