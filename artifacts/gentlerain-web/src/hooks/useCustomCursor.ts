import { useEffect } from 'react';
import gsap from 'gsap';

export function useCustomCursor() {
  useEffect(() => {
    const dot = document.querySelector<HTMLElement>('.cursor__dot');
    const ring = document.querySelector<HTMLElement>('.cursor__ring');

    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number;

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.set(dot, { x: mouseX, y: mouseY });
    }

    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      gsap.set(ring, { x: ringX, y: ringY });
      rafId = requestAnimationFrame(animateRing);
    }

    function onMouseEnterLink() {
      gsap.to(dot, { scale: 0.3, duration: 0.3, ease: 'power2.out' });
      gsap.to(ring, { scale: 1.8, opacity: 0.8, duration: 0.4, ease: 'power2.out' });
    }

    function onMouseLeaveLink() {
      gsap.to(dot, { scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(ring, { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }

    document.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(animateRing);

    const links = document.querySelectorAll('a, button, .cta-btn');
    links.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnterLink);
      el.addEventListener('mouseleave', onMouseLeaveLink);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafId);
      links.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnterLink);
        el.removeEventListener('mouseleave', onMouseLeaveLink);
      });
    };
  }, []);
}
