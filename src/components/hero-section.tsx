export function HeroSection() {
  return (
    <main className="hero" id="home">
      <div aria-hidden="true" className="hero-atmosphere">
        <div className="light-orb light-orb-primary" />
        <div className="light-orb light-orb-secondary" />
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <div className="hero-grid" />
      </div>

      <div className="hero-inner">
        <section aria-labelledby="hero-title" className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> PERSONAL PORTFOLIO</div>
          <p className="hero-kicker">COMPUTER SYSTEMS &amp; NETWORK ENGINEERING</p>
          <h1 id="hero-title">Biron <span>Shaluka</span></h1>
          <p className="hero-role">Undergraduate <span className="role-divider">/</span> Networking &amp; IT Infrastructure</p>
          <p className="hero-intro">
            Building a strong foundation in network systems and IT infrastructure,
            with a focus on the technology that keeps people and organizations connected.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#about">About me <span aria-hidden="true">↗</span></a>
            <a className="button button-secondary" href="#projects">View projects <span aria-hidden="true">→</span></a>
          </div>

          <div className="hero-footnote"><span className="footnote-line" /> SYSTEMS · NETWORKS · INFRASTRUCTURE</div>
        </section>

        <aside aria-label="Portrait placeholder" className="portrait-wrap">
          <div className="portrait-glow" />
          <div className="portrait-frame">
            <div className="portrait-topline"><span>PROFILE / 01</span><span>PORTRAIT PLACEHOLDER</span></div>
            <div className="portrait-placeholder">
              <div className="portrait-silhouette">
                <div className="silhouette-head" />
                <div className="silhouette-shoulders" />
              </div>
              <div className="portrait-crosshair crosshair-top" />
              <div className="portrait-crosshair crosshair-bottom" />
              <span className="portrait-caption">YOUR PORTRAIT<br />GOES HERE</span>
              <span className="portrait-index">BS—01</span>
            </div>
            <div className="portrait-bottomline"><span>COMPUTER SYSTEMS</span><span className="portrait-bars"><i /><i /><i /><i /><i /></span></div>
          </div>
          <div aria-hidden="true" className="floating-chip"><span className="chip-dot" /> NETWORKING <span>↗</span></div>
          <span aria-hidden="true" className="hero-coordinate">BIRON SHALUKA · PROFILE 01</span>
        </aside>
      </div>

      <div className="hero-bottom"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>01 / 04</span></div>
    </main>
  );
}
