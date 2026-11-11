import {
  siAnaconda,
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
  siMysql,
  siNextdotjs,
  siPandas,
  siPython,
  siSpringboot,
  siTailwindcss,
  siTerraform,
  siVercel,
  siVscodium,
  siGithubactions,
} from "simple-icons";

type BrandIcon = { path: string; hex: string };
type TechnicalMark = "java" | "network" | "subnet" | "route" | "switch" | "packet" | "storage" | "terminal" | "assistant";
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
      { name: "Next.js", icon: siNextdotjs },
      { name: "Tailwind CSS", icon: siTailwindcss },
      { name: "Spring Boot", icon: siSpringboot },
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
      { name: "AWS S3", mark: "storage" },
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
      { name: "Terraform", icon: siTerraform },
      { name: "GitHub Actions", icon: siGithubactions },
      { name: "AWS CLI", mark: "terminal" },
      { name: "Codex", mark: "assistant" },
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
      {kind === "storage" && <><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" /><path d="m4.4 7.7 7.6 4.4 7.6-4.4M12 12.1V21" /></>}
      {kind === "terminal" && <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3m6 0h4" /></>}
      {kind === "assistant" && <><path d="M12 3.5v3m0 11v3m8.5-8.5h-3m-11 0h-3m14.01-6.01-2.12 2.12m-7.78 7.78-2.12 2.12m12.02 0-2.12-2.12m-7.78-7.78L6.49 5.99" /><circle cx="12" cy="12" r="4" /></>}
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

  return <FallbackMark kind={item.mark ?? "network"} />;
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
