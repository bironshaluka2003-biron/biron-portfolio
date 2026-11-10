"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 5700;
const EXIT_DURATION = 950;
const SESSION_KEY = "biron-portfolio-network-intro-seen";

export function LoadingIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPortalReady(true);

    const finish = () => {
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

    const beginExit = () => {
      root.dataset.portfolioIntroPhase = "exit";
      setExiting(true);
    };
    exitTimerRef.current = window.setTimeout(beginExit, INTRO_DURATION);
    finishTimerRef.current = window.setTimeout(finish, INTRO_DURATION + EXIT_DURATION);

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      finish();
    };
    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  if (!visible) return null;

  const skipButton = (
    <button
      className={`intro-skip${exiting ? " is-hidden" : ""}`}
      onClick={() => {
        if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
        if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
        document.documentElement.dataset.portfolioIntroPhase = "exit";
        setExiting(true);
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
