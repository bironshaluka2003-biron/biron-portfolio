"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/#projects" },
  { label: "Certifications", href: "/#certifications" },
  { label: "Technologies", href: "/#technologies" },
  { label: "Contact", href: "/#contact" },
];

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="navigation">
        <button
          aria-controls="primary-navigation-links"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          className={`nav-menu-toggle${isMenuOpen ? " is-open" : ""}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          type="button"
        >
          <span /><span /><span />
        </button>
        <div className={`nav-links${isMenuOpen ? " is-open" : ""}`} id="primary-navigation-links">
          {links.map((link) => (
            <Link href={link.href} key={link.label} onClick={() => setIsMenuOpen(false)}>{link.label}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
