import { useEffect, useRef, useState } from "react";
import { tracks } from "../lib/model";
export function useMusicPlayer(trackId: string) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantsPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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
    setCurrentTime(0);
    setDuration(0);
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
    currentTime,
    duration,
    onTimeUpdate: () => setCurrentTime(audioRef.current?.currentTime || 0),
    onDurationChange: () => {
      const seconds = audioRef.current?.duration;
      setDuration(seconds && Number.isFinite(seconds) ? seconds : 0);
    },
    seek: (seconds: number) => {
      if (!audioRef.current || !Number.isFinite(seconds) || duration <= 0)
        return;
      const position = Math.max(0, Math.min(seconds, duration));
      audioRef.current.currentTime = position;
      setCurrentTime(position);
    },
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
