import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export function Nav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    gsap.fromTo(nav,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.4 }
    );
  }, []);

  return (
    <nav ref={navRef} style={{ opacity: 0 }}>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.75rem', color: 'var(--clr-gold)', letterSpacing: '0.15em' }}>
          GR
        </span>
        <span style={{ fontFamily: 'var(--app-font-sans)', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          gentlerain
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <a
          href="#features"
          onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
          style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--clr-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--clr-muted)')}
        >
          Product
        </a>
        <a
          href="#story"
          onClick={(e) => { e.preventDefault(); document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }); }}
          style={{ fontFamily: 'var(--app-font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--clr-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--clr-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--clr-muted)')}
        >
          Story
        </a>
        <button className="cta-btn" style={{ fontSize: '0.65rem' }}>
          Try now →
        </button>
      </div>
    </nav>
  );
}
