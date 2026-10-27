import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function BackgroundMusic() {
  const { pathname } = useLocation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [playing, setPlaying] = useState(false);
  const inMusicRoom = pathname === "/music";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.15;
    if (!enabled || inMusicRoom) {
      audio.pause();
      setPlaying(false);
      return;
    }
    let active = true;
    const start = () => {
      if (!audio.paused) return;
      void audio
        .play()
        .then(() => {
          if (!active) audio.pause();
        })
        .catch(() => {});
    };
    start();
    document.addEventListener("pointerdown", start);
    document.addEventListener("keydown", start);
    return () => {
      active = false;
      audio.pause();
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
    };
  }, [enabled, inMusicRoom]);

  return (
    <>
      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}audio/moon.wav`}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setPlaying(false)}
        aria-label="Romantic instrumental background music"
      />
      {!inMusicRoom && (
        <button
          className="background-music secondary"
          type="button"
          aria-label={
            enabled ? "Mute background music" : "Enable background music"
          }
          aria-pressed={enabled}
          onClick={() => setEnabled(!enabled)}
        >
          {enabled ? (playing ? "Music on" : "Music ready") : "Music off"}
        </button>
      )}
    </>
  );
}
