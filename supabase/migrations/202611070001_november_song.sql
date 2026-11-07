begin;

alter table public.songs drop constraint songs_track_key_check;
alter table public.songs add constraint songs_track_key_check
  check(track_key in ('morning','rain','moon','for-you-october-25','for-you-october-11',
    'for-you-july-30','for-you-june-30','for-you-june-3','for-you-may-31','for-you-may-30','for-you-november-6'));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('(''morning'',''rain'',''moon'',''for-you-october-25'',''for-you-october-11'',''for-you-july-30'',''for-you-june-30'',''for-you-june-3'',''for-you-may-31'',''for-you-may-30'')' in definition) = 0 then
    raise exception 'Song validation changed; review world_action before migrating';
  end if;
  execute replace(definition,
    '(''morning'',''rain'',''moon'',''for-you-october-25'',''for-you-october-11'',''for-you-july-30'',''for-you-june-30'',''for-you-june-3'',''for-you-may-31'',''for-you-may-30'')',
    '(''morning'',''rain'',''moon'',''for-you-october-25'',''for-you-october-11'',''for-you-july-30'',''for-you-june-30'',''for-you-june-3'',''for-you-may-31'',''for-you-may-30'',''for-you-november-6'')');
end $$;

insert into public.songs(household_id,track_key,title,artist,mood,color,position)
select households.id, 'for-you-november-6', 'You sang for me - November 6',
  'Her voice, just for you', 'A little love, recorded', '#f3dce5',
  coalesce((select max(position) from public.songs where household_id=households.id),-1) + 1
from public.households households
on conflict(household_id,track_key) do nothing;

commit;
