"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 5700;
const EXIT_DURATION = 950;
const SESSION_KEY = "biron-portfolio-network-intro-seen";
const MUSIC_URL = "/audio/earth-network-ambient.wav";
const MUSIC_VOLUME = 0.22;

type AudioFade = (target: number, duration: number, stopAtEnd?: boolean) => void;

export function LoadingIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const audioFrameRef = useRef<number | null>(null);
  const fadeAudioRef = useRef<AudioFade | null>(null);
  const startPlaybackRef = useRef<(fromInteraction: boolean) => void>(() => {});
  const beginExitRef = useRef<(skip?: boolean) => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let introActive = true;
    let isExiting = false;
    let disposed = false;
    let playbackPending = false;
    let playbackStarted = false;
    let playbackAttempt = 0;
    let waitingForInteraction = false;
    let removeInteractionListeners = () => {};
    setPortalReady(true);

    const finish = () => {
      introActive = false;
      removeInteractionListeners();
      fadeAudioRef.current?.(0, 0, true);
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

    const audio = new Audio(MUSIC_URL);
    audio.preload = "auto";
    audio.loop = false;
    audio.volume = 0.01;

    const fadeAudio: AudioFade = (target, duration, stopAtEnd = false) => {
      if (audioFrameRef.current !== null) {
        window.cancelAnimationFrame(audioFrameRef.current);
        audioFrameRef.current = null;
      }

      const from = audio.volume;
      const startedAt = performance.now();
      const safeDuration = Math.max(0, duration);
      const complete = () => {
        audio.volume = target;
        audioFrameRef.current = null;
        if (stopAtEnd) {
          audio.pause();
          try { audio.currentTime = 0; } catch { /* Metadata may not be available yet. */ }
        }
      };

      if (safeDuration === 0) {
        complete();
        return;
      }

      const step = (now: number) => {
        const progress = Math.min(1, (now - startedAt) / safeDuration);
        const eased = progress * progress * (3 - 2 * progress);
        audio.volume = from + (target - from) * eased;
        if (progress >= 1) complete();
        else audioFrameRef.current = window.requestAnimationFrame(step);
      };
      audioFrameRef.current = window.requestAnimationFrame(step);
    };
    fadeAudioRef.current = fadeAudio;

    removeInteractionListeners = () => {
      if (!waitingForInteraction) return;
      waitingForInteraction = false;
      window.removeEventListener("pointerdown", handleNaturalInteraction, true);
      window.removeEventListener("click", handleNaturalInteraction, true);
      window.removeEventListener("keydown", handleNaturalInteraction, true);
    };

    const waitForNaturalInteraction = () => {
      if (waitingForInteraction || !introActive || isExiting) return;
      waitingForInteraction = true;
      window.addEventListener("pointerdown", handleNaturalInteraction, true);
      window.addEventListener("click", handleNaturalInteraction, true);
      window.addEventListener("keydown", handleNaturalInteraction, true);
    };

    const handleNaturalInteraction = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".intro-skip")) {
        removeInteractionListeners();
        return;
      }
      removeInteractionListeners();
      if (introActive && !isExiting) startPlaybackRef.current(true);
    };

    const beginPlayback = (fromInteraction: boolean) => {
      if (disposed || !introActive || isExiting || playbackStarted || (playbackPending && !fromInteraction)) return;
      playbackPending = true;
      const currentAttempt = ++playbackAttempt;
      // Keep a non-zero volume for the autoplay attempt so browser policies
      // evaluate it as normal audible playback, not muted autoplay.
      audio.volume = 0.01;
      let playRequest: Promise<void>;
      try {
        playRequest = audio.play();
      } catch {
        playbackPending = false;
        if (!fromInteraction) waitForNaturalInteraction();
        return;
      }

      void playRequest.then(() => {
        if (currentAttempt !== playbackAttempt) return;
        playbackPending = false;
        if (disposed || !introActive || isExiting) {
          audio.pause();
          return;
        }
        playbackStarted = true;
        removeInteractionListeners();
        fadeAudio(MUSIC_VOLUME, 2000);
      }).catch(() => {
        if (currentAttempt !== playbackAttempt) return;
        playbackPending = false;
        if (!disposed && introActive && !isExiting && !fromInteraction) {
          waitForNaturalInteraction();
        }
      });
    };
    startPlaybackRef.current = beginPlayback;

    const beginExit = (skip = false) => {
      if (isExiting || !introActive) return;
      isExiting = true;
      removeInteractionListeners();
      root.dataset.portfolioIntroPhase = "exit";
      setExiting(true);
      fadeAudio(0, skip ? 380 : EXIT_DURATION - 50, true);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = window.setTimeout(finish, EXIT_DURATION);
    };
    beginExitRef.current = beginExit;

    // Try audible autoplay as soon as the intro starts. If the browser rejects
    // it, the first real tap, click, or key press retries playback in that gesture.
    // Listen while the autoplay request is pending too, so an early tap can
    // retry synchronously within that gesture if the first request is denied.
    waitForNaturalInteraction();
    beginPlayback(false);
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
      introActive = false;
      removeInteractionListeners();
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      motionPreference.removeEventListener("change", handleMotionPreference);
      if (audioFrameRef.current !== null) window.cancelAnimationFrame(audioFrameRef.current);
      audio.pause();
      try { audio.currentTime = 0; } catch { /* Ignore incomplete media metadata during teardown. */ }
      audio.removeAttribute("src");
      audio.load();
      fadeAudioRef.current = null;
      startPlaybackRef.current = () => {};
      beginExitRef.current = () => {};
    };
  }, []);

  if (!visible) return null;

  const skipIntro = () => {
    if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
    beginExitRef.current(true);
  };

  const skipButton = (
    <button
      aria-label="Skip introduction"
      className={`intro-skip${exiting ? " is-hidden" : ""}`}
      onClick={skipIntro}
      type="button"
    >
      Skip intro <span aria-hidden="true">?</span>
    </button>
  );

  return (
    <>
      <div aria-label="Global network infrastructure introduction" className={`portfolio-intro${exiting ? " is-exiting" : ""}`} role="region">
        <div aria-hidden="true" className="intro-backdrop" />
      </div>
      {portalReady ? createPortal(skipButton, document.body) : null}
    </>
  );
}
