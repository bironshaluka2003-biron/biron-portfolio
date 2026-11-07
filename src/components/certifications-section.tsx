const introductionToIotBadgeImage =
  "https://images.credly.com/images/fce226c2-0f13-4e17-b60c-24fa6ffd88cb/Intro2IoT.png";

const credlyUrl =
  "https://www.credly.com/badges/0ac1fac8-b8a2-4010-8ba3-26f7cb3ae429/public_url";

type AchievementVisual = "official-badge" | "certificate" | "iot" | "security" | "automation" | "insights" | "programming";

type Achievement = {
  title: string;
  type: "Digital Badge" | "Course Certificate" | "Module Achievement";
  issueDate: string;
  dateTime: string;
  visual: AchievementVisual;
  verified?: boolean;
  verificationUrl?: string;
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
    <article className={`achievement-card${achievement.verified ? " achievement-card-verified" : ""}`} style={{ animationDelay: `${index * 65}ms` }}>
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
        <div><dt>Issuer</dt><dd>Cisco Networking Academy</dd></div>
        <div><dt>Issue date</dt><dd><time dateTime={achievement.dateTime}>{achievement.issueDate}</time></dd></div>
      </dl>
      {achievement.verificationUrl && (
        <a className="achievement-verify-link" href={achievement.verificationUrl} rel="noopener noreferrer" target="_blank">
          Verify Credential <span aria-hidden="true">↗</span>
        </a>
      )}
    </article>
  );
}

export function CertificationsSection() {
  return (
    <section aria-labelledby="certifications-title" className="certifications-page" id="certifications">
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
            Professional certifications, digital badges, and learning achievements from Cisco Networking Academy.
          </p>
        </header>

        <section aria-labelledby="cisco-academy-heading" className="certifications-provider">
          <div className="certifications-section-heading">
            <div>
              <p className="certifications-section-label">CREDENTIALS / 01</p>
              <h2 id="cisco-academy-heading">Cisco Networking Academy</h2>
            </div>
            <span className="certifications-total">07 LEARNING ACHIEVEMENTS</span>
          </div>
          <div className="achievement-grid">
            {achievements.map((achievement, index) => (
              <AchievementCard achievement={achievement} index={index} key={`${achievement.type}-${achievement.title}`} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
