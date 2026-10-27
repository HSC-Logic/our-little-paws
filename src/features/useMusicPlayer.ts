import { useEffect, useRef, useState } from "react";
import { tracks } from "../lib/model";
export function useMusicPlayer(trackId: string) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [error, setError] = useState("");
  const selectedId = tracks.some((track) => track.id === trackId)
    ? trackId
    : "morning";
  const extension = selectedId.startsWith("for-you-") ? "opus" : "wav";
  const source = `${import.meta.env.BASE_URL}audio/${selectedId}.${extension}`;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let active = true;
    setError("");
    audio.src = source;
    audio.load();
    if (wantsPlayback.current)
      void audio.play().catch(() => {
        if (active) {
          wantsPlayback.current = false;
          setPlaying(false);
          setError("Playback could not start. Press Play to try again.");
        }
      });
    return () => {
      active = false;
      audio.pause();
    };
  }, [source]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);
  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    if (wantsPlayback.current) {
      wantsPlayback.current = false;
      audio.pause();
      setPlaying(false);
    } else {
      wantsPlayback.current = true;
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        wantsPlayback.current = false;
        setPlaying(false);
        setError("Playback could not start. Press Play to try again.");
      }
    }
  }
  return {
    audioRef,
    playing,
    volume,
    setVolume,
    error,
    toggle,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onError: () => {
      wantsPlayback.current = false;
      setPlaying(false);
      setError(
        "This melody could not load. Check your connection and try Play again.",
      );
    },
  };
}
