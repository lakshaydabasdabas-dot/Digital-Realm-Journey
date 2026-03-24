import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const bigTextRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(bigTextRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: bigTextRef.current,
            start: 'top 80%',
          },
        }
      );

      // Stagger footer links
      gsap.fromTo('.footer-link',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  const footerLinks = {
    Product: ['Practice', 'Upskill', 'Play', 'Improve'],
    Company: ['About', 'Blog', 'Careers', 'Press'],
    Legal: ['Privacy', 'Terms', 'Cookies'],
  };

  return (
    <footer ref={footerRef}>
      {/* Big text */}
      <div ref={bigTextRef} style={{ marginBottom: '4rem', opacity: 0 }}>
        <div style={{
          fontSize: 'clamp(2.5rem, 7vw, 7rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          color: 'var(--clr-text)',
        }}>
          Speak fluently.
        </div>
        <div style={{
          fontSize: 'clamp(2.5rem, 7vw, 7rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          color: 'var(--clr-gold)',
        }}>
          Think clearly.
        </div>
      </div>

      {/* Email signup */}
      <div style={{
        marginBottom: '4rem',
        padding: '2rem',
        border: '1px solid var(--clr-border)',
        background: 'rgba(212, 168, 42, 0.02)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '2rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Stay in the loop</div>
          <div className="text-label" style={{ fontSize: '0.65rem' }}>Early access, new languages, product updates</div>
        </div>

        {submitted ? (
          <div style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.8rem', color: 'var(--clr-gold)' }}>
            ✓ You're on the list. Talk soon.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', flexShrink: 0 }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                background: 'var(--clr-bg)',
                border: '1px solid var(--clr-border)',
                borderRight: 'none',
                padding: '0.8rem 1.2rem',
                fontFamily: 'var(--app-font-mono)',
                fontSize: '0.8rem',
                color: 'var(--clr-text)',
                outline: 'none',
                width: '240px',
              }}
            />
            <button type="submit" className="cta-btn" style={{ fontSize: '0.7rem' }}>
              Notify me
            </button>
          </form>
        )}
      </div>

      {/* Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem',
      }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.75rem', color: 'var(--clr-gold)', letterSpacing: '0.15em' }}>GR</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>gentlerain</span>
          </div>
          <p style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.72rem', color: 'var(--clr-muted)', lineHeight: 1.7, maxWidth: '200px' }}>
            Language learning that feels like living it.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category}>
            <div className="text-label" style={{ marginBottom: '1rem', fontSize: '0.6rem' }}>{category}</div>
            <ul style={{ listStyle: 'none' }}>
              {links.map((link) => (
                <li key={link} className="footer-link" style={{ opacity: 0, marginBottom: '0.6rem' }}>
                  <a
                    href="#"
                    style={{
                      fontFamily: 'var(--app-font-mono)',
                      fontSize: '0.78rem',
                      color: 'var(--clr-muted)',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--clr-text)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--clr-muted)')}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        paddingTop: '2rem',
        borderTop: '1px solid var(--clr-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <span className="text-label" style={{ fontSize: '0.6rem' }}>
          © {new Date().getFullYear()} Gentlerain AI. All rights reserved.
        </span>
        <span className="text-label" style={{ fontSize: '0.6rem' }}>
          Crafted with intention · Built for fluency
        </span>
      </div>
    </footer>
  );
}
