"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, PointerEvent } from "react";

const technologies = [
  "Cisco Packet Tracer",
  "Cisco IOS",
  "IPv4",
  "IPv6",
  "VLSM Subnetting",
  "Dual-Stack Networking",
  "Dynamic NAT",
  "PAT (NAT Overload)",
];

const contributions = [
  {
    title: "IPv4 VLSM Addressing",
    details: [
      "Performed IPv4 VLSM subnetting.",
      <>Designed the IPv4 addressing plan using <code>192.168.10.0/24</code>.</>,
    ],
  },
  {
    title: "IPv6 Addressing & Dual-Stack",
    details: [
      <>Designed the IPv6 addressing scheme using <code>2001:DB8:ACAD::/48</code>.</>,
      "Configured IPv4 and IPv6 Dual-Stack networking.",
    ],
  },
  {
    title: "Dynamic NAT with PAT",
    details: [
      "Configured Dynamic NAT with PAT (NAT Overload).",
      <>Used public IP address <code>203.0.113.5</code>.</>,
      "Verified NAT translations using Cisco IOS commands.",
    ],
  },
];

const remoteOpsTechnologies = [
  "C Programming",
  "Linux / POSIX",
  "TCP/IP",
  "UDP",
  "Socket Programming",
  "POSIX Threads (pthreads)",
  "Client-Server Architecture",
  "GCC Compiler",
  "Makefile",
];

const awsWebsiteTechnologies = [
  "AWS S3",
  "Terraform",
  "GitHub Actions",
  "CI/CD",
  "Git",
  "GitHub",
];

const remoteOpsContributions = [
  {
    title: "TCP Client-Server Architecture",
    details: [
      "Designed a TCP client-server architecture with the Agent as server and Controller as client.",
      <>Configured personalized TCP listening port <code>9410</code>.</>,
      "Implemented socket creation, binding, listening, accepting, and connection handling.",
    ],
  },
  {
    title: "Authentication & Security",
    details: [
      "Implemented token-based client authentication.",
      "Added command validation and whitelisting; restricted EXEC to permitted operations.",
      "Added error responses for invalid authentication and unauthorized commands.",
    ],
  },
  {
    title: "Multithreading & Connections",
    details: [
      "Used POSIX threads to handle concurrent client connections, with a separate detached thread per accepted client.",
      "Designed the Agent to support up to five simultaneous Controller connections.",
    ],
  },
  {
    title: "UDP System Monitoring",
    details: [
      "Implemented UDP communication and a dedicated monitoring thread.",
      "Added MONITOR START and MONITOR STOP commands with three-second reporting intervals.",
      "System information values shown in demonstrations were simulated.",
    ],
  },
  {
    title: "Command Processing",
    details: [
      "Implemented command handling for SYSINFO, LISTPROC, EXEC, PUT, GET, MONITOR START, MONITOR STOP, and QUIT.",
      "EXEC uses an allowlist: DATE, UPTIME, DISKFREE, HOSTNAME, and WHOAMI.",
    ],
  },
  {
    title: "Logging & Error Handling",
    details: [
      "Implemented file-based logging for client connections, authentication events, and received system commands.",
      "Added responses for invalid authentication, unauthorized commands, and unknown commands.",
    ],
  },
  {
    title: "Personalized Configuration",
    details: [
      <>TCP Agent port: <code>9410</code>; Session ID: <code>SID:5082</code>.</>,
      <>Authentication token: <code>OPS-2805</code>.</>,
      <>Log file: <code>remoteops_IT24102805.log</code>.</>,
    ],
  },
];

function NetworkTopologyIllustration() {
  return (
    <div className="project-visual" aria-label="Abstract enterprise network illustration">
      <svg viewBox="0 0 520 340" role="img" aria-labelledby="network-visual-title">
        <title id="network-visual-title">Enterprise network design illustration</title>
        <defs>
          <radialGradient id="network-visual-glow">
            <stop offset="0" stopColor="#18C6C0" stopOpacity=".2" />
            <stop offset="1" stopColor="#18C6C0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="network-line" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#20D8CE" stopOpacity=".15" />
            <stop offset=".5" stopColor="#18C6C0" stopOpacity=".78" />
            <stop offset="1" stopColor="#91F5E9" stopOpacity=".2" />
          </linearGradient>
          <pattern id="network-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#91F5E9" opacity=".18" />
          </pattern>
        </defs>
        <rect width="520" height="340" rx="18" fill="url(#network-grid)" />
        <circle cx="264" cy="169" r="150" fill="url(#network-visual-glow)" />
        <g fill="none" stroke="url(#network-line)" strokeWidth="1.5">
          <path d="M260 170 108 93 68 55M260 170 82 227 48 278M260 170 166 286 125 312" />
          <path d="M260 170 415 82 465 54M260 170 435 210 480 268M260 170 350 292 405 318" />
          <path d="M108 93 166 286M415 82 350 292M82 227 435 210" strokeDasharray="3 8" opacity=".55" />
          <circle cx="260" cy="170" r="63" opacity=".32" />
          <circle cx="260" cy="170" r="96" opacity=".18" strokeDasharray="2 9" />
        </g>
        <g fill="#102B2D" stroke="#20D8CE" strokeWidth="1.5">
          <rect x="224" y="134" width="72" height="72" rx="18" />
          <circle cx="108" cy="93" r="18" /><circle cx="82" cy="227" r="15" />
          <circle cx="166" cy="286" r="13" /><circle cx="415" cy="82" r="18" />
          <circle cx="435" cy="210" r="15" /><circle cx="350" cy="292" r="13" />
          <circle cx="68" cy="55" r="8" /><circle cx="48" cy="278" r="8" />
          <circle cx="125" cy="312" r="8" /><circle cx="465" cy="54" r="8" />
          <circle cx="480" cy="268" r="8" /><circle cx="405" cy="318" r="8" />
        </g>
        <g fill="#91F5E9">
          <circle cx="260" cy="170" r="4" /><circle cx="108" cy="93" r="3" />
          <circle cx="82" cy="227" r="3" /><circle cx="415" cy="82" r="3" />
          <circle cx="435" cy="210" r="3" />
        </g>
        <g fill="none" stroke="#91F5E9" strokeWidth="1.5" strokeLinecap="round" opacity=".8">
          <path d="M250 160h20m-20 10h20m-20 10h20" />
          <path d="M98 93h20m-10-10v20M405 82h20m-10-10v20M72 227h20m-10-8v16M425 210h20m-10-8v16" />
        </g>
      </svg>
    </div>
  );
}

function RemoteOpsIllustration() {
  return (
    <div className="project-visual" aria-label="Illustrative TCP client-server architecture">
      <svg viewBox="0 0 520 340" role="img" aria-labelledby="remoteops-visual-title">
        <title id="remoteops-visual-title">RemoteOps client-server architecture illustration</title>
        <defs>
          <radialGradient id="remoteops-glow">
            <stop offset="0" stopColor="#18C6C0" stopOpacity=".2" />
            <stop offset="1" stopColor="#18C6C0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="remoteops-link" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#20D8CE" stopOpacity=".2" />
            <stop offset=".5" stopColor="#18C6C0" stopOpacity=".8" />
            <stop offset="1" stopColor="#91F5E9" stopOpacity=".22" />
          </linearGradient>
          <pattern id="remoteops-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#91F5E9" opacity=".18" />
          </pattern>
        </defs>
        <rect width="520" height="340" rx="18" fill="url(#remoteops-grid)" />
        <circle cx="260" cy="170" r="164" fill="url(#remoteops-glow)" />
        <g fill="none" stroke="url(#remoteops-link)" strokeWidth="1.6">
          <path d="M150 170h220" />
          <path d="M150 170 91 86M150 170 91 254M370 170 429 86M370 170 429 254" opacity=".7" />
          <path d="M150 170h220" strokeDasharray="4 8" opacity=".65" />
        </g>
        <g fill="#102B2D" stroke="#20D8CE" strokeWidth="1.5">
          <rect x="105" y="119" width="90" height="102" rx="13" />
          <rect x="325" y="119" width="90" height="102" rx="13" />
          <circle cx="91" cy="86" r="12" /><circle cx="91" cy="254" r="12" />
          <circle cx="429" cy="86" r="12" /><circle cx="429" cy="254" r="12" />
          <circle cx="150" cy="170" r="5" fill="#91F5E9" />
          <circle cx="370" cy="170" r="5" fill="#91F5E9" />
        </g>
        <g fill="none" stroke="#91F5E9" strokeWidth="1.5" strokeLinecap="round" opacity=".84">
          <path d="M130 148h40m-40 12h40m-40 12h25m-25 12h34" />
          <path d="M350 148h40m-40 12h40m-40 12h25m-25 12h34" />
          <path d="M254 161h13l-5-5m5 5-5 5M267 179h-13l5-5m-5 5 5 5" />
        </g>
        <g fill="#A3B8B5" opacity=".78">
          <circle cx="261" cy="170" r="3" /><circle cx="274" cy="170" r="3" />
          <circle cx="91" cy="86" r="3" /><circle cx="91" cy="254" r="3" />
          <circle cx="429" cy="86" r="3" /><circle cx="429" cy="254" r="3" />
        </g>
      </svg>
    </div>
  );
}

function AwsWebsiteIllustration() {
  return (
    <div className="project-visual" aria-label="Illustration of a Terraform and GitHub Actions pipeline deploying a static site to Amazon S3">
      <svg viewBox="0 0 520 340" role="img" aria-labelledby="aws-website-visual-title">
        <title id="aws-website-visual-title">GitHub Actions and Terraform deployment to Amazon S3</title>
        <defs>
          <radialGradient id="aws-pipeline-glow">
            <stop offset="0" stopColor="#18C6C0" stopOpacity=".2" />
            <stop offset="1" stopColor="#18C6C0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="aws-pipeline-line" x1="0" y1="0" x2="1" y2="0">
            <stop stopColor="#20D8CE" stopOpacity=".16" />
            <stop offset=".5" stopColor="#18C6C0" stopOpacity=".8" />
            <stop offset="1" stopColor="#91F5E9" stopOpacity=".25" />
          </linearGradient>
          <pattern id="aws-pipeline-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#91F5E9" opacity=".18" />
          </pattern>
        </defs>
        <rect width="520" height="340" rx="18" fill="url(#aws-pipeline-grid)" />
        <circle cx="260" cy="170" r="164" fill="url(#aws-pipeline-glow)" />
        <g fill="none" stroke="url(#aws-pipeline-line)" strokeWidth="1.7">
          <path d="M130 170h260" />
          <path d="M130 170 92 91M390 170l38-79" opacity=".7" />
          <path d="M130 170h260" strokeDasharray="4 8" opacity=".7" />
        </g>
        <g fill="#102B2D" stroke="#20D8CE" strokeWidth="1.5">
          <rect x="66" y="127" width="128" height="86" rx="13" />
          <rect x="218" y="127" width="128" height="86" rx="13" />
          <rect x="370" y="127" width="104" height="86" rx="13" />
          <circle cx="92" cy="91" r="11" /><circle cx="428" cy="91" r="11" />
        </g>
        <g fill="none" stroke="#91F5E9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M112 154h35m-35 12h35m-35 12h24" />
          <path d="m263 161 10-10 10 10v16h-20v-16Zm5 16v-9h10v9" />
          <path d="M403 155h38v30h-38zM403 163h38m-28-8v8m18-8v8" />
          <path d="M244 221h22m10 0h22m10 0h22" opacity=".65" />
          <path d="m92 87 5 4-5 4m-4-8-5 4 5 4M428 87l5 4-5 4m-4-8-5 4 5 4" />
        </g>
        <g fill="#A3B8B5" fontFamily="sans-serif" fontSize="9" letterSpacing="1.1" textAnchor="middle">
          <text x="130" y="239">GIT PUSH</text>
          <text x="282" y="239">TERRAFORM + CI/CD</text>
          <text x="422" y="239">AMAZON S3</text>
        </g>
        <g fill="#91F5E9">
          <circle cx="130" cy="170" r="3" /><circle cx="282" cy="170" r="3" /><circle cx="422" cy="170" r="3" />
        </g>
      </svg>
    </div>
  );
}

function GithubIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.31-3.76-1.31-.5-1.28-1.23-1.62-1.23-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.29-.5-1.43.11-2.98 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.15 3.05-1.15.61 1.55.23 2.69.12 2.98.72.78 1.14 1.78 1.14 3 0 4.29-2.61 5.24-5.1 5.52.4.35.75 1.03.75 2.08v3.06c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" /></svg>;
}

function LinkedinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.34H4.96V9.02h2.97v9.32ZM6.45 7.75a1.72 1.72 0 1 1 0-3.44 1.72 1.72 0 0 1 0 3.44Zm12.6 10.59h-2.97v-4.53c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.61H9.88V9.02h2.85v1.27h.04c.4-.73 1.37-1.5 2.82-1.5 3.02 0 3.58 1.98 3.58 4.56v4.99Z" /></svg>;
}

export function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pointerStartRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const hasDraggedRef = useRef(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
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

  const showProject = (index: number, direction: -1 | 1) => {
    const nextIndex = (index + 3) % 3;
    if (nextIndex === activeProject) return;
    setTransitionFrom({ index: activeProject, direction });
    setActiveProject(nextIndex);
    setDragOffset(0);
    setResumeAfter(0);
  };

  const scheduleResume = () => {
    setResumeAfter(Date.now() + 2000);
  };

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
    const shouldChangeProject = hasDraggedRef.current && Math.abs(offsetX) > 55;
    if (shouldChangeProject) {
      const direction = offsetX < 0 ? 1 : -1;
      showProject(activeProject + direction, direction);
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
      showProject(activeProject + 1, 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showProject(activeProject - 1, -1);
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
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.08 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

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
    const activeSlide = slideRefs.current[activeProject];
    if (!activeSlide) return;

    const measureActiveSlide = () => {
      setViewportHeight(activeSlide.scrollHeight);
    };
    measureActiveSlide();

    const resizeObserver = new ResizeObserver(measureActiveSlide);
    resizeObserver.observe(activeSlide);
    return () => resizeObserver.disconnect();
  }, [activeProject]);

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
      setTransitionFrom({ index: activeProject, direction: 1 });
      setActiveProject((currentProject) => (currentProject + 1) % 3);
      setDragOffset(0);
      setResumeAfter(0);
    }, 5000);
    return () => window.clearTimeout(autoplayTimeout);
  }, [activeProject, isDragging, isDocumentVisible, isFocusedWithin, isHovered, isPointerActive, prefersReducedMotion, resumeAfter]);

  return (
    <section
      aria-label="Projects"
      className={`projects-section${isVisible ? " is-visible" : ""}`}
      data-scroll-transition="PROJECTS"
      id="projects"
      ref={sectionRef}
    >
      <div
        className="projects-shell project-carousel-area"
        onBlurCapture={handleCarouselBlur}
        onFocusCapture={handleCarouselFocus}
        onPointerEnter={handleCarouselPointerEnter}
        onPointerLeave={handleCarouselPointerLeave}
      >
        <div className="project-carousel-controls">
          <span className="project-carousel-hint">EXPLORE PROJECTS</span>
          <div className="project-carousel-arrows">
            <button aria-label="Previous project" className="project-carousel-arrow" onClick={() => showProject(activeProject - 1, -1)} type="button">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button aria-label="Next project" className="project-carousel-arrow" onClick={() => showProject(activeProject + 1, 1)} type="button">
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        <div
          aria-label="Project carousel. Use left and right arrow keys to change projects."
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
          <div
            aria-hidden={activeProject !== 0}
            aria-label="1 of 2: TechNova"
            aria-roledescription="slide"
            className={`project-carousel-slide${activeProject === 0 ? " is-active" : transitionFrom?.index === 0 ? ` is-exiting-${transitionFrom.direction === 1 ? "left" : "right"}` : " is-inactive"}${activeProject === 0 && transitionFrom ? ` is-entering-from-${transitionFrom.direction === 1 ? "right" : "left"}` : ""}`}
            inert={activeProject !== 0}
            ref={(element) => { slideRefs.current[0] = element; }}
            role="group"
            style={isDragging ? {
              transform: `translate3d(calc(${activeProject === 0 ? 0 : dragOffset < 0 ? 100 : -100}% + ${dragOffset}px),0,0)`,
              opacity: activeProject === 0 ? Math.max(0.5, 1 - Math.abs(dragOffset) / 600) : Math.min(1, Math.abs(dragOffset) / 90),
            } : undefined}
          >
          <article aria-labelledby="technova-title" className="project-card">
          <div className="project-overview">
            <div className="project-copy">
              <div className="project-meta">
                <span className="project-type">Group University Project</span>
                <span className="project-status"><i /> Completed</span>
              </div>
              <h3 id="technova-title">TechNova <span>– Enterprise Network Design &amp; Implementation</span></h3>
              <p className="project-description">
                Designed and implemented IP addressing and Network Address Translation (NAT) configurations for an enterprise network using Cisco Packet Tracer. This group project involved planning IPv4 and IPv6 addressing schemes, implementing Dual-Stack networking, and configuring Dynamic NAT with PAT.
              </p>
              <div className="project-role">
                <p className="project-label">MY ROLE</p>
                <p>Member 2 – Shaluka K.K.B.</p>
              </div>
            </div>
            <NetworkTopologyIllustration />
          </div>

          <div className="project-divider" />

          <section aria-labelledby="contributions-title" className="project-contributions">
            <div className="project-section-heading">
              <p className="project-label">INDIVIDUAL CONTRIBUTIONS</p>
              <h4 id="contributions-title">My assigned areas</h4>
            </div>
            <div className="contribution-grid">
              {contributions.map((contribution, index) => (
                <section className="contribution-card" key={contribution.title}>
                  <span className="contribution-index">0{index + 1}</span>
                  <h5>{contribution.title}</h5>
                  <ul>
                    {contribution.details.map((detail, detailIndex) => <li key={detailIndex}>{detail}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <div className="project-divider" />

          <div className="project-bottom">
            <div className="project-technologies">
              <p className="project-label">TECHNOLOGIES &amp; TOOLS</p>
              <ul className="technology-list">
                {technologies.map((technology) => <li key={technology}>{technology}</li>)}
              </ul>
            </div>
            <div className="project-links" aria-label="Project links">
              <a href="https://github.com/bironshaluka2003-biron/TechNova-Enterprise-Network.git" target="_blank" rel="noopener noreferrer" aria-label="View GitHub Repository (opens in a new tab)">
                <GithubIcon /> <span>View GitHub Repository</span>
              </a>
              <a href="https://lnkd.in/p/gu88PYWZ" target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn Post (opens in a new tab)">
                <LinkedinIcon /> <span>View LinkedIn Post</span>
              </a>
            </div>
          </div>
          </article>
          </div>

          <div
            aria-hidden={activeProject !== 1}
            aria-label="2 of 2: RemoteOps"
            aria-roledescription="slide"
            className={`project-carousel-slide${activeProject === 1 ? " is-active" : transitionFrom?.index === 1 ? ` is-exiting-${transitionFrom.direction === 1 ? "left" : "right"}` : " is-inactive"}${activeProject === 1 && transitionFrom ? ` is-entering-from-${transitionFrom.direction === 1 ? "right" : "left"}` : ""}`}
            inert={activeProject !== 1}
            ref={(element) => { slideRefs.current[1] = element; }}
            role="group"
            style={isDragging ? {
              transform: `translate3d(calc(${activeProject === 1 ? 0 : dragOffset < 0 ? 100 : -100}% + ${dragOffset}px),0,0)`,
              opacity: activeProject === 1 ? Math.max(0.5, 1 - Math.abs(dragOffset) / 600) : Math.min(1, Math.abs(dragOffset) / 90),
            } : undefined}
          >
          <article aria-labelledby="remoteops-title" className="project-card">
          <div className="project-overview">
            <div className="project-copy">
              <div className="project-meta">
                <span className="project-type">Individual University Project</span>
                <span className="project-status"><i /> Completed</span>
              </div>
              <h3 id="remoteops-title">RemoteOps <span>– A Remote System Monitoring and Management Tool over TCP/IP</span></h3>
              <p className="project-module">IE3090 – Network Programming</p>
              <p className="project-description">
                Developed a C-based remote system monitoring and management tool using TCP/IP socket programming. The client-server system lets a Controller authenticate with a remote Agent, issue permitted commands, retrieve system information, and start UDP-based monitoring. The Agent uses POSIX multithreading for concurrent client connections and a separate UDP monitoring thread.
              </p>
              <div className="project-role">
                <p className="project-label">MY ROLE</p>
                <p>Individual project — responsible for the complete project implementation.</p>
              </div>
            </div>
            <RemoteOpsIllustration />
          </div>

          <div className="project-divider" />

          <section aria-labelledby="remoteops-contributions-title" className="project-contributions">
            <div className="project-section-heading">
              <p className="project-label">IMPLEMENTATION &amp; CONTRIBUTIONS</p>
              <h4 id="remoteops-contributions-title">Project implementation</h4>
            </div>
            <div className="contribution-grid">
              {remoteOpsContributions.map((contribution, index) => (
                <section className="contribution-card" key={contribution.title}>
                  <span className="contribution-index">0{index + 1}</span>
                  <h5>{contribution.title}</h5>
                  <ul>
                    {contribution.details.map((detail, detailIndex) => <li key={detailIndex}>{detail}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </section>

          <div className="project-divider" />

          <div className="project-bottom">
            <div className="project-technologies">
              <p className="project-label">TECHNOLOGIES &amp; TOOLS</p>
              <ul className="technology-list">
                {remoteOpsTechnologies.map((technology) => <li key={technology}>{technology}</li>)}
              </ul>
            </div>
            <div className="project-links" aria-label="RemoteOps project links">
              <a href="https://github.com/bironshaluka2003-biron/Network-Programing.git" target="_blank" rel="noopener noreferrer" aria-label="View GitHub Repository (opens in a new tab)">
                <GithubIcon /> <span>View GitHub Repository</span>
              </a>
              <a href="https://lnkd.in/p/giarfBXp" target="_blank" rel="noopener noreferrer" aria-label="View LinkedIn Post (opens in a new tab)">
                <LinkedinIcon /> <span>View LinkedIn Post</span>
              </a>
            </div>
          </div>
          </article>
          </div>
          <div
            aria-hidden={activeProject !== 2}
            aria-label="3 of 3: AWS Static Website Deployment Using Terraform and GitHub Actions"
            aria-roledescription="slide"
            className={`project-carousel-slide${activeProject === 2 ? " is-active" : transitionFrom?.index === 2 ? ` is-exiting-${transitionFrom.direction === 1 ? "left" : "right"}` : " is-inactive"}${activeProject === 2 && transitionFrom ? ` is-entering-from-${transitionFrom.direction === 1 ? "right" : "left"}` : ""}`}
            inert={activeProject !== 2}
            ref={(element) => { slideRefs.current[2] = element; }}
            role="group"
            style={isDragging ? {
              transform: `translate3d(calc(${activeProject === 2 ? 0 : dragOffset < 0 ? 100 : -100}% + ${dragOffset}px),0,0)`,
              opacity: activeProject === 2 ? Math.max(0.5, 1 - Math.abs(dragOffset) / 600) : Math.min(1, Math.abs(dragOffset) / 90),
            } : undefined}
          >
          <article aria-labelledby="aws-website-title" className="project-card">
            <div className="project-overview">
              <div className="project-copy">
                <div className="project-meta">
                  <span className="project-type">DevOps Project</span>
                  <span className="project-status"><i /> Completed</span>
                </div>
                <h3 id="aws-website-title">AWS Static Website Deployment <span>Using Terraform &amp; GitHub Actions</span></h3>
                <p className="project-description">
                  Designed and deployed a static website on Amazon S3 using Terraform for Infrastructure as Code. Implemented an automated CI/CD pipeline with GitHub Actions to deploy website updates to the S3 bucket whenever changes are pushed to the main branch. Used Git and GitHub for version control.
                </p>
              </div>
              <AwsWebsiteIllustration />
            </div>

            <div className="project-divider" />

            <div className="project-bottom">
              <div className="project-technologies">
                <p className="project-label">TECHNOLOGIES &amp; TOOLS</p>
                <ul className="technology-list">
                  {awsWebsiteTechnologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
              <div className="project-links" aria-label="AWS static website project links">
                <a href="http://shaluka-devops-website-2026.s3-website-ap-southeast-2.amazonaws.com" target="_blank" rel="noopener noreferrer" aria-label="Open Live Demo (opens in a new tab)">
                  <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M14 4h6v6m0-6-9 9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
                  <span>Live Demo</span>
                </a>
                <a href="https://github.com/bironshaluka2003-biron/devops-aws-terraform-project" target="_blank" rel="noopener noreferrer" aria-label="View GitHub Repository (opens in a new tab)">
                  <GithubIcon /> <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          </article>
          </div>
          </div>
        </div>

        <div aria-label="Choose a project" className="project-carousel-pagination">
          <span aria-live="polite" className="project-carousel-counter">{String(activeProject + 1).padStart(2, "0")} <i>/</i> 03</span>
          <div className="project-carousel-dots">
            {[0, 1, 2].map((index) => (
              <button
                aria-current={activeProject === index ? "true" : undefined}
                aria-label={`Show project ${index + 1}`}
                className={`project-carousel-dot${activeProject === index ? " is-active" : ""}`}
                key={index}
                onClick={() => showProject(index, index > activeProject ? 1 : -1)}
                type="button"
              />
            ))}
          </div>
        </div>

        <footer className="projects-footer-line"><span>01 / PROJECTS</span><span /><span>NETWORK DESIGN &amp; IMPLEMENTATION</span></footer>
      </div>
    </section>
  );
}
