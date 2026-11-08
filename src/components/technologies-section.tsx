import {
  siAnaconda,
  siApachemaven,
  siC,
  siCisco,
  siCss,
  siGit,
  siGithub,
  siGooglecolab,
  siHtml5,
  siIntellijidea,
  siJupyter,
  siLinux,
  siMake,
  siMysql,
  siNextdotjs,
  siPandas,
  siPython,
  siScikitlearn,
  siSpringboot,
  siTailwindcss,
  siThreedotjs,
  siTypescript,
  siVercel,
  siVscodium,
} from "simple-icons";

type BrandIcon = { path: string; hex: string };
type TechnicalMark = "java" | "network" | "subnet" | "route" | "switch" | "packet" | "terminal" | "tree" | "chart";
type Technology = { name: string; icon?: BrandIcon; mark?: TechnicalMark };
type TechnologyCategory = { id: string; number: string; title: string; items: Technology[] };

const categories: TechnologyCategory[] = [
  {
    id: "programming-web",
    number: "01",
    title: "Programming & Web Development",
    items: [
      { name: "Java", mark: "java" },
      { name: "C", icon: siC },
      { name: "Python", icon: siPython },
      { name: "HTML", icon: siHtml5 },
      { name: "CSS", icon: siCss },
      { name: "TypeScript", icon: siTypescript },
      { name: "Next.js", icon: siNextdotjs },
      { name: "Tailwind CSS", icon: siTailwindcss },
      { name: "Spring Boot", icon: siSpringboot },
      { name: "Three.js", icon: siThreedotjs },
    ],
  },
  {
    id: "networking-infrastructure",
    number: "02",
    title: "Networking & Infrastructure",
    items: [
      { name: "Cisco Packet Tracer", icon: siCisco },
      { name: "Cisco IOS", icon: siCisco },
      { name: "IPv4 / IPv6", mark: "network" },
      { name: "VLSM", mark: "subnet" },
      { name: "VLAN", mark: "subnet" },
      { name: "OSPF", mark: "route" },
      { name: "NAT / PAT", mark: "switch" },
      { name: "TCP/IP", mark: "packet" },
      { name: "UDP", mark: "packet" },
      { name: "Linux", icon: siLinux },
    ],
  },
  {
    id: "databases-tools",
    number: "03",
    title: "Databases & Development Tools",
    items: [
      { name: "MySQL", icon: siMysql },
      { name: "MySQL Workbench", icon: siMysql },
      { name: "Git", icon: siGit },
      { name: "GitHub", icon: siGithub },
      { name: "Visual Studio Code", icon: siVscodium },
      { name: "IntelliJ IDEA", icon: siIntellijidea },
      { name: "Vercel", icon: siVercel },
      { name: "Maven", icon: siApachemaven },
      { name: "GCC", mark: "terminal" },
      { name: "Makefile", icon: siMake },
    ],
  },
  {
    id: "data-science",
    number: "04",
    title: "Data Science & Machine Learning",
    items: [
      { name: "Jupyter Notebook", icon: siJupyter },
      { name: "Google Colab", icon: siGooglecolab },
      { name: "Anaconda", icon: siAnaconda },
      { name: "Pandas", icon: siPandas },
      { name: "Scikit-learn", icon: siScikitlearn },
      { name: "LightGBM", mark: "tree" },
      { name: "PCA", mark: "chart" },
    ],
  },
];

function FallbackMark({ kind }: { kind: TechnicalMark }) {
  return (
    <svg aria-hidden="true" className="technology-mark" fill="none" viewBox="0 0 24 24">
      {kind === "java" && <><path d="M8 14h8l-.8 5H8.8L8 14Z" /><path d="M16 15h1.2a1.8 1.8 0 0 1 0 3.6h-.7M9 21h7m-9 0h11M10 11c-1-1.2 1.5-1.6.5-3m3 3c-1-1.2 1.5-1.6.5-3" /></>}
      {kind === "network" && <><path d="m6 7 6 4 6-4m-6 4v7" /><circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="18" r="2" /></>}
      {kind === "subnet" && <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>}
      {kind === "route" && <><circle cx="5" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M7 18h4a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3" /></>}
      {kind === "switch" && <><path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4" /></>}
      {kind === "packet" && <><rect x="3.5" y="5" width="17" height="14" rx="2" /><path d="M7 9h10M7 12h6m-6 3h8" /></>}
      {kind === "terminal" && <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>}
      {kind === "tree" && <><path d="M12 5v5m0 0-6 5m6-5 6 5M6 15v4m12-4v4" /><circle cx="12" cy="4" r="2" /><circle cx="6" cy="16" r="2" /><circle cx="18" cy="16" r="2" /></>}
      {kind === "chart" && <><path d="M4 20V5m0 15h16" /><circle cx="8" cy="15" r="1" /><circle cx="11" cy="12" r="1" /><circle cx="15" cy="10" r="1" /><circle cx="18" cy="7" r="1" /></>}
    </svg>
  );
}

function TechnologyIcon({ item }: { item: Technology }) {
  if (item.icon) {
    const iconColor = item.icon.hex === "000000" ? "#E8F5F3" : `#${item.icon.hex}`;
    return (
      <svg aria-hidden="true" className="technology-brand-icon" fill="currentColor" viewBox="0 0 24 24" style={{ color: iconColor }}>
        <path d={item.icon.path} />
      </svg>
    );
  }

  return <FallbackMark kind={item.mark ?? "terminal"} />;
}

function TechnologyCard({ item }: { item: Technology }) {
  return (
    <li className="technology-card">
      <TechnologyIcon item={item} />
      <span>{item.name}</span>
    </li>
  );
}

export function TechnologiesSection() {
  return (
    <section
      aria-labelledby="technologies-title"
      className="technologies-section"
      data-scroll-transition="TECHNOLOGIES"
      id="technologies"
    >
      <div aria-hidden="true" className="technologies-atmosphere">
        <span className="technologies-glow technologies-glow-one" />
        <span className="technologies-glow technologies-glow-two" />
      </div>
      <div className="technologies-shell">
        <header className="technologies-heading">
          <p className="technologies-eyebrow"><span /> ENGINEERING TOOLKIT</p>
          <h2 id="technologies-title">Technologies <span>&amp; Tools</span></h2>
          <p className="technologies-intro">Languages, platforms, and tools used across software development, networking, and data science.</p>
        </header>
        <div className="technology-categories">
          {categories.map((category, index) => (
            <section aria-labelledby={`${category.id}-title`} className="technology-category" key={category.id} style={{ animationDelay: `${index * 70}ms` }}>
              <header className="technology-category-heading">
                <span className="technology-category-number">{category.number}</span>
                <h3 id={`${category.id}-title`}>{category.title}</h3>
              </header>
              <ul className="technology-listing">
                {category.items.map((item) => <TechnologyCard item={item} key={item.name} />)}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
