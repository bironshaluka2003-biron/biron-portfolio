"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from "react";

const INTRO_DURATION = 5700;
const EXIT_DURATION = 950;
const SESSION_KEY = "biron-portfolio-network-intro-seen";

const NetworkIntroScene = dynamic(
  () => import("@/components/network-intro-scene").then((module) => module.NetworkIntroScene),
  { ssr: false, loading: () => null },
);

class IntroSceneBoundary extends Component<{
  children: ReactNode;
  onError: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error("[portfolio intro] The 3D scene failed; showing the lightweight fallback.", error);
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function NetworkFallback() {
  return (
    <div aria-hidden="true" className="intro-fallback-globe">
      <svg className="intro-fallback-routes" viewBox="0 0 640 640">
        <path d="M180 226 Q280 104 421 211" />
        <path d="M180 226 Q262 334 388 329" />
        <path d="M421 211 Q482 267 388 329" />
        <path d="M388 329 Q330 440 208 404" />
        <path d="M208 404 Q121 326 180 226" />
        <path d="M421 211 Q518 337 438 428" />
        <path d="M388 329 Q426 352 438 428" />
        <circle cx="180" cy="226" r="5" />
        <circle cx="421" cy="211" r="5" />
        <circle cx="388" cy="329" r="5" />
        <circle cx="208" cy="404" r="5" />
        <circle cx="438" cy="428" r="5" />
      </svg>
    </div>
  );
}

export function LoadingIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const onSceneReady = useCallback(() => setWebglReady(true), []);
  const onSceneUnavailable = useCallback(() => setWebglReady(false), []);

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => {
      delete root.dataset.portfolioIntroActive;
      root.dataset.portfolioIntroSeen = "true";
      setVisible(false);
    };

    if (root.dataset.portfolioIntroSeen === "true" || motionPreference.matches) {
      setVisible(false);
      return;
    }

    root.dataset.portfolioIntroActive = "true";
    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The intro still completes on this mount if storage is unavailable.
    }

    exitTimerRef.current = window.setTimeout(() => setExiting(true), INTRO_DURATION);
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
      delete root.dataset.portfolioIntroActive;
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="Global network infrastructure introduction"
      className={`portfolio-intro${exiting ? " is-exiting" : ""}`}
      role="region"
    >
      <div aria-hidden="true" className="intro-backdrop" />
      <div aria-hidden="true" className={`intro-network-world${webglReady ? " is-webgl" : ""}`}>
        <NetworkFallback />
        <IntroSceneBoundary onError={onSceneUnavailable}>
          <NetworkIntroScene onReady={onSceneReady} onUnavailable={onSceneUnavailable} />
        </IntroSceneBoundary>
      </div>
      <button
        className="intro-skip"
        onClick={() => {
          if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
          if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
          setExiting(true);
          finishTimerRef.current = window.setTimeout(() => {
            delete document.documentElement.dataset.portfolioIntroActive;
            document.documentElement.dataset.portfolioIntroSeen = "true";
            setVisible(false);
          }, EXIT_DURATION);
        }}
        type="button"
      >
        Skip intro <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
