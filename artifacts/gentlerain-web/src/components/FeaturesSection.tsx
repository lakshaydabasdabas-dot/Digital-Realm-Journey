import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    id: 'practice',
    label: '01',
    title: 'Practice',
    description: 'Live AI conversations that adapt to your proficiency. No scripts, no rigid flows — just real dialogue that pushes you.',
    detail: 'Conversation engine trained on millions of native speaker interactions. Understands nuance, slang, and regional dialect.',
    icon: '◈',
  },
  {
    id: 'upskill',
    label: '02',
    title: 'Upskill',
    description: 'Targeted grammar, vocabulary, and pronunciation drills delivered in context — not as isolated exercises.',
    detail: 'Smart spaced repetition surfaces gaps when you need them most. Integrated into natural conversation flow.',
    icon: '◐',
  },
  {
    id: 'play',
    label: '03',
    title: 'Play',
    description: 'Roleplay scenarios: order coffee in Tokyo, negotiate in São Paulo, navigate Paris without a map.',
    detail: 'Over 200 curated scenarios across 140+ languages. Cultural briefings included. Stakes feel real.',
    icon: '◎',
  },
  {
    id: 'improve',
    label: '04',
    title: 'Improve',
    description: 'Granular analytics track fluency progression. Know exactly what to work on next — and why.',
    detail: 'AI pronunciation coach flags errors in real time. Accent reduction pathway included for all learners.',
    icon: '◑',
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: index * 0.1,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
          },
        }
      );
    });

    function onMouseMove(e: MouseEvent) {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }

    card.addEventListener('mousemove', onMouseMove);
    return () => {
      ctx.revert();
      card.removeEventListener('mousemove', onMouseMove);
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="feature-card"
      style={{ opacity: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <span className="text-label">{feature.label}</span>
        <span style={{
          fontSize: '1.5rem',
          color: hovered ? 'var(--clr-gold)' : 'var(--clr-muted)',
          transition: 'color 0.3s ease',
        }}>
          {feature.icon}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 700,
        letterSpacing: '-0.02em',
        lineHeight: 1,
        marginBottom: '1.2rem',
        transition: 'color 0.3s ease',
        color: hovered ? 'var(--clr-gold)' : 'var(--clr-text)',
      }}>
        {feature.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--app-font-mono)',
        fontSize: '0.82rem',
        lineHeight: 1.75,
        color: 'var(--clr-muted)',
        marginBottom: '1.5rem',
      }}>
        {feature.description}
      </p>

      {/* Detail (revealed on hover) */}
      <div style={{
        fontFamily: 'var(--app-font-mono)',
        fontSize: '0.72rem',
        lineHeight: 1.7,
        color: 'var(--clr-gold-dim)',
        maxHeight: hovered ? '80px' : '0',
        overflow: 'hidden',
        transition: 'max-height 0.4s ease',
        borderTop: '1px solid var(--clr-border)',
        paddingTop: hovered ? '1rem' : '0',
      }}>
        {feature.detail}
      </div>

      {/* Arrow */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span className="text-label" style={{ fontSize: '0.6rem' }}>Learn more</span>
        <span style={{
          color: 'var(--clr-gold)',
          transform: hovered ? 'translateX(6px)' : 'translateX(0)',
          transition: 'transform 0.3s ease',
          fontSize: '0.9rem',
        }}>
          →
        </span>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current?.querySelectorAll('.anim-el') ?? [],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
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
    <section
      id="features"
      ref={sectionRef}
      className="section"
    >
      {/* Header */}
      <div ref={headerRef} style={{ marginBottom: '4rem' }}>
        <div className="anim-el" style={{ opacity: 0 }}>
          <span className="text-label" style={{ marginBottom: '1rem', display: 'block' }}>What you get</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem' }}>
          <h2
            className="text-title anim-el"
            style={{ opacity: 0 }}
          >
            Four modes.<br />
            <span style={{ color: 'var(--clr-gold)' }}>One purpose.</span>
          </h2>
          <p className="anim-el" style={{
            opacity: 0,
            fontFamily: 'var(--app-font-mono)',
            fontSize: '0.82rem',
            color: 'var(--clr-muted)',
            maxWidth: '280px',
            lineHeight: 1.7,
            flexShrink: 0,
          }}>
            Every feature exists to close the gap between you and fluency. Faster than any classroom.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1px',
        background: 'var(--clr-border)',
      }}>
        {features.map((feature, i) => (
          <FeatureCard key={feature.id} feature={feature} index={i} />
        ))}
      </div>
    </section>
  );
}
