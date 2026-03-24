import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const scenes = [
  {
    number: '01',
    label: 'The Problem',
    headline: 'Learning a language feels\nlike a chore.',
    body: 'Traditional apps give you points for clicking buttons. Real fluency comes from real conversation — messy, unpredictable, alive.',
    accent: 'var(--clr-muted)',
  },
  {
    number: '02',
    label: 'The Shift',
    headline: 'What if your tutor\nnever sleeps?',
    body: 'Gentlerain pairs you with an AI coach that speaks like a native, adapts to your level, and is endlessly patient. At 3am if needed.',
    accent: 'var(--clr-gold-dim)',
  },
  {
    number: '03',
    label: 'The Experience',
    headline: 'You become\nthe story.',
    body: 'Immersive roleplay scenarios. Real-world dialogues. Cultural context woven in. Every session is a world you step into.',
    accent: 'var(--clr-gold)',
  },
];

function SceneItem({ scene, index }: { scene: typeof scenes[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 70%',
          end: 'bottom 30%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 0.6, ease: 'power3.out' }
      )
      .fromTo(numberRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.3'
      )
      .fromTo(headlineRef.current?.querySelectorAll('.hl') ?? [],
        { yPercent: 100 },
        { yPercent: 0, duration: 0.9, stagger: 0.08, ease: 'expo.out' },
        '-=0.4'
      )
      .fromTo(bodyRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      );
    });

    return () => ctx.revert();
  }, []);

  const lines = scene.headline.split('\n');

  return (
    <div
      ref={ref}
      style={{
        padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 5rem)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        alignItems: 'center',
        borderBottom: '1px solid var(--clr-border)',
      }}
    >
      {/* Left: Number + label */}
      <div>
        <div
          ref={lineRef}
          style={{
            height: '1px',
            background: scene.accent,
            marginBottom: '1.5rem',
            width: '60px',
          }}
        />
        <span
          ref={numberRef}
          className="text-label"
          style={{ opacity: 0, display: 'block', marginBottom: '1rem', fontSize: '0.65rem' }}
        >
          {scene.number} — {scene.label}
        </span>
        <h2 ref={headlineRef} style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          {lines.map((line, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <span className="hl" style={{ display: 'block', color: i === lines.length - 1 ? scene.accent : 'var(--clr-text)' }}>
                {line}
              </span>
            </div>
          ))}
        </h2>
      </div>

      {/* Right: Body + decorative element */}
      <div>
        <p
          ref={bodyRef}
          style={{
            fontFamily: 'var(--app-font-mono)',
            fontSize: '0.95rem',
            lineHeight: 1.8,
            color: 'var(--clr-muted)',
            maxWidth: '400px',
            opacity: 0,
          }}
        >
          {scene.body}
        </p>

        {/* Decorative grid cell */}
        <div style={{
          marginTop: '2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          opacity: 0.15,
          width: '120px',
        }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{
              width: '16px',
              height: '16px',
              border: '1px solid var(--clr-gold)',
              opacity: Math.random() > 0.5 ? 1 : 0.3,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: 30 },
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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="story" ref={sectionRef}>
      {/* Section header */}
      <div
        ref={headerRef}
        style={{
          padding: 'clamp(4rem, 8vw, 8rem) clamp(1.5rem, 5vw, 5rem) 2rem',
          borderBottom: '1px solid var(--clr-border)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          opacity: 0,
        }}
      >
        <h2 className="text-label">The Experience</h2>
        <span className="text-label" style={{ fontSize: '0.6rem' }}>Three acts</span>
      </div>

      {/* Scenes */}
      {scenes.map((scene, i) => (
        <SceneItem key={i} scene={scene} index={i} />
      ))}
    </section>
  );
}
