"use client";

import { useEffect, useRef, useState } from "react";

const INTRO_DURATION = 5700;
const EXIT_DURATION = 950;
const SESSION_KEY = "biron-portfolio-intro-seen";

export function LoadingIntro() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const exitTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (root.dataset.portfolioIntroSeen === "true" || motionPreference.matches) {
      setVisible(false);
      return;
    }

    try {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // The intro can still run for this mount when storage is unavailable.
    }

    exitTimerRef.current = window.setTimeout(() => setExiting(true), INTRO_DURATION);
    finishTimerRef.current = window.setTimeout(() => {
      root.dataset.portfolioIntroSeen = "true";
      setVisible(false);
    }, INTRO_DURATION + EXIT_DURATION);

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (!event.matches) return;
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      root.dataset.portfolioIntroSeen = "true";
      setVisible(false);
    };

    motionPreference.addEventListener("change", handleMotionPreference);

    return () => {
      if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
      if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
      motionPreference.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-label="Forklift and shipping container introduction"
      className={`portfolio-intro${exiting ? " is-exiting" : ""}`}
      role="region"
    >
      <div aria-hidden="true" className="intro-backdrop" />
      <div aria-hidden="true" className="intro-scene">
        <div className="intro-scene-glow" />
        <div className="intro-horizon" />
        <div className="intro-floor-grid" />
        <svg className="intro-vehicle" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="intro-container" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#245452" />
              <stop offset=".48" stopColor="#173b3a" />
              <stop offset="1" stopColor="#0d292b" />
            </linearGradient>
            <linearGradient id="intro-container-side" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#34716c" />
              <stop offset="1" stopColor="#153837" />
            </linearGradient>
            <linearGradient id="intro-metal" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#d2e4e2" />
              <stop offset=".35" stopColor="#5c8986" />
              <stop offset="1" stopColor="#244846" />
            </linearGradient>
            <linearGradient id="intro-forklift" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#55c9c0" />
              <stop offset="1" stopColor="#14605c" />
            </linearGradient>
            <filter id="intro-shadow" x="-30%" y="-50%" width="160%" height="220%">
              <feGaussianBlur stdDeviation="14" />
            </filter>
          </defs>

          <ellipse className="intro-ground-shadow" cx="620" cy="477" rx="410" ry="26" filter="url(#intro-shadow)" />

          <g className="intro-forklift">
            <g className="intro-mast">
              <path d="M560 236h17v203h-17z" fill="url(#intro-metal)" />
              <path d="M579 252h9v185h-9z" fill="#2b5a57" />
              <path d="M567 246h25v8h-25zm0 179h25v8h-25z" fill="#9ccac6" />
              <g className="intro-fork-carriage">
                <path d="M568 407h65v12h-65z" fill="#9bd4d0" />
                <path d="M589 415h58v8h-58z" fill="url(#intro-metal)" />
              </g>
            </g>
            <path d="M393 399h174l-20 48H364z" fill="url(#intro-forklift)" stroke="#76ded5" strokeOpacity=".62" strokeWidth="2" />
            <path d="M374 395h188v16H374z" fill="#2c7772" />
            <path d="M412 365h89l22 34H399z" fill="#204b49" stroke="#77c9c3" strokeOpacity=".4" />
            <path d="M426 366h61l14 28h-74z" fill="#102b2d" stroke="#9de9e3" strokeOpacity=".42" strokeWidth="2" />
            <path d="M491 365v31m-69-31 7 31m-30-30v30m102-45v45" stroke="#91e6df" strokeOpacity=".65" strokeWidth="4" />
            <path d="M386 365h122l-18-54h-69z" fill="url(#intro-forklift)" stroke="#92e9e3" strokeOpacity=".6" strokeWidth="2" />
            <path d="M400 351h91l-10-30h-69z" fill="#65b6b0" fillOpacity=".35" />
            <path d="M391 366h126" stroke="#b0f5ef" strokeOpacity=".8" strokeWidth="3" />
            <path d="M543 332h17v57h-17z" fill="#1b3e3d" />
            <path d="M535 329h13v64h-13z" fill="url(#intro-metal)" />
            <path className="intro-fork-tine" d="M568 406h146" stroke="#b6dad7" strokeWidth="6" strokeLinecap="round" />
            <path className="intro-fork-tine" d="M714 406v9h-20" fill="none" stroke="#d3e8e5" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M392 447h167" stroke="#0b1d1e" strokeWidth="7" />
            <g className="intro-wheel intro-wheel-rear">
              <circle cx="397" cy="447" r="36" fill="#071416" stroke="#477370" strokeWidth="5" />
              <circle cx="397" cy="447" r="18" fill="url(#intro-metal)" />
              <circle cx="397" cy="447" r="7" fill="#183a3b" />
            </g>
            <g className="intro-wheel intro-wheel-front">
              <circle cx="535" cy="447" r="31" fill="#071416" stroke="#477370" strokeWidth="5" />
              <circle cx="535" cy="447" r="15" fill="url(#intro-metal)" />
              <circle cx="535" cy="447" r="6" fill="#183a3b" />
            </g>
            <path d="M386 401h-25v20h26m177-64h21v20h-21" fill="none" stroke="#a1ede7" strokeOpacity=".75" strokeWidth="3" />
            <circle cx="379" cy="380" r="4" fill="#91f5e9" />
            <path d="M400 478h140" stroke="#18c6c0" strokeOpacity=".36" strokeWidth="3" />
          </g>
          <g className="intro-cargo">
            <path d="M630 225 688 193h411l-56 32z" fill="#4c8983" />
            <path d="M1043 225h56v194h-56z" fill="url(#intro-container-side)" />
            <path d="M630 225h413v194H630z" fill="url(#intro-container)" stroke="#72d9d0" strokeOpacity=".56" strokeWidth="2" />
            <path d="M639 232v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180m15-180v180" fill="none" stroke="#8cece2" strokeOpacity=".16" strokeWidth="2" />
            <path d="M630 237h413M630 408h413" stroke="#96f4eb" strokeOpacity=".3" />
            <path d="M630 225v194m413-194v194" stroke="#b9eeea" strokeOpacity=".48" strokeWidth="5" />
            <path d="M648 419v10m377-10v10m-377-204v-10m377 10v-10" stroke="#a2e3df" strokeOpacity=".72" strokeWidth="8" />
            <path d="M682 258h140" stroke="#b3f5ef" strokeOpacity=".5" strokeWidth="2" />
            <path d="M682 265h78" stroke="#b3f5ef" strokeOpacity=".24" strokeWidth="2" />
          </g>

        </svg>
        <div className="intro-light-beam" />
      </div>
      <button
        className="intro-skip"
        onClick={() => {
          if (exitTimerRef.current !== null) window.clearTimeout(exitTimerRef.current);
          if (finishTimerRef.current !== null) window.clearTimeout(finishTimerRef.current);
          setExiting(true);
          finishTimerRef.current = window.setTimeout(() => {
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
