import { useEffect, useRef } from 'react';

/* ─── Raw WebGL path (deployed browsers) ─────────────────────────────────── */

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 vUv;
void main(){
  vUv = a_pos*0.5+0.5;
  gl_Position = vec4(a_pos,0.,1.);
}`;

const FRAG_SRC = `
precision highp float;
uniform float uTime;
uniform vec2  uMouse;
uniform vec2  uRes;
uniform float uAge[8];
uniform vec2  uPos[8];
varying vec2 vUv;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}

void main(){
  vec2 uv=vUv;
  vec2 asp=vec2(uRes.x/uRes.y,1.);
  vec2 dist=vec2(0.);

  // ambient slow warp
  dist += vec2(fbm(uv*2.+vec2(uTime*.07,uTime*.05)),
               fbm(uv*2.+vec2(uTime*.05,-uTime*.07)))*0.12;

  // mouse shimmer
  vec2 md=(uv-uMouse)*asp;
  float ml=length(md);
  dist += normalize(md+.0001)*sin(ml*28.-uTime*5.)*exp(-ml*3.5)*0.055;

  // click ripples
  for(int i=0;i<8;i++){
    float age=uAge[i];
    if(age<=0.) continue;
    vec2 rd=(uv-uPos[i])*asp;
    float rl=length(rd);
    float w=sin(rl*50.-age*9.)*exp(-age*1.2)*exp(-rl*4.5);
    dist += normalize(rd+.0001)*w*0.075;
  }

  vec2 dUv=uv+dist;
  float n=fbm(dUv*3.+uTime*.06);
  float n2=fbm(dUv*6.-uTime*.04);

  // specular from distortion gradient
  float spec=pow(max(0.,dot(normalize(dist+.0001),vec2(.6,-.8))),5.)*2.2;

  vec3 dark=vec3(.04,.035,.022);
  vec3 mid=vec3(.18,.13,.05);
  vec3 gold=vec3(.95,.75,.20);

  vec3 col=mix(dark,mid,n*.9+n2*.3);
  col=mix(col,gold,spec+pow(n2,3.)*.55);

  float vig=1.-dot((uv-.5)*1.5,(uv-.5)*1.5);
  col*=clamp(vig,0.,1.);
  gl_FragColor=vec4(col,1.);
}`;

function tryWebGL(canvas: HTMLCanvasElement): boolean {
  const gl = (
    canvas.getContext('webgl2') ??
    canvas.getContext('webgl') ??
    canvas.getContext('experimental-webgl')
  ) as WebGLRenderingContext | null;
  if (!gl) return false;

  function mkShader(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src); gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s)!);
    return s;
  }
  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, VERT_SRC));
    gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, FRAG_SRC));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error();
  } catch { return false; }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(prog);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uMouse = gl.getUniformLocation(prog, 'uMouse');
  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uAge = gl.getUniformLocation(prog, 'uAge[0]');
  const uPos = gl.getUniformLocation(prog, 'uPos[0]');

  const MAX = 8;
  const ripples = Array.from({length: MAX}, () => ({x:.5, y:.5, age:0, on:false}));
  let rHead = 0;
  let mNX = .5, mNY = .5, cmNX = .5, cmNY = .5;
  let lastMX = -1, lastMY = -1;
  let nextAuto = 1.5;
  let w = 0, h = 0;

  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w; canvas.height = h;
    gl!.viewport(0, 0, w, h);
  }
  function spawn(nx: number, ny: number) {
    ripples[rHead] = {x: nx, y: ny, age: .001, on: true};
    rHead = (rHead + 1) % MAX;
  }
  function onMove(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    mNX = (e.clientX - r.left) / r.width;
    mNY = 1 - (e.clientY - r.top) / r.height;
    const dx = e.clientX - lastMX, dy = e.clientY - lastMY;
    if (lastMX >= 0 && dx*dx+dy*dy > 300) spawn(mNX, mNY);
    lastMX = e.clientX; lastMY = e.clientY;
  }
  function onClick(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    spawn((e.clientX-r.left)/r.width, 1-(e.clientY-r.top)/r.height);
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMove);
  canvas.addEventListener('click', onClick);

  let raf: number; let start = 0;
  function frame(ts: number) {
    raf = requestAnimationFrame(frame);
    if (!start) start = ts;
    const t = (ts - start) / 1000;
    cmNX += (mNX - cmNX) * .06;
    cmNY += (mNY - cmNY) * .06;
    for (const r of ripples) if (r.on) { r.age += .016; if (r.age > 3.5) r.on = false; }
    if (t > nextAuto) { spawn(.15+Math.random()*.7, .15+Math.random()*.7); nextAuto = t+0.6+Math.random()*1; }

    gl!.useProgram(prog);
    gl!.uniform1f(uTime, t);
    gl!.uniform2f(uMouse, cmNX, cmNY);
    gl!.uniform2f(uRes, w, h);
    const ageArr = new Float32Array(MAX), posArr = new Float32Array(MAX*2);
    for (let i=0;i<MAX;i++) { ageArr[i]=ripples[i].on?ripples[i].age:0; posArr[i*2]=ripples[i].x; posArr[i*2+1]=ripples[i].y; }
    gl!.uniform1fv(uAge, ageArr);
    gl!.uniform2fv(uPos, posArr);
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }
  raf = requestAnimationFrame(frame);

  // Store cleanup on canvas for teardown
  (canvas as any).__cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('click', onClick);
  };
  return true;
}

/* ─── Canvas 2D fallback (sandboxed / headless) ─────────────────────────── */

function runCanvas2D(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  const CELL = 2;
  let w = 0, h = 0, cols = 0, rows = 0;
  let cur: Float32Array, prv: Float32Array;
  const DAMP = 0.975;

  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w; canvas.height = h;
    cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL);
    cur = new Float32Array(cols * rows);
    prv = new Float32Array(cols * rows);
  }

  function idx(x: number, y: number) { return y * cols + x; }

  function drop(cx: number, cy: number, radius: number, str: number) {
    const gx = Math.floor(cx / CELL), gy = Math.floor(cy / CELL);
    const r = Math.ceil(radius / CELL);
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const nx = gx+dx, ny = gy+dy;
      if (nx<0||nx>=cols||ny<0||ny>=rows) continue;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d <= r) { const f = 1-d/r; cur[idx(nx,ny)] -= str*f*f; }
    }
  }

  function step() {
    for (let y=1;y<rows-1;y++) for (let x=1;x<cols-1;x++) {
      const i = idx(x,y);
      const v = (prv[idx(x-1,y)]+prv[idx(x+1,y)]+prv[idx(x,y-1)]+prv[idx(x,y+1)])*0.5 - cur[i];
      cur[i] = v * DAMP;
    }
    const tmp = prv; prv = cur; cur = tmp;
  }

  function render() {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let y=0;y<rows;y++) for (let x=0;x<cols;x++) {
      const h2 = prv[idx(x,y)];
      const hL = x>0?prv[idx(x-1,y)]:h2, hR = x<cols-1?prv[idx(x+1,y)]:h2;
      const hU = y>0?prv[idx(x,y-1)]:h2, hD = y<rows-1?prv[idx(x,y+1)]:h2;
      const nx2 = hL-hR, ny2 = hU-hD;

      const lx = 0.5, ly = -0.7, lz = 0.5;
      const nlen = Math.sqrt(nx2*nx2+ny2*ny2+1);
      const dot = Math.max(0,(nx2*lx+ny2*ly+lz)/nlen);
      const spec = Math.pow(dot, 6) * 3.5;
      const ripAmt = Math.abs(h2) * 0.018;
      const hi = spec + ripAmt;

      const cx2 = x/cols-0.5, cy2 = y/rows-0.5;
      const vig = Math.max(0, 1 - (cx2*cx2+cy2*cy2)*3.2);

      // surface noise hint
      const sn = (Math.sin(x*0.09+y*0.13)*0.5+0.5)*0.025;

      let r = (10 + 202*hi + sn*20) * vig;
      let g = (9  + 159*hi + sn*16) * vig;
      let b = (6  +  36*hi + sn*8)  * vig;

      for (let dy=0;dy<CELL;dy++) for (let dx=0;dx<CELL;dx++) {
        const pi = ((y*CELL+dy)*w + (x*CELL+dx))*4;
        if (pi+3 < d.length) { d[pi]=Math.min(255,r); d[pi+1]=Math.min(255,g); d[pi+2]=Math.min(255,b); d[pi+3]=255; }
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  function onMove(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    drop(e.clientX-r.left, e.clientY-r.top, 35, 420);
  }
  function onClick(e: MouseEvent) {
    const r = canvas.getBoundingClientRect();
    drop(e.clientX-r.left, e.clientY-r.top, 65, 650);
  }

  let lastT = 0, raf: number;
  function loop(t: number) {
    raf = requestAnimationFrame(loop);
    if (t - lastT < 14) return; lastT = t;
    step();
    if (Math.random() < 0.07) drop(Math.random()*w, Math.random()*h, 14+Math.random()*22, 200+Math.random()*280);
    render();
  }

  resize();
  setTimeout(() => { drop(w*.35,h*.45,60,550); drop(w*.65,h*.55,45,420); }, 80);
  setTimeout(() => drop(w*.5,h*.28,38,380), 600);
  setTimeout(() => drop(w*.25,h*.7,30,300), 1100);
  setTimeout(() => drop(w*.75,h*.35,35,340), 1500);

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMove);
  canvas.addEventListener('click', onClick);
  raf = requestAnimationFrame(loop);

  (canvas as any).__cleanup = () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('click', onClick);
  };
}

/* ─── Component ───────────────────────────────────────────────────────────── */

export function WebGLHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const usedWebGL = tryWebGL(canvas);
    if (!usedWebGL) runCanvas2D(canvas);

    return () => { (canvas as any).__cleanup?.(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display:'block', position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
    />
  );
}
