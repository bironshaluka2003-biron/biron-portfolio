"use client";

import { useEffect, useRef, useState } from "react";

const interests = [
  "Computer Networking",
  "Network Infrastructure",
  "Network Administration",
  "IT Infrastructure",
  "System Administration",
  "Emerging Technologies",
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      aria-labelledby="about-title"
      className={`about-section${isVisible ? " is-visible" : ""}`}
      id="about"
      ref={sectionRef}
    >
      <div aria-hidden="true" className="about-atmosphere">
        <div className="about-glow about-glow-primary" />
        <div className="about-glow about-glow-secondary" />
      </div>

      <div className="about-inner">
        <aside aria-label="Portrait placeholder" className="about-portrait-column">
          <div className="about-portrait-glow" />
          <div className="about-portrait-frame">
            <div className="about-portrait-topline"><span>PROFILE / BIRON SHALUKA</span><span>01</span></div>
            {/* Replace this placeholder with a next/image portrait when the photo is ready. */}
            <div className="about-portrait-placeholder">
              <div aria-hidden="true" className="about-portrait-grid" />
              <div aria-hidden="true" className="about-portrait-silhouette">
                <span className="about-silhouette-head" />
                <span className="about-silhouette-body" />
              </div>
              <span className="about-portrait-caption">PORTRAIT<br />PLACEHOLDER</span>
              <span aria-hidden="true" className="about-portrait-corner about-portrait-corner-top" />
              <span aria-hidden="true" className="about-portrait-corner about-portrait-corner-bottom" />
            </div>
            <div className="about-portrait-footer"><span>COMPUTER SYSTEMS &amp; NETWORK ENGINEERING</span><span className="about-portrait-bars"><i /><i /><i /><i /></span></div>
          </div>
          <span aria-hidden="true" className="about-portrait-side-label">INFORMATION TECHNOLOGY</span>
        </aside>

        <section aria-labelledby="about-title" className="about-copy">
          <p className="about-eyebrow"><span /> ABOUT ME</p>
          <h1 id="about-title">Curious by nature.<br /><span>Driven by technology.</span></h1>
          <p className="about-introduction">
            I&apos;m an undergraduate Information Technology student at SLIIT (Sri Lanka
            Institute of Information Technology), specializing in Computer Systems
            &amp; Network Engineering. I&apos;m interested in how computer networks and
            infrastructure help keep systems connected and reliable.
          </p>
          <p className="about-introduction about-secondary-copy">
            I&apos;m passionate about learning new technologies, expanding my technical
            knowledge, and developing practical IT skills through continued learning
            and exploration.
          </p>

          <div aria-label="Areas of interest" className="interest-list">
            {interests.map((interest) => (
              <span className="interest-chip" key={interest}>{interest}</span>
            ))}
          </div>

          <aside aria-label="Education" className="education-card">
            <div aria-hidden="true" className="education-card-glow" />
            <div className="education-card-topline"><span>EDUCATION</span><span className="education-index">01</span></div>
            <p className="education-label">UNIVERSITY</p>
            <h2>SLIIT</h2>
            <p className="education-full-name">Sri Lanka Institute of Information Technology</p>
            <div className="education-rule" />
            <div className="education-credentials">
              <div>
                <p className="education-label">DEGREE</p>
                <p className="education-degree">BSc (Hons) in Information Technology</p>
              </div>
              <div>
                <p className="education-label">SPECIALIZATION</p>
                <p className="education-specialization">Computer Systems &amp; Network Engineering</p>
              </div>
            </div>
          </aside>
        </section>
      </div>

      <div aria-hidden="true" className="about-footer-line">
        <span>01 / ABOUT</span><span /><span>COMPUTER SYSTEMS · NETWORK ENGINEERING</span>
      </div>
    </section>
  );
}
