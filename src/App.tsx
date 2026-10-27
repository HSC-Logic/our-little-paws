import { useEffect, useState, lazy, Suspense } from "react";
import { HashRouter, NavLink, Route, Routes, Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Home,
  Heart,
  Music,
  Mail,
  Flower2,
  Gamepad2,
  Gift,
  Settings,
  PawPrint,
  ArrowRight,
  X,
  LogOut,
  WifiOff,
} from "lucide-react";
import { motion, MotionConfig } from "motion/react";
import { command, demo, getWorld, supabase } from "./lib/api";
import type { Command } from "./lib/api";
import { useUI } from "./lib/ui";
import { PetArt } from "./components/PetArt";
import { HomeRoom } from "./features/HomeRoom";
const Adoption = lazy(() =>
  import("./features/Adoption").then((m) => ({ default: m.Adoption })),
);
const MusicRoom = lazy(() =>
  import("./features/MusicRoom").then((m) => ({ default: m.MusicRoom })),
);
const Mailbox = lazy(() =>
  import("./features/Mailbox").then((m) => ({ default: m.Mailbox })),
);
const Decorate = lazy(() =>
  import("./features/Decorate").then((m) => ({ default: m.Decorate })),
);
const Games = lazy(() =>
  import("./features/Games").then((m) => ({ default: m.Games })),
);
const Moments = lazy(() =>
  import("./features/Moments").then((m) => ({ default: m.Moments })),
);
const SettingsRoom = lazy(() =>
  import("./features/SettingsRoom").then((m) => ({ default: m.SettingsRoom })),
);
const navigation = [
  { path: "/", label: "Our home", icon: Home },
  { path: "/pets", label: "Little paws", icon: PawPrint },
  { path: "/music", label: "Music room", icon: Music },
  { path: "/mail", label: "Love letters", icon: Mail },
  { path: "/decorate", label: "Make it cozy", icon: Flower2 },
  { path: "/play", label: "Playtime", icon: Gamepad2 },
  { path: "/moments", label: "Little moments", icon: Gift },
];
const client = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: true } },
});
function Login() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  return (
    <div className="welcome">
      <PetArt />
      <h1>Your little world awaits</h1>
      <p>Sign in with your privately invited account.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await supabase!.auth.signInWithPassword({
            email,
            password,
          });
          if (result.error) setError(result.error.message);
        }}
      >
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="primary">
          Come on in <ArrowRight size={16} />
        </button>
        <p role="alert">{error}</p>
      </form>
    </div>
  );
}
function App() {
  const [session, setSession] = useState<boolean | null>(demo ? true : null),
    [entered, setEntered] = useState(
      localStorage.getItem("little-paws-entered") === "yes",
    ),
    [online, setOnline] = useState(navigator.onLine),
    [more, setMore] = useState(false);
  const { notice, notify } = useUI();
  const queryClient = useQueryClient();
  const {
    data: world,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["world"],
    queryFn: getWorld,
    enabled: session === true,
  });
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth
      .getSession()
      .then(({ data }) => setSession(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
      queryClient.removeQueries({ queryKey: ["world"] });
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);
  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      if (navigator.onLine) void refetch();
    };
    addEventListener("online", update);
    addEventListener("offline", update);
    return () => {
      removeEventListener("online", update);
      removeEventListener("offline", update);
    };
  }, [refetch]);
  useEffect(() => {
    if (!supabase || !world) return;
    const channel = supabase
      .channel("our-home")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activity_events",
          filter: `household_id=eq.${world.id}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["world"] });
          notify("A little moment just happened at home.");
        },
      )
      .subscribe();
    return () => {
      void supabase!.removeChannel(channel);
    };
  }, [world?.id, queryClient, notify]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => notify(""), 4500);
    return () => clearTimeout(t);
  }, [notice, notify]);
  async function act(c: Command): Promise<boolean> {
    try {
      const next = await command(c);
      queryClient.setQueryData(["world"], next);
      notify(
        c.kind === "care"
          ? `${next.pets.find((p) => p.id === c.pet)?.name} loved that little moment!`
          : "A little moment, saved.",
      );
      return true;
    } catch (e) {
      notify(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
      return false;
    }
  }
  if (!entered)
    return (
      <main className="welcome">
        <div className="welcome-flower">✦</div>
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="eyebrow">A LITTLE LOVE. A LITTLE MAGIC.</span>
          <h1>
            Our Little Paws
            <br />
            <span>& Melodies</span>
          </h1>
          <p>A tiny world, just for the two of us.</p>
          <div className="welcome-pets">
            <PetArt species="kitten" />
            <PetArt species="puppy" activity="waving" />
            <PetArt species="bunny" />
          </div>
          <p>Somewhere soft to land. Someone little to love.</p>
          <button
            className="primary"
            onClick={() => {
              localStorage.setItem("little-paws-entered", "yes");
              setEntered(true);
            }}
          >
            Enter Our Little World <ArrowRight size={18} />
          </button>
          <small>
            {demo
              ? "Browser-local demo · your little world stays on this device"
              : "A private little world for two invited people"}
          </small>
        </motion.div>
      </main>
    );
  if (session === false) return <Login />;
  if (isLoading || session === null)
    return (
      <div className="welcome">
        <PawPrint className="loading" />
        <p>Waking up your little world…</p>
      </div>
    );
  if (error || !world)
    return (
      <div className="welcome">
        <h2>Our little world needs a moment</h2>
        <p>
          {error?.message || "No household is provisioned for this account."}
        </p>
        <button className="primary" onClick={() => void refetch()}>
          Try again
        </button>
        {supabase && (
          <button onClick={() => void supabase!.auth.signOut()}>
            Sign out
          </button>
        )}
      </div>
    );
  const props = { world, act };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <PawPrint size={25} />
            <Heart size={12} />
          </span>
          <span>
            Our Little Paws<small>& Melodies</small>
          </span>
        </Link>
        <p className="sidebar-caption">a tiny world for two</p>
        <nav>
          {navigation.map((n) => (
            <NavLink key={n.path} to={n.path} end>
              <n.icon size={20} />
              {n.label}
              {n.path === "/mail" &&
                world.letters.some(
                  (l) => !l.read && l.recipient === world.viewerId,
                ) && <i className="unread-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-note">
          <Heart size={21} />
          <p>
            Love grows in the
            <br />
            littlest moments.
          </p>
          <span>you + me + little paws</span>
        </div>
        <NavLink className="settings-link" to="/settings">
          <Settings size={18} />
          Our little details
        </NavLink>
        {supabase && (
          <button onClick={() => void supabase!.auth.signOut()}>
            <LogOut size={16} />
            Sign out
          </button>
        )}
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            <Heart size={15} />A little place to call ours
          </span>
          <div>
            <span className="treat-count">
              <Heart size={15} fill="currentColor" />
              {world.treats}
              <small>Love Treats</small>
            </span>
            <span className="avatar">
              Y<span>♡</span>
            </span>
          </div>
        </header>
        <div className={`mode-banner ${online ? "" : "offline"}`}>
          {!online ? (
            <>
              <WifiOff size={14} />
              Offline ·{" "}
              {demo
                ? "local demo is available"
                : "showing last loaded state; reconnect to make changes"}
            </>
          ) : demo ? (
            <>
              <span className="status-dot" />
              DEMO WORLD
              <span>Saved in this browser · no sync between devices</span>
            </>
          ) : (
            <>
              <span className="status-dot" />
              YOUR SHARED WORLD<span>Private, just for your household</span>
            </>
          )}
        </div>
        <main className="main-content">
          <Suspense fallback={<p role="status">Opening a little corner…</p>}>
            <Routes>
              <Route path="/" element={<HomeRoom {...props} />} />
              <Route path="/pets" element={<Adoption {...props} />} />
              <Route path="/music" element={<MusicRoom {...props} />} />
              <Route path="/mail" element={<Mailbox {...props} />} />
              <Route path="/decorate" element={<Decorate {...props} />} />
              <Route path="/play" element={<Games {...props} />} />
              <Route path="/moments" element={<Moments world={world} />} />
              <Route path="/settings" element={<SettingsRoom {...props} />} />
              <Route path="*" element={<HomeRoom {...props} />} />
            </Routes>
          </Suspense>
          <footer>
            Made of paws, melodies & a whole lot of love.
            <Heart size={12} />
          </footer>
        </main>
      </div>
      <nav className="mobile-nav">
        {navigation.slice(0, 4).map((n) => (
          <NavLink key={n.path} to={n.path} end>
            <n.icon size={21} />
            <span>{n.label}</span>
          </NavLink>
        ))}
        <NavLink to="/play">
          <Gamepad2 size={21} />
          <span>Playtime</span>
        </NavLink>
        <button
          aria-label="More rooms"
          aria-expanded={more}
          onClick={() => setMore(!more)}
        >
          <Flower2 size={21} />
          <span>More</span>
        </button>
      </nav>
      {more && (
        <div className="more-rooms paper">
          <button
            className="close"
            aria-label="Close rooms"
            onClick={() => setMore(false)}
          >
            <X />
          </button>
          <h3>More little corners</h3>
          {[
            ...navigation.slice(4),
            { path: "/settings", label: "Our little details", icon: Settings },
          ].map((n) => (
            <Link key={n.path} to={n.path} onClick={() => setMore(false)}>
              <n.icon size={20} />
              {n.label}
            </Link>
          ))}
        </div>
      )}
      {notice && (
        <div role="status" className="toast">
          <Heart size={17} />
          {notice}
          <button aria-label="Dismiss notification" onClick={() => notify("")}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
export default function Root() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={client}>
        <HashRouter>
          <App />
        </HashRouter>
      </QueryClientProvider>
    </MotionConfig>
  );
}
