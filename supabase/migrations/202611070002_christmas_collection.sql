begin;

alter table public.inventory drop constraint inventory_item_check;
alter table public.inventory add constraint inventory_item_check check (item in (
  'sage','lavender','honey','rose','bow','hat','mint-bed','rose-bed',
  'christmas-wall','christmas-rug','christmas-bed','christmas-hat'
));
alter table public.room_items drop constraint room_items_item_check;
alter table public.room_items add constraint room_items_item_check check (item in (
  'sage','lavender','honey','rose','bow','hat','mint-bed','rose-bed',
  'christmas-wall','christmas-rug','christmas-bed','christmas-hat'
));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('if v_item in (''sage'',''lavender'')' in definition) = 0 then
    raise exception 'Decoration validation changed; review world_action before migrating';
  end if;
  definition := replace(definition, 'if v_item in (''sage'',''lavender'')',
    'if v_item in (''christmas-wall'',''christmas-rug'',''christmas-bed'',''christmas-hat'') then
      if now() >= timestamptz ''2027-01-01 00:00:00+05:30'' then
        raise exception ''The Christmas collection expired after December 31, 2026 and is locked.'';
      end if;
      item_slot := case v_item when ''christmas-hat'' then ''accessory'' else split_part(v_item,''-'',2) end;
      price := case v_item when ''christmas-wall'' then 15 when ''christmas-rug'' then 10 when ''christmas-bed'' then 12 else 8 end;
    elsif v_item in (''sage'',''lavender'')');
  execute definition;

  definition := pg_get_functiondef('public.get_world()'::regprocedure);
  if position('from public.room_items where household_id=h' in definition) = 0 then
    raise exception 'Room projection changed; review get_world before migrating';
  end if;
  execute replace(definition, 'from public.room_items where household_id=h',
    'from public.room_items where household_id=h and (item not like ''christmas-%'' or now() < timestamptz ''2027-01-01 00:00:00+05:30'')');
end $$;

commit;
