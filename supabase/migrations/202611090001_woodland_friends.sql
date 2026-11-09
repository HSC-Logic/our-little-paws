begin;

alter table public.pets drop constraint pets_species_check;
alter table public.pets add constraint pets_species_check check (species in (
  'puppy','kitten','bunny','hamster','puppy-biscuit','kitten-willow',
  'bunny-rosie','hamster-maple','kitten-misty','fox','hedgehog','redpanda'
));

do $$
declare definition text;
begin
  definition := pg_get_functiondef('public.world_action(jsonb,uuid)'::regprocedure);
  if position('not in (''puppy'',''kitten'',''bunny'',''hamster'',''puppy-biscuit'',''kitten-willow'',''bunny-rosie'',''hamster-maple'',''kitten-misty'')' in definition) = 0
    or position('else ''Peanut'' end' in definition) = 0 then
    raise exception 'Adoption rules changed; review world_action before migrating';
  end if;
  definition := replace(definition,
    'not in (''puppy'',''kitten'',''bunny'',''hamster'',''puppy-biscuit'',''kitten-willow'',''bunny-rosie'',''hamster-maple'',''kitten-misty'')',
    'not in (''puppy'',''kitten'',''bunny'',''hamster'',''puppy-biscuit'',''kitten-willow'',''bunny-rosie'',''hamster-maple'',''kitten-misty'',''fox'',''hedgehog'',''redpanda'')');
  definition := replace(definition, 'else ''Peanut'' end',
    'when ''fox'' then ''Pippin'' when ''hedgehog'' then ''Hazel'' when ''redpanda'' then ''Bao'' else ''Peanut'' end');
  execute definition;
end $$;

commit;
