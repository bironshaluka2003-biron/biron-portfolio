'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

const introductionToIotBadgeImage =
  "https://images.credly.com/images/fce226c2-0f13-4e17-b60c-24fa6ffd88cb/Intro2IoT.png";

const credlyUrl =
  "https://www.credly.com/badges/0ac1fac8-b8a2-4010-8ba3-26f7cb3ae429/public_url";

type AchievementVisual = "official-badge" | "certificate" | "iot" | "security" | "automation" | "insights" | "programming";

type Achievement = {
  title: string;
  type: "Digital Badge" | "Course Certificate" | "Module Achievement" | "University Certificate";
  issueDate: string;
  dateTime: string;
  visual: AchievementVisual;
  issuer?: string;
  department?: string;
  faculty?: string;
  verificationCode?: string;
  verified?: boolean;
  verificationUrl?: string;
  verificationLabel?: string;
  pdfUrl?: string;
};

const achievements: Achievement[] = [
  {
    title: "Introduction to IoT",
    type: "Digital Badge",
    issueDate: "July 02, 2026",
    dateTime: "2026-07-02",
    visual: "official-badge",
    verified: true,
    verificationUrl: credlyUrl,
  },
  {
    title: "Introduction to IoT",
    type: "Course Certificate",
    issueDate: "July 02, 2026",
    dateTime: "2026-07-02",
    visual: "certificate",
  },
  {
    title: "IoT Opportunities",
    type: "Module Achievement",
    issueDate: "June 28, 2026",
    dateTime: "2026-06-28",
    visual: "iot",
  },
  {
    title: "Securing Things",
    type: "Module Achievement",
    issueDate: "June 28, 2026",
    dateTime: "2026-06-28",
    visual: "security",
  },
  {
    title: "Automating Things",
    type: "Module Achievement",
    issueDate: "June 28, 2026",
    dateTime: "2026-06-28",
    visual: "automation",
  },
  {
    title: "Data Insights",
    type: "Module Achievement",
    issueDate: "June 27, 2026",
    dateTime: "2026-06-27",
    visual: "insights",
  },
  {
    title: "Programming Things",
    type: "Module Achievement",
    issueDate: "June 27, 2026",
    dateTime: "2026-06-27",
    visual: "programming",
  },
];

const universityCertificates: Achievement[] = [
  {
    title: "Web Design for Beginners",
    type: "University Certificate",
    issueDate: "December 2024",
    dateTime: "2024-12",
    visual: "certificate",
    issuer: "University of Moratuwa",
    department: "Department of Information Technology",
    faculty: "Faculty of Information Technology",
    verificationCode: "LSHBuLZp0P",
    verificationUrl: "https://open.uom.lk/verify",
    verificationLabel: "Verify Certificate",
  },
];

const allAchievements = [...achievements, ...universityCertificates];

function AchievementArtwork({ visual }: { visual: AchievementVisual }) {
  if (visual === "official-badge") {
    return (
      <div
        aria-label="Introduction to IoT official Credly badge artwork"
        className="achievement-artwork achievement-artwork-badge"
        role="img"
        style={{ backgroundImage: `radial-gradient(ellipse at center, #18c6c019, transparent 68%), url("${introductionToIotBadgeImage}")` }}
      />
    );
  }

  return (
    <div aria-hidden="true" className={`achievement-artwork achievement-artwork-${visual}`}>
      <svg fill="none" viewBox="0 0 96 96">
        <circle className="achievement-icon-orbit" cx="48" cy="48" r="34" />
        <circle className="achievement-icon-core" cx="48" cy="48" r="25" />
        {visual === "certificate" && (
          <>
            <path d="M38 34h20M38 41h20M38 48h13" />
            <path d="M35 29h26a4 4 0 0 1 4 4v25a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4V33a4 4 0 0 1 4-4Z" />
            <path d="m43 62-3 11 8-4 8 4-3-11" />
          </>
        )}
        {visual === "iot" && (
          <>
            <circle cx="48" cy="48" r="5" />
            <circle cx="35" cy="37" r="3" /><circle cx="62" cy="36" r="3" /><circle cx="36" cy="60" r="3" /><circle cx="61" cy="59" r="3" />
            <path d="m39 40 6 5m8 0 6-6m-15 12-6 7m16-7 5 6" />
          </>
        )}
        {visual === "security" && (
          <>
            <path d="M48 28 65 34v13c0 12-7 19-17 24-10-5-17-12-17-24V34l17-6Z" />
            <path d="m41 48 5 5 10-11" />
          </>
        )}
        {visual === "automation" && (
          <>
            <path d="M31 40a19 19 0 0 1 33-7l3 4m0 0v-9m0 9h-9M65 56a19 19 0 0 1-33 7l-3-4m0 0v9m0-9h9" />
            <path d="m43 48 4 4 8-9" />
          </>
        )}
        {visual === "insights" && (
          <>
            <path d="M32 63V49m11 14V37m11 26V44m11 19V31" />
            <path d="m32 41 11-9 11 5 11-10" />
            <circle cx="32" cy="41" r="2" /><circle cx="43" cy="32" r="2" /><circle cx="54" cy="37" r="2" /><circle cx="65" cy="27" r="2" />
          </>
        )}
        {visual === "programming" && (
          <>
            <path d="m40 39-9 9 9 9m16-18 9 9-9 9m-3-24-8 30" />
            <path d="M35 29h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4V33a4 4 0 0 1 4-4Z" />
          </>
        )}
      </svg>
      <span className="achievement-artwork-glow" />
    </div>
  );
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  return (
    <article className={`achievement-card${achievement.verified ? " achievement-card-verified" : ""}`}>
      <div className="achievement-card-topline">
        <span className="achievement-index">{String(index + 1).padStart(2, "0")}</span>
        {achievement.verified && <span className="achievement-verified"><span aria-hidden="true" />Verified</span>}
      </div>
      <AchievementArtwork visual={achievement.visual} />
      <div className="achievement-card-copy">
        <span className="achievement-type">{achievement.type}</span>
        <h3>{achievement.title}</h3>
      </div>
      <dl className="achievement-meta">
        <div><dt>Issuer</dt><dd>{achievement.issuer ?? "Cisco Networking Academy"}</dd></div>
        {achievement.department && <div><dt>Department</dt><dd>{achievement.department}</dd></div>}
        {achievement.faculty && <div><dt>Faculty</dt><dd>{achievement.faculty}</dd></div>}
        <div><dt>Issue date</dt><dd><time dateTime={achievement.dateTime}>{achievement.issueDate}</time></dd></div>
        {achievement.verificationCode && <div><dt>Verification code</dt><dd><code>{achievement.verificationCode}</code></dd></div>}
      </dl>
      {achievement.verificationUrl && (
        <a className="achievement-verify-link" href={achievement.verificationUrl} rel="noopener noreferrer" target="_blank">
          {achievement.verificationLabel ?? "Verify Credential"} <span aria-hidden="true">↗</span>
        </a>
      )}
      {achievement.pdfUrl && (
        <a className="achievement-verify-link" href={achievement.pdfUrl} rel="noopener noreferrer" target="_blank">
          View Certificate PDF <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}

export function CertificationsSection() {
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const [activeAchievement, setActiveAchievement] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [resumeAfter, setResumeAfter] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [transitionFrom, setTransitionFrom] = useState<{ index: number; direction: -1 | 1 } | null>(null);

  const showAchievement = (index: number, direction: -1 | 1) => {
    const nextIndex = (index + allAchievements.length) % allAchievements.length;
    if (nextIndex === activeAchievement) return;
    setTransitionFrom({ index: activeAchievement, direction });
    setActiveAchievement(nextIndex);
    setDragOffset(0);
    setResumeAfter(0);
  };

  const scheduleResume = () => setResumeAfter(Date.now() + 2000);

  const handleCarouselPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") setIsHovered(true);
  };

  const handleCarouselPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") {
      setIsHovered(false);
      scheduleResume();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    if ((event.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    hasDraggedRef.current = false;
    setIsPointerActive(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const offsetX = event.clientX - start.x;
    const offsetY = event.clientY - start.y;
    if (!hasDraggedRef.current && Math.abs(offsetX) > 8 && Math.abs(offsetX) > Math.abs(offsetY)) {
      hasDraggedRef.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (hasDraggedRef.current) {
      event.preventDefault();
      setDragOffset(offsetX);
    }
  };

  const finishPointerGesture = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const offsetX = event.clientX - start.x;
    if (hasDraggedRef.current && Math.abs(offsetX) > 55) {
      const direction = offsetX < 0 ? 1 : -1;
      showAchievement(activeAchievement + direction, direction);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    pointerStartRef.current = null;
    hasDraggedRef.current = false;
    setIsDragging(false);
    setIsPointerActive(false);
    setDragOffset(0);
    scheduleResume();
  };

  const handleCarouselKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showAchievement(activeAchievement + 1, 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showAchievement(activeAchievement - 1, -1);
    }
  };

  const handleCarouselFocus = () => setIsFocusedWithin(true);
  const handleCarouselBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocusedWithin(false);
      scheduleResume();
    }
  };

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);
    const updateDocumentVisibility = () => setIsDocumentVisible(document.visibilityState === "visible");
    updateMotionPreference();
    updateDocumentVisibility();
    motionPreference.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    return () => {
      motionPreference.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    const activeSlide = slideRefs.current[activeAchievement];
    if (!activeSlide) return;
    const measureActiveSlide = () => setViewportHeight(activeSlide.scrollHeight);
    measureActiveSlide();
    const resizeObserver = new ResizeObserver(measureActiveSlide);
    resizeObserver.observe(activeSlide);
    return () => resizeObserver.disconnect();
  }, [activeAchievement]);

  useEffect(() => {
    if (!transitionFrom) return;
    const timeout = window.setTimeout(() => setTransitionFrom(null), prefersReducedMotion ? 0 : 580);
    return () => window.clearTimeout(timeout);
  }, [transitionFrom, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || isHovered || isFocusedWithin || isPointerActive || isDragging || !isDocumentVisible) return;
    const remainingPause = resumeAfter - Date.now();
    if (remainingPause > 0) {
      const resumeTimeout = window.setTimeout(() => setResumeAfter(0), remainingPause);
      return () => window.clearTimeout(resumeTimeout);
    }
    const autoplayTimeout = window.setTimeout(() => {
      setTransitionFrom({ index: activeAchievement, direction: 1 });
      setActiveAchievement((current) => (current + 1) % allAchievements.length);
      setDragOffset(0);
      setResumeAfter(0);
    }, 5000);
    return () => window.clearTimeout(autoplayTimeout);
  }, [activeAchievement, isDragging, isDocumentVisible, isFocusedWithin, isHovered, isPointerActive, prefersReducedMotion, resumeAfter]);

  const activeProvider = allAchievements[activeAchievement].issuer ?? "Cisco Networking Academy";
  const activeProviderIsCisco = !allAchievements[activeAchievement].issuer;

  return (
    <section aria-labelledby="certifications-title" className="certifications-page" data-scroll-transition="CERTIFICATIONS" id="certifications">
      <div aria-hidden="true" className="certifications-atmosphere">
        <span className="certifications-glow certifications-glow-one" />
        <span className="certifications-glow certifications-glow-two" />
        <span className="certifications-grid" />
      </div>
      <div className="certifications-shell">
        <header className="certifications-heading">
          <p className="certifications-eyebrow"><span /> LEARNING &amp; DEVELOPMENT</p>
          <h1 id="certifications-title">Certifications <span>&amp; Achievements</span></h1>
          <p className="certifications-subtitle">
            Professional certifications, digital badges, and learning achievements from Cisco Networking Academy and the University of Moratuwa.
          </p>
        </header>

        <section aria-label="Certification and achievement carousel" className="certifications-provider">
          <div className="certifications-section-heading">
            <div>
              <p className="certifications-section-label">CREDENTIALS / {activeProviderIsCisco ? "01" : "02"}</p>
              <h2 id="certification-provider-heading">{activeProvider}</h2>
            </div>
            <span className="certifications-total">{activeProviderIsCisco ? "07 LEARNING ACHIEVEMENTS" : "01 CERTIFICATE"}</span>
          </div>
          <div
            className="projects-shell project-carousel-area certification-carousel-area"
            onBlurCapture={handleCarouselBlur}
            onFocusCapture={handleCarouselFocus}
            onPointerEnter={handleCarouselPointerEnter}
            onPointerLeave={handleCarouselPointerLeave}
          >
            <div className="project-carousel-controls">
              <span className="project-carousel-hint">EXPLORE CREDENTIALS</span>
              <div className="project-carousel-arrows">
                <button aria-label="Previous certification" className="project-carousel-arrow" onClick={() => showAchievement(activeAchievement - 1, -1)} type="button">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <button aria-label="Next certification" className="project-carousel-arrow" onClick={() => showAchievement(activeAchievement + 1, 1)} type="button">
                  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
            </div>

            <div
              aria-label="Certification carousel. Use left and right arrow keys to change credentials."
              className={`project-carousel-viewport${isDragging ? " is-dragging" : ""}`}
              onKeyDown={handleCarouselKeyDown}
              onPointerCancel={finishPointerGesture}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishPointerGesture}
              role="region"
              style={viewportHeight === null ? undefined : { height: `${viewportHeight}px` }}
              tabIndex={0}
            >
              <div className={`project-carousel-track${isDragging ? " is-dragging" : ""}`}>
                {allAchievements.map((achievement, index) => {
                  const isActive = activeAchievement === index;
                  const isExiting = transitionFrom?.index === index;
                  const entryDirection = transitionFrom?.direction === 1 ? "right" : "left";
                  const exitDirection = transitionFrom?.direction === 1 ? "left" : "right";
                  const slideClass = `project-carousel-slide${isActive ? " is-active" : isExiting ? ` is-exiting-${exitDirection}` : " is-inactive"}${isActive && transitionFrom ? ` is-entering-from-${entryDirection}` : ""}`;
                  return (
                    <div
                      aria-hidden={!isActive}
                      aria-label={`${index + 1} of ${allAchievements.length}: ${achievement.title}`}
                      aria-roledescription="slide"
                      className={slideClass}
                      inert={!isActive}
                      key={`${achievement.type}-${achievement.title}`}
                      ref={(element) => { slideRefs.current[index] = element; }}
                      role="group"
                      style={isDragging ? {
                        transform: `translate3d(calc(${isActive ? 0 : dragOffset < 0 ? 100 : -100}% + ${dragOffset}px),0,0)`,
                        opacity: isActive ? Math.max(0.5, 1 - Math.abs(dragOffset) / 600) : Math.min(1, Math.abs(dragOffset) / 90),
                      } : undefined}
                    >
                      <AchievementCard achievement={achievement} index={index} />
                    </div>
                  );
                })}
              </div>
            </div>

            <div aria-label="Choose a certification" className="project-carousel-pagination">
              <span aria-live="polite" className="project-carousel-counter">{String(activeAchievement + 1).padStart(2, "0")} <i>/</i> {String(allAchievements.length).padStart(2, "0")}</span>
              <div className="project-carousel-dots">
                {allAchievements.map((achievement, index) => (
                  <button
                    aria-current={activeAchievement === index ? "true" : undefined}
                    aria-label={`Show ${achievement.title} (${index + 1} of ${allAchievements.length})`}
                    className={`project-carousel-dot${activeAchievement === index ? " is-active" : ""}`}
                    key={`${achievement.type}-${achievement.title}-dot`}
                    onClick={() => showAchievement(index, index > activeAchievement ? 1 : -1)}
                    type="button"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
