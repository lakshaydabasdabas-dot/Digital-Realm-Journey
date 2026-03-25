import { useEffect, useRef } from 'react';

const SEGMENTS = 28;
const GOLD_R = 212, GOLD_G = 168, GOLD_B = 42;

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    let mouseX = -400, mouseY = -400;
    let visible = false;

    // Spring chain — each node follows the one ahead of it
    const nodes = Array.from({ length: SEGMENTS }, () => ({ x: -400, y: -400 }));

    function onMouseMove(e: MouseEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        // Snap all nodes to cursor on first move so no fly-in
        for (const n of nodes) { n.x = mouseX; n.y = mouseY; }
        visible = true;
      }
    }

    function onResize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    }

    let raf: number;

    function frame() {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      if (!visible) return;

      // Propagate spring chain
      nodes[0].x += (mouseX - nodes[0].x) * 0.38;
      nodes[0].y += (mouseY - nodes[0].y) * 0.38;
      for (let i = 1; i < SEGMENTS; i++) {
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * 0.32;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * 0.32;
      }

      // Draw tapered ribbon path (head → tail)
      for (let i = 0; i < SEGMENTS - 1; i++) {
        const t0 = 1 - i / SEGMENTS;         // 1 at head
        const t1 = 1 - (i + 1) / SEGMENTS;

        const alpha0 = t0 * t0 * 0.9;
        const alpha1 = t1 * t1 * 0.9;
        const r0 = t0 * 5.5 + 0.5;
        const r1 = t1 * 5.5 + 0.5;

        const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[i + 1].x, nodes[i + 1].y);
        grad.addColorStop(0, `rgba(${GOLD_R},${GOLD_G},${GOLD_B},${alpha0})`);
        grad.addColorStop(1, `rgba(${GOLD_R},${GOLD_G},${GOLD_B},${alpha1})`);

        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = (r0 + r1) * 0.9;
        ctx.lineCap = 'round';
        ctx.shadowColor = `rgba(${GOLD_R},${GOLD_G},${GOLD_B},${alpha0 * 0.7})`;
        ctx.shadowBlur = r0 * 5;
        ctx.stroke();
      }

      // Bright head dot
      const headAlpha = 1;
      const headR = 5;
      ctx.beginPath();
      ctx.arc(nodes[0].x, nodes[0].y, headR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD_R},${GOLD_G},${GOLD_B + 40},${headAlpha})`;
      ctx.shadowColor = `rgba(${GOLD_R},${GOLD_G},${GOLD_B},0.95)`;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Second glow pass for extra bloom
      ctx.beginPath();
      ctx.arc(nodes[0].x, nodes[0].y, headR * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${GOLD_R},${GOLD_G},${GOLD_B},0.12)`;
      ctx.shadowBlur = 28;
      ctx.fill();
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
