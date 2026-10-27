process.on("uncaughtException", (e) => {
  console.error(e.message, e.where || "");
  process.exit(1);
});
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
const db = new PGlite();
await db.exec(
  `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,email text);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;create schema storage;create table storage.buckets(id text primary key,name text,public boolean);create table storage.objects(id uuid primary key,bucket_id text,name text);create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;`,
);
let sql = fs
  .readFileSync("supabase/migrations/202610270001_world.sql", "utf8")
  .replace("create extension if not exists pgcrypto;", "")
  .replace(
    "alter publication supabase_realtime add table public.activity_events;",
    "",
  );
await db.exec(sql);
console.log("Migration executed successfully");
const a = "00000000-0000-4000-8000-000000000001",
  b = "00000000-0000-4000-8000-000000000002",
  c = "00000000-0000-4000-8000-000000000003",
  h = "10000000-0000-4000-8000-000000000001",
  h2 = "10000000-0000-4000-8000-000000000002";
await db.exec(
  `insert into auth.users values('${a}','a'),('${b}','b'),('${c}','c');insert into public.profiles(id,display_name)values('${a}','A'),('${b}','B'),('${c}','C');insert into public.households(id)values('${h}'),('${h2}');insert into public.household_members(household_id,user_id)values('${h}','${a}'),('${h}','${b}'),('${h2}','${c}');insert into public.letters(household_id,sender,recipient,subject,body,envelope)values('${h}','${a}','${a}','private','a note','rose');`,
);
await db.exec(
  fs.readFileSync(
    "supabase/migrations/202610270002_personal_songs.sql",
    "utf8",
  ),
);
await db.exec(
  fs.readFileSync(
    "supabase/migrations/202610270003_more_personal_songs.sql",
    "utf8",
  ),
);
let passed = 0;
function check(ok, message) {
  if (!ok) throw Error(message);
  console.log("PASS " + message);
  passed++;
}
async function as(user) {
  await db.exec(
    `reset role;set role authenticated;select set_config('request.jwt.claim.sub','${user}',false)`,
  );
}
async function world() {
  return (await db.query("select public.get_world() as world")).rows[0].world;
}
async function action(command, key = crypto.randomUUID()) {
  return (
    await db.query("select public.world_action($1::jsonb,$2::uuid) as world", [
      JSON.stringify(command),
      key,
    ])
  ).rows[0].world;
}
async function denied(fn, message) {
  try {
    await fn();
  } catch {
    check(true, message);
    return;
  }
  throw Error("Access unexpectedly allowed: " + message);
}
await as(a);
check(
  (await db.query("select * from public.households")).rows.length === 1,
  "Household RLS",
);
await denied(
  () => db.exec("update public.households set treats=99999"),
  "Direct reward writes denied",
);
let w = await action({ kind: "adopt", species: "puppy" });
check(w.pets.length === 1, "Adoption");
const pet = w.pets[0].id;
w = await action({ kind: "care", pet, action: "cuddle" });
check(w.pets[0].affection === 72 && w.treats === 32, "Transactional care");
await denied(
  () => action({ kind: "care", pet, action: "cuddle" }),
  "Care cooldown",
);
const key = crypto.randomUUID();
w = await action({ kind: "game", game: "notes", reward: 99999 }, key);
check(w.treats === 35, "Fixed game reward");
w = await action({ kind: "game", game: "notes" }, key);
check(w.treats === 35, "Idempotent game reward");
await denied(() => action({ kind: "game", game: "treats" }), "Game cooldown");
w = await action({ kind: "decorate", item: "bow" });
check(
  w.treats === 27 && w.room.accessory === "bow",
  "Decoration cost and placement",
);
w = await action({ kind: "decorate", item: "bow" });
check(w.treats === 27, "Owned items do not double-charge");
await denied(
  () =>
    action({
      kind: "letter",
      subject: "cross",
      body: "x",
      recipient: c,
      envelope: "rose",
    }),
  "Cross-household recipient denied",
);

await denied(
  () => action({ kind: "decorate", item: "arbitrary-script" }),
  "Unknown decoration denied",
);
w = await action({ kind: "decorate", item: "mint-bed" });
check(
  w.room.bed === "mint-bed" && w.treats === 15,
  "Bed placement and server price",
);
w = await action({
  kind: "settings",
  name: "Our nest",
  greeting: "Welcome home",
  surprise: "A special little message",
});
check(
  w.name === "Our nest" && w.surprise === "A special little message",
  "Protected personalized settings",
);
await db.exec(
  `reset role;insert into public.songs(household_id,track_key,title,position)values('${h}','morning','Morning',0);`,
);
await as(a);
w = await action({ kind: "favorite-song", song: "morning" });
check(
  w.favoriteSongs.includes("morning") && w.songs[0].title === "Morning",
  "Shared music metadata and favorites",
);
for (const song of [
  "for-you-october-25",
  "for-you-october-11",
  "for-you-july-30",
  "for-you-june-30",
  "for-you-june-3",
  "for-you-may-31",
  "for-you-may-30",
]) {
  w = await action({ kind: "song", song });
  check(w.song === song, "Select personal recording " + song);
  w = await action({ kind: "favorite-song", song });
  check(w.favoriteSongs.includes(song), "Favorite personal recording " + song);
}
for (let i = 1; i < 10; i++) {
  await db.exec(
    `reset role;update public.action_receipts set created_at=now()-interval '2 minutes' where household_id='${h}' and kind='game';`,
  );
  await as(a);
  await action({ kind: "game", game: "notes" });
}
await db.exec(
  `reset role;update public.action_receipts set created_at=now()-interval '2 minutes' where household_id='${h}' and kind='game';`,
);
await as(a);
await denied(
  () => action({ kind: "game", game: "notes" }),
  "Daily game reward cap",
);
await as(b);
check(
  (await world()).letters.length === 0,
  "Self-addressed letter privacy in RPC",
);
check(
  (await db.query("select * from public.letters")).rows.length === 0,
  "Letter RLS",
);
await as(c);
check((await world()).pets.length === 0, "Cross-household read denied");
await denied(
  () => action({ kind: "care", pet, action: "feed" }),
  "Cross-household care denied",
);
await db.exec("reset role;set role anon");
await denied(() => world(), "Unauthenticated RPC denied");

await db.exec("reset role");
const bootstrap = fs
  .readFileSync("supabase/bootstrap.sql", "utf8")
  .replaceAll("FIRST_AUTH_USER_UUID", a);
await db.exec(bootstrap);
await db.exec(bootstrap);
check(
  (await db.query("select * from public.households")).rows.length === 2,
  "Provisioning reruns preserve existing homes",
);
check(
  (await db.query("select * from public.songs where household_id=$1", [h])).rows
    .length === 10,
  "Provisioning reruns preserve ordered songs",
);
const d = "00000000-0000-4000-8000-000000000004",
  e = "00000000-0000-4000-8000-000000000005";
await db.exec(
  `insert into auth.users values('${d}','d'),('${e}','e');insert into public.profiles(id,display_name)values('${d}','Existing profile');`,
);
const singleBootstrap = fs
  .readFileSync("supabase/bootstrap.sql", "utf8")
  .replaceAll("FIRST_AUTH_USER_UUID", d);
await db.exec(singleBootstrap);
await as(d);
check(
  (await world()).members.length === 1,
  "Provisioning fixes a missing membership with an existing profile",
);
await db.exec("reset role");
await db.exec(
  singleBootstrap.replace(
    "second_user uuid := NULL",
    () => `second_user uuid := '${e}'`,
  ),
);
await as(d);
check(
  (await world()).members.length === 2,
  "Provisioning can add the second partner later",
);
console.log(
  `${passed} database checks passed. Embedded PostgreSQL does not cover Supabase Realtime or Storage runtime.`,
);
await db.close();
