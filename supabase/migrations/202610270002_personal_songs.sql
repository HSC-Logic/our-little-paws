begin;

alter table public.songs drop constraint songs_track_key_check;
alter table public.songs add constraint songs_track_key_check
  check(track_key in ('morning','rain','moon','for-you-october-25','for-you-october-11'));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('(''morning'',''rain'',''moon'')' in definition) = 0 then
    raise exception 'Song validation changed; review world_action before migrating';
  end if;
  execute replace(definition, '(''morning'',''rain'',''moon'')',
    '(''morning'',''rain'',''moon'',''for-you-october-25'',''for-you-october-11'')');
end $$;

insert into public.songs(household_id,track_key,title,artist,mood,color,position)
select households.id, recordings.key, recordings.title, 'Her voice, just for you',
  'A little love, recorded', '#f3dce5',
  greatest(coalesce((select max(position) from public.songs where household_id=households.id),-1),2) + recordings.position_offset
from public.households households cross join (values
  ('for-you-october-25','You sang for me - October 25',1),
  ('for-you-october-11','You sang for me - October 11',2)
) recordings(key,title,position_offset)
on conflict(household_id,track_key) do nothing;

commit;
