import type { Species } from "../lib/model";
export function PetArt({
  species = "puppy",
  activity = "idle",
  accessory = "",
  className = "",
}: {
  species?: Species;
  activity?: string;
  accessory?: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={`${species} ${activity}`}
      className={`pet-art illustrated-pet ${activity} ${className}`}
    >
      <img
        className="pet-illustration"
        src={`${import.meta.env.BASE_URL}art/${species}.webp`}
        alt=""
        draggable={false}
      />
      {accessory === "bow" && (
        <svg
          className="pet-accessory bow-accessory"
          viewBox="0 0 80 50"
          aria-hidden="true"
        >
          <path
            d="M39 25Q-3-14 6 32Q13 52 39 25Q83-14 75 32Q66 52 39 25"
            fill="#f59dc8"
            stroke="#b566a0"
            strokeWidth="3"
          />
          <circle
            cx="40"
            cy="25"
            r="9"
            fill="#ffcee9"
            stroke="#b566a0"
            strokeWidth="3"
          />
        </svg>
      )}
      {accessory === "hat" && (
        <svg
          className="pet-accessory hat-accessory"
          viewBox="0 0 80 90"
          aria-hidden="true"
        >
          <path
            d="M7 80L40 6L73 80Z"
            fill="#b9a3f4"
            stroke="#8e71bb"
            strokeWidth="3"
          />
          <path d="M20 50L56 40M12 69L64 58" stroke="#f9d998" strokeWidth="8" />
          <circle cx="40" cy="7" r="6" fill="#ffe9a9" />
        </svg>
      )}
      {activity === "sleep" && (
        <span className="pet-sleep" aria-hidden="true">
          z z Z
        </span>
      )}
      {["cuddle", "pet", "happy"].includes(activity) && (
        <span className="pet-love" aria-hidden="true">
          ♡
        </span>
      )}
      {["feed", "treat"].includes(activity) && (
        <span className="pet-snack" aria-hidden="true">
          ✦
        </span>
      )}
      {activity === "play" && <span className="pet-toy" aria-hidden="true" />}
    </span>
  );
}
