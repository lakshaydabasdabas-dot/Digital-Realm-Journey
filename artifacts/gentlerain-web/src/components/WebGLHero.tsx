import { useEffect, useRef, useState } from 'react';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float val = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i = 0; i < 5; i++) {
      val += amp * noise(p * freq);
      amp *= 0.5;
      freq *= 2.0;
    }
    return val;
  }

  void main() {
    vec2 uv = vUv;
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);

    vec2 mouseInfluence = uMouse - 0.5;
    float mouseDist = length((uv - 0.5) * aspect - mouseInfluence * aspect);
    float mouseRipple = sin(mouseDist * 20.0 - uTime * 3.0) * exp(-mouseDist * 4.0) * 0.025;

    vec2 distortedUv = uv;
    distortedUv.x += fbm(uv * 2.5 + vec2(uTime * 0.08, uTime * 0.06)) * 0.04 + mouseRipple;
    distortedUv.y += fbm(uv * 2.5 + vec2(uTime * 0.06, -uTime * 0.08)) * 0.04 + mouseRipple;

    float n = fbm(distortedUv * 3.0 + uTime * 0.1);

    vec3 col1 = vec3(0.04, 0.035, 0.02);
    vec3 col2 = vec3(0.12, 0.10, 0.04);
    vec3 col3 = vec3(0.25, 0.20, 0.05);

    vec3 color = mix(col1, col2, n);
    color = mix(color, col3, pow(n, 3.0) * 0.3);

    float vignette = 1.0 - dot((uv - 0.5) * 1.6, (uv - 0.5) * 1.6);
    color *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function CSSFallbackBackground() {
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    let mouseX = 50;
    let mouseY = 50;

    function onMove(e: MouseEvent) {
      mouseX = (e.clientX / window.innerWidth) * 100;
      mouseY = (e.clientY / window.innerHeight) * 100;
      el.style.backgroundImage = `
        radial-gradient(ellipse at ${mouseX}% ${mouseY}%, rgba(212,168,42,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at ${100 - mouseX}% ${100 - mouseY}%, rgba(212,168,42,0.04) 0%, transparent 50%),
        linear-gradient(135deg, #0a0906 0%, #131109 50%, #0a0906 100%)
      `;
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={bgRef}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, #0a0906 0%, #131109 50%, #0a0906 100%)',
        transition: 'background-image 0.3s ease',
      }}
    >
      {/* Animated grid lines */}
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#d4a82a" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Glowing orbs */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '20%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,42,0.08) 0%, transparent 70%)',
        animation: 'orbFloat 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(212,168,42,0.05) 0%, transparent 70%)',
        animation: 'orbFloat 10s ease-in-out infinite reverse',
      }} />

      <style>{`
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
      `}</style>
    </div>
  );
}

export function WebGLHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: import('three').WebGLRenderer | null = null;
    let rafId: number;

    async function init() {
      try {
        const THREE = await import('three');

        renderer = new THREE.WebGLRenderer({ canvas: canvas!, antialias: false, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(canvas!.clientWidth, canvas!.clientHeight);

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;

        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uResolution: { value: new THREE.Vector2(canvas!.clientWidth, canvas!.clientHeight) },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let mouseX = 0.5;
        let mouseY = 0.5;
        let currentX = 0.5;
        let currentY = 0.5;

        function onMouseMove(e: MouseEvent) {
          const rect = canvas!.getBoundingClientRect();
          mouseX = (e.clientX - rect.left) / rect.width;
          mouseY = 1 - (e.clientY - rect.top) / rect.height;
        }

        let lastTime = 0;
        function animate(time: number) {
          rafId = requestAnimationFrame(animate);
          if (time - lastTime < 16) return;
          lastTime = time;
          currentX += (mouseX - currentX) * 0.04;
          currentY += (mouseY - currentY) * 0.04;
          uniforms.uTime.value = time * 0.001;
          uniforms.uMouse.value.set(currentX, currentY);
          renderer!.render(scene, camera);
        }

        function onResize() {
          const w = canvas!.clientWidth;
          const h = canvas!.clientHeight;
          renderer!.setSize(w, h);
          uniforms.uResolution.value.set(w, h);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('resize', onResize);
        rafId = requestAnimationFrame(animate);

        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('resize', onResize);
          cancelAnimationFrame(rafId);
          renderer?.dispose();
          geometry.dispose();
          material.dispose();
        };
      } catch (err) {
        console.warn('WebGL not available, using CSS fallback:', err);
        setWebglSupported(false);
        return undefined;
      }
    }

    let cleanup: (() => void) | undefined;
    init().then(fn => { cleanup = fn; });

    return () => {
      cancelAnimationFrame(rafId);
      cleanup?.();
    };
  }, []);

  if (!webglSupported) {
    return <CSSFallbackBackground />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="webgl-canvas"
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}
