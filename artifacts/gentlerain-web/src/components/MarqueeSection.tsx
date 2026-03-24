import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const languages = [
  'Spanish', 'Mandarin', 'French', 'Japanese', 'Portuguese', 'Arabic',
  'German', 'Korean', 'Italian', 'Russian', 'Hindi', 'Turkish',
  'Spanish', 'Mandarin', 'French', 'Japanese', 'Portuguese', 'Arabic',
  'German', 'Korean', 'Italian', 'Russian', 'Hindi', 'Turkish',
];

const testimonials = [
  { quote: '"Finally, a way to practice without embarrassment."', lang: 'Spanish learner' },
  { quote: '"My accent improved in 6 weeks."', lang: 'Mandarin learner' },
  { quote: '"It just... works."', lang: 'French learner' },
  { quote: '"Finally, a way to practice without embarrassment."', lang: 'Spanish learner' },
  { quote: '"My accent improved in 6 weeks."', lang: 'Mandarin learner' },
  { quote: '"It just... works."', lang: 'French learner' },
];

export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      // Counter animation
      const counters = counterRef.current?.querySelectorAll('.counter-val');
      counters?.forEach((el) => {
        const target = parseInt(el.getAttribute('data-target') ?? '0', 10);
        gsap.fromTo(el,
          { textContent: '0' },
          {
            textContent: target,
            duration: 2,
            ease: 'power2.out',
            snap: { textContent: 1 },
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{ paddingTop: 0 }}>
      {/* Stats counter */}
      <div ref={counterRef} className="counter-grid" style={{ borderTop: '1px solid var(--clr-border)', borderBottom: '1px solid var(--clr-border)' }}>
        {[
          { value: 50000, suffix: '+', label: 'Active learners' },
          { value: 140, suffix: '+', label: 'Languages supported' },
          { value: 12, suffix: 'M+', label: 'Conversations held' },
          { value: 98, suffix: '%', label: 'Satisfaction rate' },
        ].map(({ value, suffix, label }) => (
          <div key={label} className="counter-item">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0' }}>
              <span
                className="counter-val"
                data-target={value}
                style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--clr-text)' }}
              >
                0
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--clr-gold)', marginLeft: '2px' }}>{suffix}</span>
            </div>
            <div className="text-label" style={{ marginTop: '0.4rem' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Section header */}
      <div
        ref={headerRef}
        style={{
          padding: 'clamp(3rem, 6vw, 6rem) clamp(1.5rem, 5vw, 5rem) 2rem',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          opacity: 0,
        }}
      >
        <h2 className="text-label">140+ languages</h2>
        <span className="text-label" style={{ fontSize: '0.6rem' }}>And counting</span>
      </div>

      {/* Language marquee */}
      <div style={{ overflow: 'hidden', paddingBottom: '1rem', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="marquee-track">
          {languages.map((lang, i) => (
            <span key={i} style={{
              fontFamily: 'var(--app-font-mono)',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: i % 3 === 0 ? 'var(--clr-gold)' : 'var(--clr-muted)',
              whiteSpace: 'nowrap',
              padding: '0.8rem 0',
            }}>
              {lang}
              <span style={{ marginLeft: '3rem', color: 'var(--clr-border)' }}>·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Testimonials marquee (reversed) */}
      <div style={{ overflow: 'hidden', paddingTop: '1rem', borderBottom: '1px solid var(--clr-border)' }}>
        <div className="marquee-track" style={{ animationDirection: 'reverse', animationDuration: '40s' }}>
          {testimonials.map((t, i) => (
            <span key={i} style={{
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.8rem 0',
            }}>
              <span style={{
                fontFamily: 'var(--app-font-mono)',
                fontSize: '0.78rem',
                color: 'var(--clr-text)',
                fontStyle: 'italic',
              }}>
                {t.quote}
              </span>
              <span className="text-label" style={{ fontSize: '0.6rem' }}>— {t.lang}</span>
              <span style={{ marginLeft: '2rem', color: 'var(--clr-border)' }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
