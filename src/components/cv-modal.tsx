"use client";

import { useEffect, useRef } from "react";

type CvModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const CV_URL = "/Biron-Shaluka-CV.pdf";

export function CvModal({ isOpen, onClose }: CvModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - root.clientWidth;
    const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;

    body.style.overflow = "hidden";
    root.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    if (!dialog.open) dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      body.style.paddingRight = previousBodyPaddingRight;
    };
  }, [isOpen]);

  return (
    <dialog
      aria-describedby="cv-modal-description"
      aria-labelledby="cv-modal-title"
      className="cv-dialog"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialogRef}
    >
      <section className="cv-modal-card">
        <button aria-label="Close CV options" autoFocus className="cv-modal-close" onClick={onClose} type="button">
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
          </svg>
        </button>
        <p className="cv-modal-eyebrow"><span /> CURRICULUM VITAE</p>
        <h2 id="cv-modal-title">View My CV</h2>
        <p className="cv-modal-description" id="cv-modal-description">Choose how you would like to view my CV.</p>
        <div className="cv-modal-actions">
          <a href={CV_URL} onClick={onClose} rel="noopener noreferrer" target="_blank">
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M14 4h6v6m-.5-5.5L11 13m7 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
            <span>Preview CV</span>
          </a>
          <a className="is-primary" download="Biron-Shaluka-CV.pdf" href={CV_URL} onClick={onClose}>
            <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
              <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" />
            </svg>
            <span>Download CV</span>
          </a>
        </div>
      </section>
    </dialog>
  );
}
