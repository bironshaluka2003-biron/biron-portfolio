export function SiteFooter() {
  return (
    <footer aria-labelledby="site-footer-title" className="site-footer" data-scroll-transition="CONTACT" id="contact">
      <div className="site-footer-inner">
        <div className="site-footer-copy">
          <p className="site-footer-eyebrow">CONTACT</p>
          <h2 id="site-footer-title">Let&apos;s connect.</h2>
          <address aria-label="Contact details" className="site-footer-contact-details">
            <a className="site-footer-contact-link" href="mailto:bironshaluka2003@gmail.com">
              <span aria-hidden="true" className="site-footer-contact-icon">
                <svg fill="none" viewBox="0 0 24 24"><rect height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" width="19" x="2.5" y="4.5" /><path d="m3.5 6 8.5 7 8.5-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
              </span>
              <span className="site-footer-contact-text"><span>Email</span><span>bironshaluka2003@gmail.com</span></span>
            </a>
            <a className="site-footer-contact-link" href="tel:+94704393188">
              <span aria-hidden="true" className="site-footer-contact-icon">
                <svg fill="none" viewBox="0 0 24 24"><path d="M7.2 3.5h2.2l1.1 4.2-1.9 1.7a15 15 0 0 0 6 6l1.7-1.9 4.2 1.1v2.2a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5.2 5.7a2 2 0 0 1 2-2.2Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></svg>
              </span>
              <span className="site-footer-contact-text"><span>Mobile</span><span>070-4393188</span></span>
            </a>
          </address>
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
