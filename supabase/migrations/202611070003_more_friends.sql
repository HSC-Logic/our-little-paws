begin;

alter table public.pets drop constraint pets_species_check;
alter table public.pets add constraint pets_species_check check (species in (
  'puppy','kitten','bunny','hamster','puppy-biscuit','kitten-willow',
  'bunny-rosie','hamster-maple','kitten-misty'
));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('not in (''puppy'',''kitten'',''bunny'',''hamster'')' in definition) = 0
    or position('else ''Peanut'' end' in definition) = 0 then
    raise exception 'Adoption rules changed; review world_action before migrating';
  end if;
  definition := replace(definition,
    'not in (''puppy'',''kitten'',''bunny'',''hamster'')',
    'not in (''puppy'',''kitten'',''bunny'',''hamster'',''puppy-biscuit'',''kitten-willow'',''bunny-rosie'',''hamster-maple'',''kitten-misty'')');
  definition := replace(definition, 'else ''Peanut'' end',
    'when ''puppy-biscuit'' then ''Biscuit'' when ''kitten-willow'' then ''Willow'' when ''bunny-rosie'' then ''Rosie'' when ''hamster-maple'' then ''Maple'' when ''kitten-misty'' then ''Misty'' else ''Peanut'' end');
  execute definition;
end $$;

commit;
