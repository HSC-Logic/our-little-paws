export type Species = "puppy" | "kitten" | "bunny" | "hamster";
export type Action =
  | "feed"
  | "treat"
  | "cuddle"
  | "pet"
  | "play"
  | "groom"
  | "sleep"
  | "wake"
  | "dance";
export interface Pet {
  id: string;
  name: string;
  species: Species;
  happiness: number;
  fullness: number;
  energy: number;
  affection: number;
  activity: string;
  adopted_at: string;
  updated_at: string;
  accessory?: string;
}
export interface Letter {
  id: string;
  subject: string;
  body: string;
  envelope: string;
  recipient: string;
  sender: string;
  read: boolean;
  favorite: boolean;
  created_at: string;
}
export interface Track {
  id: string;
  title: string;
  artist: string;
  mood: string;
  color: string;
}
export interface World {
  viewerId?: string;
  surprise?: string;
  songs?: Track[];
  favoriteSongs?: string[];
  id: string;
  name: string;
  greeting: string;
  treats: number;
  pets: Pet[];
  letters: Letter[];
  inventory: string[];
  room: Record<string, string>;
  events: { id: string; message: string; created_at: string }[];
  achievements: string[];
  song: string;
  members: { id: string; name: string }[];
}
export const species: {
  key: Species;
  name: string;
  trait: string;
  likes: string;
  color: string;
}[] = [
  {
    key: "puppy",
    name: "Mochi",
    trait: "A little ball of sunshine",
    likes: "Fetch, cuddles & happy tunes",
    color: "#edc59e",
  },
  {
    key: "kitten",
    name: "Luna",
    trait: "Curious eyes, sleepy soul",
    likes: "Yarn, piano & window watching",
    color: "#b7b5cf",
  },
  {
    key: "bunny",
    name: "Coco",
    trait: "A soft, gentle heart",
    likes: "Carrots, flowers & lullabies",
    color: "#f2ded1",
  },
  {
    key: "hamster",
    name: "Peanut",
    trait: "Small paws, big adventures",
    likes: "Treats, tunnels & playful music",
    color: "#e7b471",
  },
];
export const catalog = [
  { id: "sage", slot: "wall", name: "Sage daydream", cost: 15 },
  { id: "lavender", slot: "wall", name: "Lavender skies", cost: 15 },
  { id: "honey", slot: "rug", name: "Honey blossom rug", cost: 10 },
  { id: "rose", slot: "rug", name: "Rose petal rug", cost: 10 },
  { id: "bow", slot: "accessory", name: "Little pink bow", cost: 8 },
  { id: "hat", slot: "accessory", name: "Party hat", cost: 12 },
  { id: "mint-bed", slot: "bed", name: "Mint cloud bed", cost: 12 },
  { id: "rose-bed", slot: "bed", name: "Rose cloud bed", cost: 12 },
];
export const tracks = [
  {
    id: "morning",
    title: "A soft little morning",
    artist: "The windowsill sessions",
    mood: "Gentle piano",
    color: "#f3dfba",
  },
  {
    id: "rain",
    title: "Rain on our rooftop",
    artist: "Letters from home",
    mood: "Cozy rainy day",
    color: "#dce5df",
  },
  {
    id: "moon",
    title: "Under the same moon",
    artist: "A lullaby for two",
    mood: "Sleepy & sweet",
    color: "#e6def2",
  },
];
export const initialWorld = (): World => ({
  id: "demo",
  viewerId: "you",
  surprise: "You make ordinary days feel like home.",
  name: "Our little home",
  greeting: "A tiny world, just for the two of us.",
  treats: 30,
  favoriteSongs: [],
  pets: [],
  letters: [],
  inventory: [],
  room: { wall: "cream", rug: "rose" },
  events: [],
  achievements: [],
  song: "morning",
  members: [
    { id: "you", name: "You" },
    { id: "partner", name: "Your person" },
  ],
});
export function care(pet: Pet, action: Action, now = Date.now()): Pet {
  if (now - new Date(pet.updated_at).getTime() < 1500)
    throw new Error("A tiny pause between little moments, please.");
  if (pet.activity === "sleep" && action !== "wake")
    throw new Error("Let this sleepy little one rest, or wake them gently.");
  if (action === "play" && pet.energy < 15)
    throw new Error("A little rest before more adventures.");
  const p = {
    ...pet,
    updated_at: new Date(now).toISOString(),
    activity: action,
  };
  const add = (
    key: "happiness" | "fullness" | "energy" | "affection",
    n: number,
  ) => (p[key] = Math.max(0, Math.min(100, p[key] + n)));
  if (action === "feed") {
    add("fullness", 18);
    add("happiness", 4);
  }
  if (action === "treat") {
    add("fullness", 8);
    add("happiness", 8);
  }
  if (action === "cuddle" || action === "pet") {
    add("affection", 12);
    add("happiness", 8);
  }
  if (action === "play") {
    add("energy", -12);
    add("happiness", 15);
  }
  if (action === "groom") add("happiness", 8);
  if (action === "sleep") add("energy", 20);
  if (action === "dance") {
    add("happiness", 10);
    add("energy", -4);
  }
  return p;
}
