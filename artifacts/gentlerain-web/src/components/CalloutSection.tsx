import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CalloutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const lines = textRef.current?.querySelectorAll('.cl');
      if (lines) {
        gsap.fromTo(lines,
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: textRef.current,
              start: 'top 75%',
            },
          }
        );
      }

      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.4,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const calloutLines = [
    { text: 'Stop studying.', gold: false },
    { text: 'Start living', gold: false },
    { text: 'the language.', gold: true },
  ];

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(6rem, 12vw, 12rem) clamp(1.5rem, 5vw, 5rem)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background circle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212, 168, 42, 0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Dashed circle */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        border: '1px dashed var(--clr-border)',
        pointerEvents: 'none',
        opacity: 0.4,
      }} />

      <h2 ref={textRef}>
        {calloutLines.map((line, i) => (
          <div key={i} style={{ overflow: 'hidden' }}>
            <span
              className="cl"
              style={{
                display: 'block',
                fontSize: 'clamp(3rem, 8vw, 7rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.0,
                color: line.gold ? 'var(--clr-gold)' : 'var(--clr-text)',
              }}
            >
              {line.text}
            </span>
          </div>
        ))}
      </h2>

      <div
        ref={ctaRef}
        style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', opacity: 0 }}
      >
        <button className="cta-btn" style={{ fontSize: '0.8rem' }}>
          Begin your journey →
        </button>
      </div>

      {/* Small decorative text */}
      <p style={{
        marginTop: '2.5rem',
        fontFamily: 'var(--app-font-mono)',
        fontSize: '0.7rem',
        color: 'var(--clr-muted)',
        letterSpacing: '0.05em',
      }}>
        No credit card required · Cancel anytime · 7-day free trial
      </p>
    </section>
  );
}
