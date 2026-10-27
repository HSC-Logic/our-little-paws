import { InstallAppCard } from "../components/InstallAppCard";
import { useForm } from "react-hook-form";
import { Settings, ArrowRight } from "lucide-react";
import type { Props } from "./types";
export function SettingsRoom({ world, act }: Props) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: world.name,
      surprise: world.surprise || "You make ordinary days feel like home.",
      greeting: world.greeting,
    },
  });
  return (
    <section className="paper settings">
      <Settings />
      <h2>Your little world</h2>
      <form
        onSubmit={handleSubmit(async (v) => {
          await act({ kind: "settings", ...v });
        })}
      >
        <label>
          Home name
          <input required maxLength={50} {...register("name")} />
        </label>
        <label>
          A greeting for you two
          <textarea required maxLength={160} {...register("greeting")} />
        </label>
        <label>
          A little wrapped surprise
          <textarea required maxLength={300} {...register("surprise")} />
        </label>
        <button className="primary">
          Save our little details
          <ArrowRight size={16} />
        </button>
      </form>
      <p>Personal dates and names are yours to add. Nothing is assumed.</p>
      <InstallAppCard />
    </section>
  );
}
