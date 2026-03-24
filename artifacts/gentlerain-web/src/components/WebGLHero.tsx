import { useEffect, useRef } from 'react';

export function WebGLHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let current: Float32Array;
    let prev: Float32Array;
    let rafId: number;
    let mouseX = -1;
    let mouseY = -1;
    let lastTime = 0;

    const DAMPING = 0.985;
    const CELL = 3; // pixels per simulation cell

    function resize() {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;
      cols = Math.ceil(width / CELL);
      rows = Math.ceil(height / CELL);
      current = new Float32Array(cols * rows);
      prev = new Float32Array(cols * rows);
    }

    function idx(x: number, y: number) {
      return y * cols + x;
    }

    function drop(cx: number, cy: number, radius: number, strength: number) {
      const gx = Math.floor(cx / CELL);
      const gy = Math.floor(cy / CELL);
      const r = Math.ceil(radius / CELL);
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= r) {
            const factor = (1 - dist / r);
            current[idx(nx, ny)] -= strength * factor * factor;
          }
        }
      }
    }

    function step() {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = idx(x, y);
          const val =
            (prev[idx(x - 1, y)] +
              prev[idx(x + 1, y)] +
              prev[idx(x, y - 1)] +
              prev[idx(x, y + 1)]) *
            0.5 - current[i];
          current[i] = val * DAMPING;
        }
      }
      // swap
      const tmp = prev;
      prev = current;
      current = tmp;
    }

    function render() {
      // Create background gradient image
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      // Base color: #0a0906 warm dark with subtle gold highlights
      const baseR = 10, baseG = 9, baseB = 6;
      const goldR = 212, goldG = 168, goldB = 42;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const h = prev[idx(x, y)];

          // Sample neighboring heights to compute normal
          const hL = x > 0 ? prev[idx(x - 1, y)] : h;
          const hR = x < cols - 1 ? prev[idx(x + 1, y)] : h;
          const hU = y > 0 ? prev[idx(x, y - 1)] : h;
          const hD = y < rows - 1 ? prev[idx(x, y + 1)] : h;

          const nx = hL - hR;
          const ny = hU - hD;

          // Compute refracted UV
          const refractX = Math.round(nx * 2.5);
          const refractY = Math.round(ny * 2.5);

          // Distance from center for vignette
          const cx = x / cols - 0.5;
          const cy = y / rows - 0.5;
          const dist = Math.sqrt(cx * cx + cy * cy);
          const vignette = Math.max(0, 1 - dist * 2.0);

          // Surface normal lighting
          const lightX = 0.3, lightY = -0.5, lightZ = 0.8;
          const nLen = Math.sqrt(nx * nx + ny * ny + 1);
          const dot = Math.max(0, (nx * lightX + ny * lightY + lightZ) / nLen);
          const specular = Math.pow(dot, 12) * 0.7;

          // Subtle noise-like background variation based on position
          const bgNoise = (Math.sin(x * 0.07 + y * 0.11) * 0.5 + 0.5) * 0.04;

          // Ripple influence on color
          const ripple = Math.abs(h) * 0.008;
          const highlight = specular + ripple;

          // Mix base + gold highlight
          let r = baseR + (goldR - baseR) * highlight + bgNoise * 15;
          let g = baseG + (goldG - baseG) * highlight + bgNoise * 12;
          let b = baseB + (goldB - baseB) * highlight * 0.4 + bgNoise * 6;

          r *= vignette;
          g *= vignette;
          b *= vignette;

          // Write to pixel buffer (with refraction offset clamped)
          const px = Math.max(0, Math.min(cols - 1, x + refractX));
          const py = Math.max(0, Math.min(rows - 1, y + refractY));
          const pi = (py * CELL * width + px * CELL) * 4;

          // Fill CELL x CELL pixels
          for (let dy = 0; dy < CELL; dy++) {
            for (let dx = 0; dx < CELL; dx++) {
              const pi2 = ((y * CELL + dy) * width + (x * CELL + dx)) * 4;
              if (pi2 + 3 < data.length) {
                data[pi2] = Math.min(255, r);
                data[pi2 + 1] = Math.min(255, g);
                data[pi2 + 2] = Math.min(255, b);
                data[pi2 + 3] = 255;
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      drop(mouseX, mouseY, 20, 180);
    }

    function onTouchMove(e: TouchEvent) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      drop(touch.clientX - rect.left, touch.clientY - rect.top, 20, 180);
    }

    // Occasional random drops for ambient animation
    function randomDrop() {
      if (Math.random() < 0.04) {
        const rx = Math.random() * width;
        const ry = Math.random() * height;
        drop(rx, ry, 8 + Math.random() * 12, 60 + Math.random() * 80);
      }
    }

    function loop(time: number) {
      rafId = requestAnimationFrame(loop);
      const dt = time - lastTime;
      if (dt < 14) return; // ~70fps cap
      lastTime = time;

      step();
      randomDrop();
      render();
    }

    function onResize() {
      resize();
    }

    resize();

    // Seed a couple of initial drops to get things moving
    setTimeout(() => {
      drop(width * 0.35, height * 0.45, 30, 200);
      drop(width * 0.65, height * 0.55, 20, 150);
    }, 100);
    setTimeout(() => {
      drop(width * 0.5, height * 0.3, 15, 120);
    }, 600);

    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
