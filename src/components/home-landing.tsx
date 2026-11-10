"use client";

import { useCallback, useState } from "react";
import { CvModal } from "@/components/cv-modal";
import { NetworkVisualization } from "@/components/network-visualization";

type SocialActionProps = {
  href: string;
  label: string;
  kind: "github" | "linkedin" | "download";
  download?: string;
  external?: boolean;
  onClick?: () => void;
};

function ActionIcon({ kind }: { kind: SocialActionProps["kind"] }) {
  if (kind === "github") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.31-3.76-1.31-.5-1.28-1.24-1.62-1.24-1.62-1.01-.7.08-.69.08-.69 1.12.08 1.7 1.15 1.7 1.15 1 1.7 2.61 1.21 3.25.93.1-.73.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.21 1.15-2.99-.12-.28-.5-1.42.11-2.95 0 0 .94-.3 3.05 1.14a10.6 10.6 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.61 1.53.23 2.67.11 2.95.72.78 1.15 1.77 1.15 2.99 0 4.29-2.62 5.23-5.11 5.51.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
      </svg>
    );
  }

  if (kind === "linkedin") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.35H4.97V9.1h2.96v9.25ZM6.45 7.84a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm11.9 10.51h-2.95v-4.5c0-1.07-.02-2.45-1.5-2.45-1.5 0-1.74 1.17-1.74 2.37v4.58H9.2V9.1h2.84v1.26h.04a3.11 3.11 0 0 1 2.8-1.54c3 0 3.56 1.98 3.56 4.55v4.98Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v11m0 0 4-4m-4 4-4-4" />
      <path d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

function SocialAction({ href, label, kind, download, external, onClick }: SocialActionProps) {
  const content = (
    <>
      <span className={`social-action-icon social-action-icon-${kind}`}>
        <ActionIcon kind={kind} />
      </span>
      <span className="social-action-label">{label}</span>
      <span aria-hidden="true" className="social-action-arrow">{external ? "↗" : "↓"}</span>
    </>
  );

  if (onClick) {
    return <button className="social-action" onClick={onClick} type="button">{content}</button>;
  }

  return (
    <a
      className="social-action"
      download={download}
      href={href}
      rel={external ? "noopener noreferrer" : undefined}
      target={external ? "_blank" : undefined}
    >
      {content}
    </a>
  );
}

export function HomeLanding() {
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const closeCvModal = useCallback(() => setIsCvModalOpen(false), []);

  return (
    <section aria-labelledby="home-title" className="home-landing" id="home">
      <div aria-hidden="true" className="home-atmosphere">
        <div className="light-orb light-orb-primary" />
        <div className="light-orb light-orb-secondary" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="hero-grid" />
        <div className="home-beam" />
      </div>

      <div className="home-hero-layout">
        <section aria-labelledby="home-title" className="home-content">
        <p className="home-eyebrow"><span className="home-eyebrow-line" /> PERSONAL PORTFOLIO</p>
        <p className="home-discipline">COMPUTER SYSTEMS &amp; NETWORK ENGINEERING</p>
        <h1 id="home-title">Biron <span>Shaluka</span></h1>
        <p className="home-role">Computer Systems &amp; Network Engineering<br className="home-role-break" /> Undergraduate at SLIIT.</p>
        <p className="home-introduction">
          Building a strong foundation in computer networking, network systems and IT
          infrastructure, with a passion for technology and continuous learning.
        </p>

        <section aria-label="Social profiles and CV" className="social-actions">
          <SocialAction external href="https://github.com/bironshaluka2003-biron" kind="github" label="GitHub" />
          <SocialAction external href="https://www.linkedin.com/in/bironshaluka/" kind="linkedin" label="LinkedIn" />
          <SocialAction href="/Biron-Shaluka-CV.pdf" kind="download" label="View My CV" onClick={() => setIsCvModalOpen(true)} />
        </section>

        <div className="home-footnote"><span /> NETWORKS · SYSTEMS · INFRASTRUCTURE</div>
        </section>

        <NetworkVisualization />
      </div>

      <div aria-hidden="true" className="home-index"><span>PORTFOLIO</span><span>01</span></div>
      <CvModal isOpen={isCvModalOpen} onClose={closeCvModal} />
    </section>
  );
}
