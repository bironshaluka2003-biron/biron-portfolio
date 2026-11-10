"use client";

import { useEffect, useRef, useState } from "react";

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="experience-title"
      className="experience-section"
      data-scroll-transition="EXPERIENCE"
      id="experience"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="experience-atmosphere">
        <span className="experience-glow experience-glow-one" />
        <span className="experience-glow experience-glow-two" />
      </div>

      <div className="experience-shell">
        <header className="experience-heading">
          <p className="experience-eyebrow"><span /> PROFESSIONAL EXPERIENCE</p>
          <h2 id="experience-title">Experience</h2>
        </header>

        <div className={`experience-entry${isVisible ? " is-visible" : ""}`}>
          <div aria-hidden="true" className="experience-timeline"><span /></div>
          <article aria-labelledby="experience-role" className="experience-card">
            <div className="experience-card-header">
              <div className="experience-card-identity">
                <p className="experience-current"><span /> Current Position</p>
                <h3 id="experience-role">DevOps Engineer Intern</h3>
                <p className="experience-organization">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path d="M3.5 20.5h17M5 20.5V8.2L12 4l7 4.2v12.3M8.5 10.2h1.8m3.4 0h1.8m-7 3.6h1.8m3.4 0h1.8m-7 3.6h7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
                  </svg>
                  <span>Presidential Secretariat of Sri Lanka</span>
                </p>
              </div>
              <p className="experience-period"><time dateTime="2026-11">November 2026</time> <span aria-hidden="true">–</span> Present</p>
            </div>
            <p className="experience-description">
              Currently working as a DevOps Engineer Intern at the Presidential Secretariat of Sri Lanka, gaining professional experience and practical exposure to DevOps practices and IT infrastructure.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
