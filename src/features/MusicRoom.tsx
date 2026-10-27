import { useState } from "react";
import { useMusicPlayer } from "./useMusicPlayer";
import {
  Heart,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Music,
} from "lucide-react";
import { PetArt } from "../components/PetArt";
import { tracks } from "../lib/model";
import type { Props } from "./types";
export function MusicRoom({ world, act }: Props) {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const songs = world.songs?.length ? world.songs : tracks;
  const index = songs.findIndex((t) => t.id === world.song);
  const track = songs[index < 0 ? 0 : index];
  const player = useMusicPlayer(track.id);
  const { playing, volume, setVolume } = player;
  return (
    <>
      <audio
        ref={player.audioRef}
        loop
        preload="none"
        onPlay={player.onPlay}
        onPause={player.onPause}
        onError={player.onError}
        aria-label="Our little soundtrack"
      />
      <div className="section-heading">
        <div>
          <span className="eyebrow">OUR SOUNDTRACK</span>
          <h2>A little melody, a lot of love</h2>
          <p>Some moments sound better together.</p>
        </div>
        <span className="pill">Original instrumental melodies</span>
      </div>
      <div className="music-layout">
        <section
          className="record-scene paper"
          style={{
            backgroundImage: `linear-gradient(180deg,#f5dff65c,#e3d4f4d9),url(${import.meta.env.BASE_URL}art/cozy-room.webp)`,
          }}
        >
          <span className="floating-note">♪</span>
          <span className="floating-note second">♫</span>
          <div className={`vinyl ${playing ? "spinning" : ""}`}>
            <div>
              <Heart fill="currentColor" size={28} />
            </div>
          </div>
          <div className="record-base" />
          <div className="dancing-friends">
            {world.pets.slice(0, 3).map((p) => (
              <PetArt
                key={p.id}
                species={p.species}
                activity={playing ? "dance" : "idle"}
              />
            ))}
          </div>
          <p className="handwritten">a song for our little world</p>
        </section>
        <section className="paper player">
          <span className="eyebrow">ON THE TURNTABLE</span>
          <h2>{track.title}</h2>
          <p>{track.artist}</p>
          <div className="waveform">
            {Array.from({ length: 35 }, (_, i) => (
              <i key={i} style={{ height: 12 + ((i * 17) % 41) }} />
            ))}
          </div>
          <div className="player-controls">
            <button
              aria-label="Previous track"
              onClick={() =>
                void act({
                  kind: "song",
                  song: songs[(index + songs.length - 1) % songs.length].id,
                })
              }
            >
              <SkipBack />
            </button>
            <button
              className="primary round"
              aria-label={playing ? "Pause" : "Play"}
              onClick={() => void player.toggle()}
            >
              {playing ? <Pause /> : <Play />}
            </button>
            <button
              aria-label="Next track"
              onClick={() =>
                void act({
                  kind: "song",
                  song: songs[(index + 1) % songs.length].id,
                })
              }
            >
              <SkipForward />
            </button>
          </div>
          <label className="volume">
            <Volume2 size={18} />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step=".01"
              value={volume}
              onChange={(e) => setVolume(+e.target.value)}
            />
          </label>
          <small>
            Original instrumental loops, made for this little world. Track
            choice is shared; playback and volume stay on this device.
          </small>
          {player.error && <p role="alert">{player.error}</p>}
        </section>
      </div>
      <div className="section-heading">
        <h3>Little playlists for every feeling</h3>
        <button
          className="secondary"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          {favoritesOnly ? "All songs" : "Favorite songs"}
          <Heart size={15} />
        </button>
      </div>
      <div className="playlist-grid">
        {songs
          .filter((t) => !favoritesOnly || world.favoriteSongs?.includes(t.id))
          .map((t) => (
            <article
              className={`paper playlist ${world.song === t.id ? "active" : ""}`}
              key={t.id}
            >
              <button
                className="track-choice"
                onClick={() => void act({ kind: "song", song: t.id })}
              >
                <span style={{ background: t.color }}>
                  <Music />
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <small>{t.mood}</small>
                </div>
              </button>
              <button
                aria-label={`Favorite ${t.title}`}
                aria-pressed={!!world.favoriteSongs?.includes(t.id)}
                onClick={() => void act({ kind: "favorite-song", song: t.id })}
              >
                <Heart
                  size={18}
                  fill={
                    world.favoriteSongs?.includes(t.id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </article>
          ))}
      </div>
      {favoritesOnly && !world.favoriteSongs?.length && (
        <p>Tap a heart to keep a little melody here.</p>
      )}
    </>
  );
}
