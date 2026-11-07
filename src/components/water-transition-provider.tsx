"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type WaterTransition = {
  title: string;
  sequence: number;
  reducedMotion: boolean;
};

const TRANSITION_DURATION = 1500;

export function WaterTransitionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [transition, setTransition] = useState<WaterTransition | null>(null);
  const sequenceRef = useRef(0);
  const triggeredRef = useRef(new Set<string>());

  useEffect(() => {
    let active = false;
    let disposed = false;
    let finishTimer = 0;
    const queue: HTMLElement[] = [];
    const observedSections = Array.from(document.querySelectorAll<HTMLElement>("[data-scroll-transition]"));
    const previousBySection = new Map<HTMLElement, HTMLElement | null>(
      observedSections.map((section, index) => [section, observedSections[index - 1] ?? null]),
    );
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastScrollY = window.scrollY;
    let scrollDirection = 0;

    const showNext = (section: HTMLElement) => {
      if (disposed) return;
      const title = section.dataset.scrollTransition;
      if (!title) return;

      active = true;
      triggeredRef.current.add(title);
      const reducedMotion = prefersReducedMotion.matches;
      const previousSection = previousBySection.get(section);
      previousSection?.classList.add("water-scroll-exit");
      section.classList.add("water-scroll-reveal");
      sequenceRef.current += 1;
      setTransition({ title, sequence: sequenceRef.current, reducedMotion });

      finishTimer = window.setTimeout(() => {
        section.classList.remove("water-scroll-reveal", "water-scroll-reveal-reduced");
        previousSection?.classList.remove("water-scroll-exit");
        setTransition(null);
        active = false;
        const next = queue.shift();
        if (next) showNext(next);
      }, reducedMotion ? 220 : TRANSITION_DURATION);

      if (reducedMotion) section.classList.add("water-scroll-reveal-reduced");
    };

    const observer = new IntersectionObserver((entries) => {
      if (scrollDirection <= 0) return;
      const enteredSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .map((entry) => entry.target as HTMLElement)
        .filter((section) => {
          const title = section.dataset.scrollTransition;
          return Boolean(title && !triggeredRef.current.has(title) && !queue.includes(section));
        });

      enteredSections.forEach((section) => {
        if (active) queue.push(section);
        else showNext(section);
      });
    }, { threshold: 0.08, rootMargin: "-12% 0px -12% 0px" });

    observedSections.forEach((section) => observer.observe(section));

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 1) scrollDirection = 1;
      else if (currentScrollY < lastScrollY - 1) scrollDirection = -1;
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      disposed = true;
      window.clearTimeout(finishTimer);
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      document.querySelectorAll(".water-scroll-reveal, .water-scroll-exit").forEach((section) => {
        section.classList.remove("water-scroll-reveal", "water-scroll-reveal-reduced", "water-scroll-exit");
      });
      setTransition(null);
    };
  }, [pathname]);

  const style = transition
    ? ({ "--water-transition-duration": transition.reducedMotion ? "220ms" : `${TRANSITION_DURATION}ms` } as CSSProperties)
    : undefined;

  return (
    <>
      {children}
      {transition && (
        <div
          aria-atomic="true"
          aria-live="polite"
          className={`water-transition-overlay${transition.reducedMotion ? " is-reduced" : ""}`}
          key={transition.sequence}
          role="status"
          style={style}
        >
          <div aria-hidden="true" className="water-transition-layer">
            <span className="water-transition-glass" />
            <span className="water-transition-ripple water-transition-ripple-one" />
            <span className="water-transition-ripple water-transition-ripple-two" />
            <span className="water-transition-ripple water-transition-ripple-three" />
          </div>
          <div className="water-transition-title">
            <span className="water-transition-kicker">A NEW SECTION</span>
            <span className="water-transition-heading">{transition.title}</span>
            <span className="water-transition-rule" />
          </div>
          <span className="water-transition-announcement">Entering {transition.title.toLowerCase()}</span>
        </div>
      )}
    </>
  );
}
