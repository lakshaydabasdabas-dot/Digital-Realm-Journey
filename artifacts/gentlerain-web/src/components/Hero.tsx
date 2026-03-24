import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { WebGLHero } from './WebGLHero';

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });

      tl.fromTo(tagRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );

      tl.fromTo(headlineRef.current?.querySelectorAll('.hl') ?? [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.07, ease: 'power3.out' },
        '-=0.4'
      );

      tl.fromTo(subRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
        '-=0.5'
      );

      tl.fromTo(ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      );

      tl.fromTo(scrollRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        '-=0.2'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const lines = [
    { text: 'Language', gold: false },
    { text: 'learning,', gold: false },
    { text: 'redefined.', gold: true },
  ];

  return (
    <section
      ref={heroRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(1.5rem, 5vw, 5rem)',
        paddingTop: '6rem',
        overflow: 'hidden',
      }}
    >
      {/* WebGL / CSS Background */}
      <div className="hero-canvas-wrap">
        <WebGLHero />
      </div>

      {/* Radial vignette overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 65% 50%, transparent 20%, rgba(10,9,6,0.6) 65%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Bottom fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: 'linear-gradient(to bottom, transparent, var(--clr-bg))',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: '980px', width: '100%' }}>
        {/* Label */}
        <div ref={tagRef} className="tag" style={{ marginBottom: '2rem', opacity: 0 }}>
          <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--clr-gold)', marginRight: '0.4rem' }} />
          AI-powered language coach
        </div>

        {/* Headline */}
        <div ref={headlineRef}>
          {lines.map((line, i) => (
            <div
              key={i}
              className="hl"
              style={{
                fontSize: 'clamp(3.5rem, 10vw, 9.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 0.96,
                color: line.gold ? 'var(--clr-gold)' : 'var(--clr-text)',
                marginBottom: '0.04em',
                opacity: 0,
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        {/* Sub */}
        <div
          ref={subRef}
          style={{
            marginTop: '2.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '3rem',
            opacity: 0,
            flexWrap: 'wrap',
          }}
        >
          <p style={{
            fontFamily: 'var(--app-font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.75,
            color: 'var(--clr-muted)',
            maxWidth: '340px',
          }}>
            Practice conversations. Build fluency.<br />
            Learn the way humans actually speak.
          </p>

          <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '0.2rem' }}>
            {[['50K+', 'Learners'], ['140+', 'Languages'], ['98%', 'Satisfaction']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--clr-text)' }}>{num}</div>
                <div className="text-label" style={{ marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div ref={ctaRef} style={{ marginTop: '3rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: 0, flexWrap: 'wrap' }}>
          <button className="cta-btn" style={{ fontSize: '0.8rem' }}>
            Start for free →
          </button>
          <a
            href="#story"
            onClick={(e) => { e.preventDefault(); document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{
              fontFamily: 'var(--app-font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.1em',
              color: 'var(--clr-muted)',
              textDecoration: 'none',
              textTransform: 'uppercase',
              borderBottom: '1px solid var(--clr-border)',
              paddingBottom: '2px',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--clr-text)';
              e.currentTarget.style.borderColor = 'var(--clr-muted)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--clr-muted)';
              e.currentTarget.style.borderColor = 'var(--clr-border)';
            }}
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollRef}
        className="scroll-indicator"
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          opacity: 0,
        }}
      >
        <span className="text-label">Scroll</span>
        <div className="scroll-line" />
      </div>

      {/* Background decorative lines */}
      <div className="bg-lines" style={{ zIndex: 1 }}>
        {[15, 30, 50, 70, 85].map((left) => (
          <div key={left} className="bg-line" style={{ left: `${left}%` }} />
        ))}
      </div>
    </section>
  );
}
