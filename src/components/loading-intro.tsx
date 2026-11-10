"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 5700;
const EXIT_DURATION = 950;
const SESSION_KEY = "biron-portfolio-network-intro-seen";
const SOUND_PREFERENCE_KEY = "biron-portfolio-intro-sound";
const MUSIC_URL = "/audio/earth-network-ambient.wav";
const MUSIC_VOLUME = 0.22;

type AudioFade = (target: number, duration: number, stopAtEnd?: boolean) => void;

export function LoadingIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [soundReady, setSoundReady] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const fadeAudioRef = useRef<AudioFade | null>(null);
  const startPlaybackRef = useRef<(gesture: boolean) => void>(() => {});
  const soundPreferenceRef = useRef(true);
  const playbackPendingRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    setPortalReady(true);

    const stopAudio = () => fadeAudioRef.current?.(0, 0, true);
    const finish = () => {
      stopAudio();
      delete root.dataset.portfolioIntroActive;
      delete root.dataset.portfolioIntroPhase;
      root.dataset.portfolioIntroSeen = "true";
      setVisible(false);
    };

    if (root.dataset.portfolioIntroSeen === "true" || motionPreference.matches) {
      finish();
      return;
    }

    root.dataset.portfolioIntroActive = "true";
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The intro still completes on this mount if storage is unavailable.
    }

    let preferred = true;
    try {
      const storedPreference = window.sessionStorage.getItem(SOUND_PREFERENCE_KEY);
      if (storedPreference !== null) preferred = storedPreference === "on";
    } catch {
      // Default to sound on when session storage is unavailable.
    }
    soundPreferenceRef.current = preferred;

    const audio = new Audio(MUSIC_URL);
    audio.preload = "auto";
    audio.loop = false;
    audio.volume = 0;

    const fadeAudio: AudioFade = (target, duration, stopAtEnd = false) => {
      if (audioFrameRef.current !== null) {
        window.cancelAnimationFrame(audioFrameRef.current);
        audioFrameRef.current = null;
      }

      const from = audio.volume;
      const startedAt = performance.now();
      const safeDuration = Math.max(0, duration);
      const finishFade = () => {
        audio.volume = target;
        audioFrameRef.current = null;
        if (stopAtEnd) {
          audio.pause();
          try { audio.currentTime = 0; } catch { /* The source may not have loaded metadata yet. */ }
          setSoundEnabled(false);
        }
      };

      if (safeDuration === 0) {
        finishFade();
        return;
      }

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / safeDuration);
        const eased = progress * progress * (3 - 2 * progress);
        audio.volume = from + (target - from) * eased;
        if (progress >= 1) finishFade();
        else audioFrameRef.current = window.requestAnimationFrame(step);
      };
      audioFrameRef.current = window.requestAnimationFrame(step);
    };
    fadeAudioRef.current = fadeAudio;

    const beginPlayback = async (gesture = false) => {
      if (!soundPreferenceRef.current || disposed || playbackPendingRef.current) return;
      playbackPendingRef.current = true;
      setSoundEnabled(true);
      try {
        await audio.play();
        playbackPendingRef.current = false;
        if (disposed || !soundPreferenceRef.current || root.dataset.portfolioIntroActive !== "true" || root.dataset.portfolioIntroPhase === "exit") {
          audio.pause();
          return;
        }
        setSoundBlocked(false);
        setSoundEnabled(true);
        fadeAudio(MUSIC_VOLUME, gesture ? 650 : 2000);
      } catch {
        playbackPendingRef.current = false;
        if (!disposed && soundPreferenceRef.current) {
          setSoundEnabled(false);
          setSoundBlocked(true);
        }
      }
    };
    startPlaybackRef.current = (gesture) => { void beginPlayback(gesture); };

    setSoundReady(true);
    setSoundBlocked(false);
    setSoundEnabled(false);
    if (preferred) void beginPlayback();

    const beginExit = (skip = false) => {
      if (root.dataset.portfolioIntroPhase === "exit") return;
      root.dataset.portfolioIntroPhase = "exit";
      setExiting(true);
      fadeAudio(0, skip ? 380 : EXIT_DURATION - 50, true);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = window.setTimeout(finish, EXIT_DURATION);
    };

    exitTimerRef.current = window.setTimeout(() => beginExit(), INTRO_DURATION);
    finishTimerRef.current = window.setTimeout(finish, INTRO_DURATION + EXIT_DURATION);

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      finish();
    };
    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      disposed = true;
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      motionPreference.removeEventListener("change", handleMotionPreference);
      startPlaybackRef.current = () => {};
      if (audioFrameRef.current !== null) window.cancelAnimationFrame(audioFrameRef.current);
      audio.pause();
      try { audio.currentTime = 0; } catch { /* Ignore incomplete media metadata during teardown. */ }
      audio.removeAttribute("src");
      audio.load();
      fadeAudioRef.current = null;
    };
  }, []);

  if (!visible) return null;

  const toggleSound = () => {
    const nextPreference = !soundEnabled;
    soundPreferenceRef.current = nextPreference;
    try {
      window.sessionStorage.setItem(SOUND_PREFERENCE_KEY, nextPreference ? "on" : "off");
    } catch {
      // The current visit still follows the selected preference.
    }

    setSoundBlocked(false);
    if (nextPreference) {
      startPlaybackRef.current(true);
    } else {
      setSoundEnabled(false);
      fadeAudioRef.current?.(0, 400, true);
    }
  };

  const controls = (
    <>
      <button
        aria-label="Skip introduction"
        className={`intro-skip${exiting ? " is-hidden" : ""}`}
        onClick={() => {
          if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
          if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
          document.documentElement.dataset.portfolioIntroPhase = "exit";
          setExiting(true);
          fadeAudioRef.current?.(0, 380, true);
          finishTimerRef.current = window.setTimeout(() => {
            delete document.documentElement.dataset.portfolioIntroActive;
            delete document.documentElement.dataset.portfolioIntroPhase;
            document.documentElement.dataset.portfolioIntroSeen = "true";
            setVisible(false);
          }, EXIT_DURATION);
        }}
        type="button"
      >
        Skip intro <span aria-hidden="true">?</span>
      </button>
      {soundReady && (
        <button
          aria-label={soundBlocked ? "Enable intro music" : soundEnabled ? "Turn intro music off" : "Turn intro music on"}
          aria-pressed={soundEnabled}
          className={`intro-sound${exiting ? " is-hidden" : ""}`}
          onClick={toggleSound}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <path d="M9 4 5.5 7H3v6h2.5L9 16V4Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            {soundEnabled ? (
              <>
                <path d="M12 7a4 4 0 0 1 0 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M14 5a7 7 0 0 1 0 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </>
            ) : <path d="m12 8 4 4m0-4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
          </svg>
          {soundBlocked ? "Enable sound" : soundEnabled ? "Sound on" : "Sound off"}
        </button>
      )}
    </>
  );

  return (
    <>
      <div aria-label="Global network infrastructure introduction" className={`portfolio-intro${exiting ? " is-exiting" : ""}`} role="region">
        <div aria-hidden="true" className="intro-backdrop" />
      </div>
      {portalReady ? createPortal(controls, document.body) : null}
    </>
  );
}
