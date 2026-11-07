import Link from "next/link";

const links = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact", href: "/#contact" },
];

export function Navigation() {
  return (
    <header className="site-header">
      <nav aria-label="Main navigation" className="navigation">
        <div className="nav-links">
          {links.map((link) => (
            <Link href={link.href} key={link.label}>{link.label}</Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
