-- Our Little Paws: private, invited two-person households. Apply as database owner.
create extension if not exists pgcrypto;
create table public.profiles(id uuid primary key references auth.users on delete cascade, display_name text not null check(length(display_name) between 1 and 50), created_at timestamptz not null default now());
create table public.households(id uuid primary key default gen_random_uuid(), name text not null default 'Our little home' check(length(name) between 1 and 50), greeting text not null default 'A tiny world, just for the two of us.' check(length(greeting) between 1 and 160), treats integer not null default 30 check(treats>=0), song text not null default 'morning',surprise text not null default 'You make ordinary days feel like home.' check(length(surprise) between 1 and 300), created_at timestamptz not null default now());
create table public.household_members(id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households on delete cascade, user_id uuid not null unique references public.profiles on delete cascade, unique(household_id,user_id));
create function public.limit_members() returns trigger language plpgsql set search_path='' as $$ begin perform 1 from public.households where id=new.household_id for update; if (select count(*) from public.household_members where household_id=new.household_id)>=2 then raise exception 'This little world has room for two members'; end if; return new; end $$;
create trigger household_capacity before insert on public.household_members for each row execute function public.limit_members();
create table public.pets(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,species text not null check(species in ('puppy','kitten','bunny','hamster')),name text not null check(length(name) between 1 and 24),happiness integer not null default 75 check(happiness between 0 and 100),fullness integer not null default 65 check(fullness between 0 and 100),energy integer not null default 80 check(energy between 0 and 100),affection integer not null default 60 check(affection between 0 and 100),activity text not null default 'idle' check(activity in ('idle','feed','treat','cuddle','pet','play','groom','sleep','wake','dance')),adopted_at timestamptz not null default now(),updated_at timestamptz not null default '2000-01-01',unique(household_id,species));
create table public.pet_actions(id uuid primary key default gen_random_uuid(), household_id uuid not null references public.households on delete cascade,pet_id uuid references public.pets on delete cascade,actor_id uuid not null references public.profiles,action text not null,created_at timestamptz not null default now());
create table public.inventory(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,item text not null check(item in ('sage','lavender','honey','rose','bow','hat','mint-bed','rose-bed')),created_at timestamptz not null default now(),unique(household_id,item));
create table public.room_items(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,slot text not null check(slot in ('wall','rug','accessory','bed')),item text not null check(item in ('sage','lavender','honey','rose','bow','hat','mint-bed','rose-bed')),updated_at timestamptz not null default now(),unique(household_id,slot));
create table public.letters(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,sender uuid not null references public.profiles,recipient uuid not null references public.profiles,subject text not null check(length(subject) between 1 and 100),body text not null check(length(body) between 1 and 4000),envelope text not null check(envelope in ('rose','sage','lavender')),read boolean not null default false,favorite boolean not null default false,created_at timestamptz not null default now());
create table public.songs(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,track_key text not null check(track_key in ('morning','rain','moon')),title text not null,position integer not null check(position>=0),source text not null default 'silent',artist text not null default 'The little home sessions',mood text not null default 'Soft & cozy',color text not null default '#e6defa' check(color ~ '^#[0-9a-fA-F]{6}$'),favorite boolean not null default false,unique(household_id,track_key),unique(household_id,position));
create table public.achievements(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,name text not null,created_at timestamptz not null default now(),unique(household_id,name));
create table public.activity_events(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,message text not null,created_at timestamptz not null default now());
create table public.action_receipts(id uuid primary key default gen_random_uuid(),household_id uuid not null references public.households on delete cascade,actor_id uuid not null references public.profiles,idempotency_key uuid not null,kind text not null,created_at timestamptz not null default now(),unique(actor_id,idempotency_key));
create function public.my_household() returns uuid language sql stable security definer set search_path='' as $$ select household_id from public.household_members where user_id=auth.uid() $$;
revoke all on function public.my_household() from public,anon;
grant execute on function public.my_household() to authenticated;
-- Membership helper avoids recursive membership policies. No public INSERT/UPDATE/DELETE grants.
do $$ declare t text; begin foreach t in array array['profiles','households','household_members','pets','pet_actions','inventory','room_items','letters','songs','achievements','activity_events','action_receipts'] loop execute format('alter table public.%I enable row level security',t); execute format('revoke all on public.%I from anon, authenticated',t); execute format('grant select on public.%I to authenticated',t); end loop; end $$;
create policy household_read on public.households for select to authenticated using(id=public.my_household());
create policy profile_read on public.profiles for select to authenticated using(id=auth.uid() or id in(select user_id from public.household_members where household_id=public.my_household()));
create policy member_read on public.household_members for select to authenticated using(household_id=public.my_household());
create policy letters_private on public.letters for select to authenticated using(household_id=public.my_household() and auth.uid() in(sender,recipient));
do $$ declare t text; begin foreach t in array array['pets','pet_actions','inventory','room_items','songs','achievements','activity_events','action_receipts'] loop execute format('create policy member_read on public.%I for select to authenticated using(household_id=public.my_household())',t); end loop; end $$;
do $$ declare t text; begin foreach t in array array['household_members','pets','pet_actions','inventory','room_items','letters','songs','achievements','activity_events','action_receipts'] loop execute format('create index on public.%I(household_id)',t); end loop; end $$;
create index on public.pet_actions(pet_id,created_at desc);
create index on public.pet_actions(actor_id,created_at desc);
create index on public.letters(recipient,created_at desc);
create index on public.letters(sender);
create index on public.action_receipts(actor_id,kind,created_at desc);
create index on public.activity_events(household_id,created_at desc);
create function public.get_world() returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare h uuid:=public.my_household(); result jsonb;
begin
 if auth.uid() is null or h is null then raise exception 'An invited household membership is required'; end if;
 select jsonb_build_object('id',id,'viewerId',auth.uid(),'name',name,'greeting',greeting,'treats',treats,'song',song,'surprise',surprise) into result from public.households where id=h;
 return result || jsonb_build_object(
 'songs',coalesce((select jsonb_agg(jsonb_build_object('id',track_key,'title',title,'artist',artist,'mood',mood,'color',color) order by position) from public.songs where household_id=h),'[]'::jsonb),
 'favoriteSongs',coalesce((select jsonb_agg(track_key) from public.songs where household_id=h and favorite),'[]'::jsonb),
 'pets',coalesce((select jsonb_agg(to_jsonb(p) order by adopted_at) from public.pets p where household_id=h),'[]'::jsonb),
 'letters',coalesce((select jsonb_agg(to_jsonb(l) order by created_at desc) from public.letters l where household_id=h and auth.uid() in (sender,recipient)),'[]'::jsonb),
 'inventory',coalesce((select jsonb_agg(item) from public.inventory where household_id=h),'[]'::jsonb),
 'room',jsonb_build_object('wall','cream','rug','rose')||coalesce((select jsonb_object_agg(slot,item) from public.room_items where household_id=h),'{}'::jsonb),
 'events',coalesce((select jsonb_agg(to_jsonb(e)) from (select id,message,created_at from public.activity_events where household_id=h order by created_at desc limit 100)e),'[]'::jsonb),
 'achievements',coalesce((select jsonb_agg(name) from public.achievements where household_id=h),'[]'::jsonb),
 'members',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'name',p.display_name)) from public.profiles p join public.household_members m on m.user_id=p.id where m.household_id=h),'[]'::jsonb));
end $$;
revoke all on function public.get_world() from public,anon;
grant execute on function public.get_world() to authenticated;
create function public.world_action(p_command jsonb,p_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare h uuid:=public.my_household(); u uuid:=auth.uid(); k text:=p_command->>'kind'; a text:=p_command->>'action'; p public.pets; msg text; ach text; v_item text:=p_command->>'item'; item_slot text; price integer; recipient_id uuid; balance integer;
begin
 if u is null or h is null then raise exception 'Not authorized'; end if;
 if p_key is null then raise exception 'An idempotency key is required'; end if;
 -- One lock serializes household balances, care, inventory, rewards and duplicate checks.
 select treats into balance from public.households where id=h for update;
 if exists(select 1 from public.action_receipts where actor_id=u and idempotency_key=p_key) then return public.get_world(); end if;
 if (select count(*) from public.action_receipts where household_id=h and created_at>now()-interval '1 minute')>=60 then raise exception 'A tiny pause, please'; end if;
 if k='adopt' then
  if p_command->>'species' not in ('puppy','kitten','bunny','hamster') then raise exception 'Unknown species'; end if;
  insert into public.pets(household_id,species,name) values(h,p_command->>'species',case p_command->>'species' when 'puppy' then 'Mochi' when 'kitten' then 'Luna' when 'bunny' then 'Coco' else 'Peanut' end) returning * into p;
  msg:=p.name||' found a forever home!';
  if (select count(*) from public.pets where household_id=h)=4 then ach:='Happy Little Family'; end if;
 elsif k in ('care','rename') then
  select * into p from public.pets where id=(p_command->>'pet')::uuid and household_id=h for update;
  if not found then raise exception 'Pet not found'; end if;
  if k='rename' then update public.pets set name=trim(p_command->>'name') where id=p.id;msg:='A little friend has a lovely new name.';
  else
   if a is null or a not in ('feed','treat','cuddle','pet','play','groom','sleep','wake','dance') then raise exception 'Unknown care action'; end if;
   if p.updated_at>now()-interval '1500 milliseconds' then raise exception 'A tiny pause between little moments, please'; end if;
   if p.activity='sleep' and a<>'wake' then raise exception 'Wake this sleepy little one gently first'; end if;
   if a='play' and p.energy<15 then raise exception 'A little rest before more adventures'; end if;
   update public.pets set fullness=least(100,fullness+case a when 'feed' then 18 when 'treat' then 8 else 0 end),
    happiness=least(100,happiness+case a when 'feed' then 4 when 'treat' then 8 when 'cuddle' then 8 when 'pet' then 8 when 'play' then 15 when 'groom' then 8 when 'dance' then 10 else 0 end),
    affection=least(100,affection+case when a in ('cuddle','pet') then 12 else 0 end),
    energy=greatest(0,least(100,energy+case a when 'sleep' then 20 when 'play' then -12 when 'dance' then -4 else 0 end)),activity=a,updated_at=now() where id=p.id;
   if (select count(*) from public.pet_actions where household_id=h and created_at>=date_trunc('day',now()))<30 then update public.households set treats=treats+2 where id=h;end if;
   insert into public.pet_actions(household_id,pet_id,actor_id,action) values(h,p.id,u,a);
   msg:=p.name||' just got a little '||a||'!';
   if a='cuddle' then ach:='First Cuddle'; elsif a='dance' then ach:='Music Lovers';end if;
   if (select count(*) from public.pet_actions where household_id=h)>=50 then insert into public.achievements(household_id,name) values(h,'Best Pet Parents') on conflict do nothing; end if;
  end if;
 elsif k='letter' then
  recipient_id:=(p_command->>'recipient')::uuid;
  if not exists(select 1 from public.household_members where household_id=h and user_id=recipient_id) then raise exception 'Recipient must belong to this household';end if;
  insert into public.letters(household_id,sender,recipient,subject,body,envelope) values(h,u,recipient_id,trim(p_command->>'subject'),trim(p_command->>'body'),p_command->>'envelope');
  msg:='A little letter was delivered.';ach:='First Letter';
 elsif k='letter-state' then
  update public.letters set read=case when recipient=u then coalesce((p_command->>'read')::boolean,read) else read end,favorite=coalesce((p_command->>'favorite')::boolean,favorite) where id=(p_command->>'id')::uuid and household_id=h and u in(sender,recipient);
  if not found then raise exception 'Letter not found';end if;msg:='A little letter was opened or saved.';
 elsif k='decorate' then
  if v_item in ('sage','lavender') then item_slot:='wall';price:=15;elsif v_item in ('honey','rose') then item_slot:='rug';price:=10;elsif v_item in ('bow','hat') then item_slot:='accessory';price:=case v_item when 'bow' then 8 else 12 end;elsif v_item in ('mint-bed','rose-bed') then item_slot:='bed';price:=12;else raise exception 'Unknown decoration';end if;
  if not exists(select 1 from public.inventory where household_id=h and inventory.item=v_item) then
   if balance<price then raise exception 'A few more Love Treats and it is yours';end if;
   update public.households set treats=treats-price where id=h;insert into public.inventory(household_id,item) values(h,v_item);
  end if;
  insert into public.room_items(household_id,slot,item) values(h,item_slot,v_item) on conflict(household_id,slot) do update set item=excluded.item,updated_at=now();msg:='A little more cozy.';ach:='Cozy Home';
 elsif k='favorite-song' then
  update public.songs set favorite=not favorite where household_id=h and track_key=p_command->>'song';if not found then raise exception 'Unknown song';end if;msg:='A little melody was saved.';
 elsif k='song' then
  if p_command->>'song' not in ('morning','rain','moon') then raise exception 'Unknown song';end if;
  update public.households set song=p_command->>'song' where id=h;msg:='A new little melody is on the turntable.';
 elsif k='game' then
  if p_command->>'game' not in ('treats','notes') then raise exception 'Unknown game';end if;
  if exists(select 1 from public.action_receipts where household_id=h and kind='game' and created_at>now()-interval '1 minute') then raise exception 'Another participation gift is available in a minute';end if;
  if (select count(*) from public.action_receipts where household_id=h and kind='game' and created_at>=date_trunc('day',now()))>=10 then raise exception 'All of today''s little gifts are collected. Keep playing for fun!';end if;
  -- Scores and supplied amounts are deliberately ignored: fixed bounded participation only.
  update public.households set treats=treats+3 where id=h;msg:='A playful little break.';
 elsif k='settings' then update public.households set name=trim(p_command->>'name'),greeting=trim(p_command->>'greeting'),surprise=coalesce(nullif(trim(p_command->>'surprise'),''),surprise) where id=h;msg:='Our little details were updated.';
 else raise exception 'Unknown action';end if;
 if ach is not null then insert into public.achievements(household_id,name) values(h,ach) on conflict do nothing;end if;
 insert into public.action_receipts(household_id,actor_id,idempotency_key,kind) values(h,u,p_key,k);
 insert into public.activity_events(household_id,message) values(h,coalesce(msg,'A little moment happened.'));
 return public.get_world();
end $$;
revoke all on function public.world_action(jsonb,uuid) from public,anon;
grant execute on function public.world_action(jsonb,uuid) to authenticated;
revoke all on function public.limit_members() from public,anon,authenticated;
alter publication supabase_realtime add table public.activity_events;
insert into storage.buckets(id,name,public) values('household-audio','household-audio',false) on conflict do nothing;
create policy household_audio_read on storage.objects for select to authenticated using(bucket_id='household-audio' and (storage.foldername(name))[1]=public.my_household()::text);
-- Audio upload remains admin-only. Never make this bucket public.
