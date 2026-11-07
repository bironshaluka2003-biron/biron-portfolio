export function SiteFooter() {
  return (
    <footer aria-labelledby="site-footer-title" className="site-footer" data-scroll-transition="CONTACT" id="contact">
      <div className="site-footer-inner">
        <div className="site-footer-copy">
          <p className="site-footer-eyebrow">CONTACT</p>
          <h2 id="site-footer-title">Let&apos;s connect.</h2>
        </div>
        <nav aria-label="Social profiles" className="site-footer-links">
          <a href="https://github.com/bironshaluka2003-biron" rel="noopener noreferrer" target="_blank">GitHub <span aria-hidden="true">↗</span></a>
          <a href="https://www.linkedin.com/in/bironshaluka/" rel="noopener noreferrer" target="_blank">LinkedIn <span aria-hidden="true">↗</span></a>
        </nav>
        <p className="site-footer-signoff">Biron Shaluka <span>·</span> Computer Systems &amp; Network Engineering</p>
      </div>
    </footer>
  );
}
