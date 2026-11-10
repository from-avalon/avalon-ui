"use client";
'use strict';

var react = require('react');
var jsxRuntime = require('react/jsx-runtime');
require('clsx');
require('tailwind-merge');

// src/stage/frame.ts
var jobs = /* @__PURE__ */ new Set();
var queued = false;
function flush() {
  queued = false;
  jobs.forEach((job) => job());
}
function requestStageFrame() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}
function onStageFrame(job) {
  if (jobs.size === 0) {
    addEventListener("scroll", requestStageFrame, { passive: true });
    addEventListener("resize", requestStageFrame);
  }
  jobs.add(job);
  requestStageFrame();
  return () => {
    jobs.delete(job);
    if (jobs.size === 0) {
      removeEventListener("scroll", requestStageFrame);
      removeEventListener("resize", requestStageFrame);
    }
  };
}
function viewportProgress(el) {
  const r = el.getBoundingClientRect();
  const span = innerHeight + r.height;
  return span > 0 ? Math.min(1, Math.max(0, (innerHeight - r.top) / span)) : 0;
}
var lastJump = 0;
function jumpTo(el, below = 0) {
  const jump = ++lastJump;
  const top = el.getBoundingClientRect().top + scrollY + below;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || Math.abs(top - scrollY) <= innerHeight) {
    scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
    return;
  }
  const veil = document.createElement("div");
  veil.className = "avl-veil";
  document.body.appendChild(veil);
  const fade = (from, to) => veil.animate([{ opacity: from }, { opacity: to }], { duration: 150, easing: "ease-out", fill: "forwards" }).finished;
  fade(0, 0.85).then(() => {
    if (jump === lastJump) scrollTo({ top: el.getBoundingClientRect().top + scrollY + below, behavior: "instant" });
    return fade(0.85, 0);
  }).finally(() => veil.remove());
}
function followAnchors() {
  const onClick = (e) => {
    const a = e.target?.closest?.('a[href^="#"]');
    const id = a?.getAttribute("href")?.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    history.pushState(null, "", `#${id}`);
    jumpTo(el);
    el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
function fittedSize(size, textWidth, boxWidth, min) {
  if (textWidth <= boxWidth + 0.5 || textWidth <= 0 || boxWidth <= 0) return size;
  return Math.max(min, Math.floor(size * (boxWidth / textWidth) * 100) / 100);
}
function textSpan(el) {
  const range = document.createRange();
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let left = Infinity, right = -Infinity;
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) {
      left = Math.min(left, r.left);
      right = Math.max(right, r.right);
    }
  }
  return right > left ? right - left : 0;
}
function fitWidth(els, min = 20) {
  for (const el of els) {
    if (!el.getClientRects().length) continue;
    el.style.fontSize = "";
    const cs = getComputedStyle(el);
    const base = parseFloat(cs.fontSize);
    const box = el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
    for (let size = base, i = 0; i < 4; i++) {
      const next = fittedSize(size, textSpan(el), box, min);
      if (next >= size) break;
      el.style.fontSize = `${size = next}px`;
    }
  }
}
function useFitWidth(selector, min) {
  react.useEffect(() => {
    const run = () => fitWidth(document.querySelectorAll(selector), min);
    run();
    addEventListener("resize", run);
    document.fonts?.ready.then(run);
    return () => removeEventListener("resize", run);
  }, [selector, min]);
}
var PHONE = "(max-width: 760px), (max-height: 500px) and (pointer: coarse)";
function useMedia(query) {
  const subscribe = react.useCallback(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query]
  );
  return react.useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false);
}
var MotionContext = react.createContext({ reduced: false, paused: false, toggle: () => {
} });
function MotionProvider({ children }) {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [paused, setPaused] = react.useState(false);
  const toggle = react.useCallback(() => setPaused((p) => !p), []);
  react.useEffect(() => {
    document.documentElement.classList.toggle("rm", reduced);
    document.documentElement.classList.toggle("motion-off", paused);
  }, [reduced, paused]);
  react.useEffect(followAnchors, []);
  const value = react.useMemo(() => ({ reduced, paused, toggle }), [reduced, paused, toggle]);
  return /* @__PURE__ */ jsxRuntime.jsx(MotionContext.Provider, { value, children });
}
function useMotion() {
  return react.useContext(MotionContext);
}
function MotionToggle({ className, labelled }) {
  const { reduced, paused, toggle } = useMotion();
  if (reduced) return null;
  const label = paused ? "Play the motion" : "Pause the motion";
  return /* @__PURE__ */ jsxRuntime.jsxs("button", { type: "button", className: `${labelled ? "avl-motion-item" : "avl-motion"} ${className ?? ""}`, "aria-pressed": paused, title: labelled ? void 0 : label, onClick: toggle, children: [
    /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: paused ? /* @__PURE__ */ jsxRuntime.jsx("path", { className: "avl-motion-play", d: "M8 5l11 7-11 7z" }) : /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 5v14M16 5v14" }) }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: labelled ? void 0 : "avl-sr", children: label })
  ] });
}
function useInView(ref, options) {
  const [inView, setInView] = react.useState(false);
  const { rootMargin = "0px", threshold = 0, once = false } = options ?? {};
  react.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, threshold, once]);
  return inView;
}
function Reveal({ as: Tag = "div", className, style, delay = 0, children, ...rest }) {
  const ref = react.useRef(null);
  const seen = useInView(ref, { rootMargin: "0px 0px -8% 0px", once: true });
  return /* @__PURE__ */ jsxRuntime.jsx(
    Tag,
    {
      ref,
      className: `avl-reveal ${className ?? ""}`,
      "data-in": seen || void 0,
      style: { ...style, "--avl-delay": `${delay}s` },
      ...rest,
      children
    }
  );
}
function SplitText({ as: Tag = "h2", text, className, auto = true, style }) {
  const ref = react.useRef(null);
  const seen = useInView(ref, { rootMargin: "0px 0px -12% 0px", once: true });
  let i = 0;
  return /* @__PURE__ */ jsxRuntime.jsx(Tag, { ref, className: `avl-split ${className ?? ""}`, "aria-label": text, "data-in": auto && seen || void 0, style, children: text.split(" ").map((word, w) => /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
    w > 0 && " ",
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "avl-wd", "aria-hidden": "true", children: [...word].map((c, k) => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "avl-ch", style: { "--avl-i": i++ }, children: c }, k)) })
  ] }, w)) });
}
function ParallaxPlane({ depth, desk, className, style, children }) {
  const ref = react.useRef(null);
  const { reduced } = useMotion();
  react.useEffect(() => {
    const el = ref.current;
    const host = el?.closest("section");
    if (!el || !host || reduced) return;
    const narrow = matchMedia(PHONE);
    if (desk && narrow.matches) return;
    return onStageFrame(() => {
      const r = host.getBoundingClientRect();
      const span = (innerHeight + r.height) / 2 * depth;
      const over = `${-(Math.abs(span) + 2)}px`;
      if (el.style.top !== over) el.style.top = el.style.bottom = over;
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      el.style.transform = `translate3d(0, ${(p * 2 - 1) * span}px, 0)`;
    });
  }, [depth, desk, reduced]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className: `avl-plane ${className ?? ""}`, "data-desk": desk || void 0, style, children });
}
function MistBand({ depth, desk, near }) {
  return /* @__PURE__ */ jsxRuntime.jsx(ParallaxPlane, { depth, desk, className: `avl-mist${near ? " avl-mist-near" : ""}`, children: /* @__PURE__ */ jsxRuntime.jsx("i", {}) });
}

// src/stage/depth-gl.ts
var VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;
var FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uRes, uImg, uCam, uAnchor;
uniform vec4 uShape;     // horizon, floor, sides, canopy
uniform vec4 uMist;      // rgb, amount
uniform vec3 uMote;      // rgb of the motes (0 = none)
uniform float uTime, uZoom, uBright;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 3; i++){ v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }

float depth(vec2 uv){
  float h = uShape.x;
  float g = pow(clamp((uv.y - h) / (1. - h), 0., 1.), .85) * uShape.y;
  float e = pow(abs(uv.x - .5) * 2., 2.2) * uShape.z * (1. - .4 * g);
  float c = pow(clamp((h - uv.y) / max(h, .01), 0., 1.), 1.6) * uShape.w;
  return .1 + g + e + c;
}
const float FOCUS = .4;

void main(){
  vec2 frag = gl_FragCoord.xy; frag.y = uRes.y - frag.y;
  float s = max(uRes.x / uImg.x, uRes.y / uImg.y) * uZoom;
  vec2 uv = (frag - uRes * uAnchor) / (uImg * s) + uAnchor;
  vec2 st = uv + uCam * (depth(uv) - FOCUS);
  st = uv + uCam * (depth(st) - FOCUS);
  vec3 col = texture2D(uTex, clamp(st, .001, .999)).rgb * uBright;

  vec2 sc = frag / uRes.y; float y = frag.y / uRes.y, t = uTime;
  vec2 mp = sc * vec2(1.4, 3.6) + vec2(t * .02, 0.) - uCam * 4.;
  float m = fbm(mp + fbm(mp * .6 - t * .015)) * smoothstep(uShape.x - .38, uShape.x - .05, y) * smoothstep(uShape.x + .45, uShape.x + .05, y);
  col = mix(col, uMist.rgb, clamp(m * m * uMist.a * 1.6, 0., .55));
  if (uMote.r + uMote.g + uMote.b > 0.) {
    float ff = 0.;
    for (int i = 0; i < 14; i++){
      float fi = float(i);
      vec2 h = vec2(hash(vec2(fi, 2.3)), hash(vec2(fi, 8.1)));
      float z = .3 + .7 * hash(vec2(fi, 4.7));
      vec2 fp = vec2(h.x * (uRes.x / uRes.y), h.y);
      fp += vec2(sin(t * (.1 + .08 * z) + fi * 2.3), cos(t * (.09 + .06 * z) + fi)) * .06;
      fp -= uCam * (z * 1.2 + .3) * 2.2;
      float blink = .55 + .45 * sin(t * (.8 + h.x) + fi * 3.);
      float dd = length(sc - fp), rc = .002 + .006 * z * z;
      ff += blink * (exp(-dd * dd / (rc * rc)) + exp(-dd * dd / (rc * rc * 24.)) * .18) * (.35 + .65 * z);
    }
    col += uMote * ff * .7;
  }
  gl_FragColor = vec4(col, 1.);
}`;
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
async function createDepthPlane(host, src, watch, options) {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" });
  if (!gl) return null;
  const shader = (type, source) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(prog, name);
  const uRes = u("uRes"), uCam = u("uCam"), uTime = u("uTime");
  const image = await loadImage(src);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform2f(u("uImg"), image.naturalWidth, image.naturalHeight);
  const { horizon, floor, sides, canopy } = options.shape ?? { horizon: 0.6, floor: 0.8, sides: 0.4, canopy: 0.2 };
  const mist = options.mist ?? { color: [0.6, 0.8, 0.8], amount: 0.5 };
  gl.uniform4f(u("uShape"), horizon, floor, sides, canopy);
  gl.uniform4f(u("uMist"), ...mist.color, mist.amount);
  gl.uniform3f(u("uMote"), ...options.motes ?? [0, 0, 0]);
  gl.uniform2f(u("uAnchor"), ...options.anchor ?? [0.5, 0.5]);
  gl.uniform1f(u("uZoom"), options.zoom ?? 1.1);
  gl.uniform1f(u("uBright"), options.bright ?? 1);
  host.appendChild(canvas);
  host.classList.add("is-gl");
  const dpr = Math.min(window.devicePixelRatio || 1, 1) * (options.scale ?? 0.6);
  let cx = 0, cy = 0, running = false, visible = false, paused = false, moved = true, odd = false, frozen = 0, raf = 0;
  let t0 = performance.now();
  const resize = () => {
    canvas.width = Math.round(Math.max(1, canvas.clientWidth) * dpr);
    canvas.height = Math.round(Math.max(1, canvas.clientHeight) * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    moved = true;
    if (!running) raf = requestAnimationFrame(draw);
  };
  function draw(now) {
    gl.uniform1f(uTime, ((paused ? frozen : now) - t0) / 1e3);
    gl.uniform2f(uCam, cx * 0.06, cy * 0.05);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    if (!running) return;
    odd = !odd;
    if (moved || odd) draw(now);
    moved = false;
    raf = requestAnimationFrame(loop);
  }
  const start = () => {
    if (visible && !running && !paused) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else running = false;
  });
  io.observe(watch);
  return {
    cam(x, y) {
      if (x !== cx || y !== cy) moved = true;
      cx = x;
      cy = y;
      if (paused) raf = requestAnimationFrame(draw);
    },
    setPaused(next) {
      if (next === paused) return;
      const now = performance.now();
      if (next) {
        frozen = now;
        running = false;
      } else t0 += now - (frozen || now);
      paused = next;
      if (!next) start();
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      canvas.remove();
      host.classList.remove("is-gl");
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  };
}
var DepthPlane = react.forwardRef(function DepthPlane2({ src, alt = "", width, height, className, style, loading = "lazy", hold = false, ...options }, ref) {
  const host = react.useRef(null);
  const plane = react.useRef(null);
  const { reduced, paused } = useMotion();
  const opts = react.useRef(options);
  const stopped = paused || hold;
  const pausedNow = react.useRef(stopped);
  pausedNow.current = stopped;
  react.useImperativeHandle(ref, () => ({ cam: (x, y) => plane.current?.cam(x, y) }), []);
  react.useEffect(() => {
    const el = host.current;
    if (!el || reduced || matchMedia(PHONE).matches) return;
    let dead = false;
    const watch = el.closest("[data-depth-watch], section") ?? el;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        createDepthPlane(el, src, watch, opts.current).then((p) => {
          if (dead) p?.destroy();
          else {
            plane.current = p;
            p?.setPaused(pausedNow.current);
          }
        }).catch((e) => console.warn("depth plane off:", e?.message ?? e));
      },
      { rootMargin: "60% 0px" }
    );
    io.observe(watch);
    return () => {
      dead = true;
      io.disconnect();
      plane.current?.destroy();
      plane.current = null;
    };
  }, [src, reduced]);
  react.useEffect(() => {
    plane.current?.setPaused(stopped);
  }, [stopped]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { ref: host, className: `avl-depth ${className ?? ""}`, style, children: /* @__PURE__ */ jsxRuntime.jsx("img", { src, alt, width, height, loading, fetchPriority: "low" }) });
});

// src/stage/landing.ts
var OWN_KEYS = "a, button, input, select, textarea, [role=listbox]";
function sectionLanding(y, places, { dir: dir2, from, need, pull, back }) {
  if (pull <= 0) return null;
  for (let i = 0; i < places.length - 1; i++) {
    const a = places[i], b = places[i + 1];
    if (y <= a.out || y >= b.in) continue;
    const past = y - a.out, short = b.in - y, gap = b.in - a.out;
    let onward;
    if (dir2 > 0 && from < a.in - 1) onward = past > back * gap;
    else if (dir2 < 0 && from > b.out + 1) onward = short <= back * gap;
    else onward = dir2 > 0 ? past >= need : dir2 < 0 ? short < need : short < past;
    if ((onward ? short : past) > pull * gap) return null;
    if (onward) return { to: b.in, rest: b.in };
    return { to: a.out, rest: dir2 < 0 ? a.back : a.out };
  }
  return null;
}
function sectionStep(y, places, way) {
  if (way > 0) {
    if (places.some((p) => p.free && y >= p.in - 1 && y < p.out - 1)) return null;
    const next = places.find((p) => p.in > y + 1);
    return next ? { to: next.in, rest: next.in } : null;
  }
  if (places.some((p) => p.free && y > p.in + 1 && y <= p.out + 1)) return null;
  for (let i = places.length - 1; i >= 0; i--) if (places[i].back < y - 1) return { to: places[i].out, rest: places[i].back };
  return null;
}
function landingStop(t, moves, dir2, need) {
  if (t < 0 || t > moves) return null;
  const i = Math.floor(t), f = t - i;
  if (dir2 > 0) return f > need ? i + 1 : i;
  if (dir2 < 0) return f < 1 - need ? i : i + 1;
  return Math.round(t);
}
function holdCurve(f, snap) {
  if (f <= 0) return 0;
  if (f >= 1) return 1;
  const a = Math.pow(f, snap);
  return a / (a + Math.pow(1 - f, snap));
}
function holdCurveInverse(k, snap) {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  const r = Math.pow(k / (1 - k), 1 / snap);
  return r / (1 + r);
}
function viewStops(items, view, max) {
  if (max <= 0) return [0];
  const stops = [0];
  for (const { left, width } of items) if (left + width > stops[stops.length - 1] + view + 2) stops.push(left);
  return [0, ...new Set(stops.filter((s) => s > 1 && s < max - 1)), max];
}
function nextStop(stops, x, way) {
  const to = way > 0 ? stops.find((s) => s > x + 2) : [...stops].reverse().find((s) => s < x - 2);
  return to ?? null;
}
function dragLanding(places, x, way) {
  if (way < 0) return [...places].reverse().find((s) => s <= x + 2) ?? places[0];
  return places.find((s) => s >= x - 2) ?? places[places.length - 1];
}
function notchedWheel(deltaMode, wheelDelta, deltaY) {
  const notch = Math.abs(wheelDelta);
  return deltaMode !== 0 || notch >= 120 && notch % 120 === 0 && Math.abs(notch - 3 * Math.abs(deltaY)) >= 1;
}

// src/stage/row.tsx
function itemLefts(row) {
  const pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
  return [...row.children].map((c) => c.offsetLeft - row.offsetLeft - pad);
}
function rowStops(row) {
  const cs = getComputedStyle(row);
  const lefts = itemLefts(row);
  const items = [...row.children].map((c, i) => ({ left: lefts[i], width: c.offsetWidth }));
  return viewStops(items, row.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0), row.scrollWidth - row.clientWidth);
}
function useSideRow(ref, onMove2) {
  const { reduced } = useMotion();
  const [state, setState] = react.useState({ first: 1, last: 1, total: 0, current: 0, atStart: true, atEnd: false });
  const move = react.useRef(onMove2);
  move.current = onMove2;
  react.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let queued2 = false;
    const read = () => {
      queued2 = false;
      const items = [...el.children];
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const left = el.scrollLeft, right = left + el.clientWidth;
      const inView = items.flatMap((c, i) => c.offsetLeft - el.offsetLeft >= left - 2 && c.offsetLeft - el.offsetLeft + c.offsetWidth <= right + 2 ? [i + 1] : []);
      const max = el.scrollWidth - el.clientWidth;
      let current = 0, best = Infinity;
      items.forEach((c, i) => {
        const gap = Math.abs(c.offsetLeft - el.offsetLeft - pad - left);
        if (gap < best) {
          best = gap;
          current = i;
        }
      });
      if (max > 0 && left >= max - 2) current = items.length - 1;
      const next = {
        first: inView[0] ?? current + 1,
        last: inView[inView.length - 1] ?? current + 1,
        total: items.length,
        current,
        atStart: left <= 2,
        atEnd: left >= max - 2
      };
      el.dataset.edge = next.atStart && next.atEnd ? "both" : next.atStart ? "start" : next.atEnd ? "end" : "mid";
      setState((s) => Object.keys(next).every((k) => s[k] === next[k]) ? s : next);
      move.current?.(max > 0 ? Math.min(1, Math.max(0, left / max)) : 0);
    };
    const queue = () => {
      if (queued2) return;
      queued2 = true;
      requestAnimationFrame(read);
    };
    el.addEventListener("scroll", queue, { passive: true });
    const ro = new ResizeObserver(queue);
    ro.observe(el);
    queue();
    let drag = null;
    let swallow = false;
    let free;
    const down = (e) => {
      swallow = false;
      clearTimeout(free);
      if (e.pointerType === "mouse" && e.button === 0) drag = { x: e.clientX, left: el.scrollLeft, moved: 0, snaps: getComputedStyle(el).scrollSnapType !== "none" };
    };
    const over = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved < 6) return;
      swallow = true;
      el.dataset.dragging = "";
      el.scrollLeft = drag.left - dx;
    };
    const up = () => {
      const was = drag;
      drag = null;
      if (!was || el.dataset.dragging == null) return;
      if (!was.snaps) {
        delete el.dataset.dragging;
        return;
      }
      const x = el.scrollLeft, max = el.scrollWidth - el.clientWidth;
      el.dataset.dragging = "landing";
      el.scrollTo({ left: dragLanding(itemLefts(el).map((l) => Math.min(l, max)), x, Math.sign(x - was.left)), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      free = setTimeout(() => delete el.dataset.dragging, 800);
    };
    const click = (e) => {
      if (!swallow) return;
      e.preventDefault();
      e.stopPropagation();
      swallow = false;
    };
    const noDrag = (e) => e.preventDefault();
    el.addEventListener("pointerdown", down);
    addEventListener("pointermove", over);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    el.addEventListener("click", click, true);
    el.addEventListener("dragstart", noDrag);
    return () => {
      ro.disconnect();
      clearTimeout(free);
      el.removeEventListener("scroll", queue);
      el.removeEventListener("pointerdown", down);
      removeEventListener("pointermove", over);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      el.removeEventListener("click", click, true);
      el.removeEventListener("dragstart", noDrag);
    };
  }, [ref]);
  const page = react.useCallback(
    (dir2) => {
      const el = ref.current;
      const to = el && nextStop(rowStops(el), el.scrollLeft, dir2);
      if (el && to != null) el.scrollTo({ left: to, behavior: reduced ? "auto" : "smooth" });
    },
    [ref, reduced]
  );
  const go = react.useCallback(
    (index, instant) => {
      const el = ref.current;
      const left = el && itemLefts(el)[index];
      if (el && left != null) el.scrollTo({ left, behavior: reduced || instant ? "auto" : "smooth" });
    },
    [ref, reduced]
  );
  react.useEffect(() => {
    const onKey2 = (e) => {
      const way = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!way || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.target.closest?.(OWN_KEYS)) return;
      const el = ref.current;
      if (!el || el.scrollWidth - el.clientWidth <= 1) return;
      const r = el.getBoundingClientRect();
      if (r.top > innerHeight / 2 || r.bottom < innerHeight / 2) return;
      e.preventDefault();
      page(way);
    };
    addEventListener("keydown", onKey2);
    return () => removeEventListener("keydown", onKey2);
  }, [ref, page]);
  react.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onFocus = (e) => {
      const t = e.target;
      if (!t.matches(":focus-visible")) return;
      requestAnimationFrame(() => {
        const a = t.getBoundingClientRect(), b = el.getBoundingClientRect();
        if (a.left < b.left - 1 || a.right > b.right + 1) go([...el.children].findIndex((c) => c.contains(t)));
      });
    };
    el.addEventListener("focusin", onFocus);
    return () => el.removeEventListener("focusin", onFocus);
  }, [ref, go]);
  return { ...state, page, go };
}
var tuning = { sectionPull: 1, sectionNudge: 80, sectionGlide: 620, sectionBack: 0.5, wait: 120, hand: 500, snap: 2, commit: 0.14, glide: 420, edge: 0.22 };
var getRunTuning = () => ({ ...tuning });
function setRunTuning(next) {
  Object.assign(tuning, next);
  runs.forEach((r) => r.measure());
}
var runs = /* @__PURE__ */ new Set();
var KEY_DIR = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
var easeOut = (x) => 1 - Math.pow(1 - x, 3);
var soft = (x) => x * x * (6 - 8 * x + 3 * x * x);
var lastY = 0;
var dir = 0;
var keyed = false;
var notched = false;
var held = false;
var tripFrom = null;
var idle;
var glide = 0;
var glideY = 0;
var glideTarget = 0;
var handAt = -Infinity;
var sections = [];
var stopGlide = () => {
  cancelAnimationFrame(glide);
  glide = 0;
};
var handOnPage = () => performance.now() - handAt < 150;
function glideTo(to, ms, ease, rest = to) {
  stopGlide();
  clearTimeout(idle);
  glideTarget = rest;
  const from = scrollY;
  glideY = from;
  let start = 0;
  const tick = (now) => {
    start || (start = now);
    const k = Math.min(1, (now - start) / ms);
    glideY = k < 1 ? from + (to - from) * ease(k) : rest;
    scrollTo({ top: glideY, behavior: "instant" });
    glide = k < 1 ? requestAnimationFrame(tick) : 0;
  };
  glide = requestAnimationFrame(tick);
}
var glideStop = (to, move) => glideTo(to, Math.min(tuning.glide, Math.max(160, tuning.glide * Math.sqrt(Math.abs(to - scrollY) / Math.max(1, move)))), easeOut);
var glideSection = ({ to, rest }) => glideTo(to, Math.max(200, tuning.sectionGlide * Math.sqrt(Math.abs(to - scrollY) / innerHeight)), soft, rest);
function readPlaces() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return sections.flatMap((id) => {
    const el = document.getElementById(id);
    if (!el) return [];
    const top = Math.round(el.getBoundingClientRect().top + scrollY);
    const out = Math.min(max, top + Math.max(0, el.offsetHeight - innerHeight));
    const run = [...runs].find((r) => r.host === el);
    return [{ in: Math.min(max, top), out, back: run ? run.lastStop() : out, free: !run && out > top + 1 }];
  });
}
function settle() {
  if (held) return;
  const y = scrollY, from = tripFrom ?? y;
  tripFrom = null;
  if (keyed && document.activeElement && document.activeElement !== document.body) return;
  for (const run of runs) {
    const to = run.landing(y, dir, notched);
    if (to == null) continue;
    if (Math.abs(to - y) >= 1) glideStop(to, run.move());
    return;
  }
  const land = sectionLanding(y, readPlaces(), { dir, from, need: notched ? 1 : tuning.sectionNudge, pull: tuning.sectionPull, back: tuning.sectionBack });
  if (land && Math.abs(land.to - y) >= 1) glideSection(land);
}
var arm = (ms = tuning.wait) => {
  clearTimeout(idle);
  idle = setTimeout(settle, ms);
};
var stillness = () => notched ? tuning.wait : "onscrollend" in window ? tuning.wait * 6 : tuning.wait * 2.5;
var onScrollEnd = () => {
  if (!glide) arm();
};
var onScroll = () => {
  const y = scrollY;
  if (glide) {
    if (Math.abs(y - glideY) <= 3) {
      lastY = y;
      return;
    }
    stopGlide();
  }
  tripFrom ?? (tripFrom = lastY);
  if (y !== lastY) dir = Math.sign(y - lastY);
  lastY = y;
  arm(stillness());
};
var onWheel = (e) => {
  notched = notchedWheel(e.deltaMode, e.wheelDeltaY, e.deltaY);
  keyed = false;
  if (e.shiftKey || Math.abs(e.deltaY) < 2 || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
  handAt = performance.now();
  if (!glide) return;
  stopGlide();
  arm(stillness());
};
var onPress = () => {
  keyed = false;
  stopGlide();
};
var onDown = () => {
  held = true;
  onPress();
};
var onUp = () => {
  held = false;
  onScrollEnd();
};
var onMove = (e) => {
  if (held && !e.buttons) onUp();
};
var onKey = (e) => {
  notched = false;
  keyed = true;
  const way = e.shiftKey && e.key === " " ? -1 : KEY_DIR[e.key];
  if (!way || e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.(OWN_KEYS)) return;
  const from = glide ? glideTarget : scrollY;
  for (const run of runs) {
    const to = run.next(from, way);
    if (to == null) continue;
    e.preventDefault();
    glideStop(to, run.move());
    return;
  }
  const step = tuning.sectionPull > 0 ? sectionStep(from, readPlaces(), way) : null;
  if (!step) return;
  e.preventDefault();
  glideSection(step);
};
var onResize = () => {
  dir = 0;
  arm(stillness());
};
var listen = (on) => {
  const set = on ? addEventListener : removeEventListener;
  set("scroll", onScroll, { passive: true });
  set("scrollend", onScrollEnd, { passive: true });
  set("wheel", onWheel, { passive: true });
  set("touchstart", onPress, { passive: true });
  set("pointerdown", onDown, { passive: true });
  set("pointerup", onUp, { passive: true });
  set("pointercancel", onUp, { passive: true });
  set("pointermove", onMove, { passive: true });
  set("keydown", onKey);
  set("resize", onResize);
  if (on) {
    lastY = scrollY;
    onResize();
  } else {
    clearTimeout(idle);
    stopGlide();
    held = false;
    tripFrom = null;
  }
};
var users = 0;
var join = () => {
  if (users++ === 0) listen(true);
  return () => {
    if (--users === 0) listen(false);
  };
};
function addRun(run) {
  runs.add(run);
  const leave = join();
  return () => {
    runs.delete(run);
    leave();
  };
}
function useSnapOn() {
  const [on, setOn] = react.useState(false);
  react.useEffect(() => {
    const html = document.documentElement;
    const read = () => setOn(html.classList.contains("avl-snap"));
    read();
    const watch = new MutationObserver(read);
    watch.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => watch.disconnect();
  }, []);
  return on;
}
function useSectionSnap(ids) {
  const on = useSnapOn();
  react.useEffect(() => {
    if (!on) return;
    sections = ids;
    const leave = join();
    return () => {
      leave();
      sections = [];
    };
  }, [on, ids]);
}

// src/stage/run.ts
function useRowRun(host, row) {
  const on = useSnapOn();
  const live = react.useRef({ stops: [0], per: 0 });
  const stopOf = react.useCallback(
    (index) => {
      const r = row.current, stops = live.current.stops;
      const left = r ? itemLefts(r)[index] : void 0;
      if (left == null) return 0;
      let k = 0;
      while (k < stops.length - 1 && stops[k + 1] <= left + 1) k++;
      return k;
    },
    [row]
  );
  react.useEffect(() => {
    const h = host.current, r = row.current;
    if (!on || !h || !r) return;
    const at = live.current;
    let tail = 0, painted = NaN, wrote = -1, rowLeads = 0;
    const top = () => Math.round(h.getBoundingClientRect().top + scrollY);
    const moves = () => at.stops.length - 1;
    const xAt = (t) => {
      const i = Math.min(Math.floor(t), Math.max(0, moves() - 1));
      const a = at.stops[i], b = at.stops[i + 1] ?? a;
      return a + (b - a) * holdCurve(t - i, tuning.snap);
    };
    const stopsAt = (x) => {
      let i = 0;
      while (i < moves() - 1 && x > at.stops[i + 1]) i++;
      const a = at.stops[i], b = at.stops[i + 1] ?? a;
      return i + (b > a ? holdCurveInverse((x - a) / (b - a), tuning.snap) : 0);
    };
    const follow = () => {
      const x = r.scrollLeft;
      if (!at.per || Math.abs(x - wrote) < 2) return false;
      if (handOnPage()) {
        r.scrollLeft = wrote;
        return false;
      }
      rowLeads = performance.now() + 120;
      wrote = x;
      painted = NaN;
      stopGlide();
      scrollTo({ top: top() + stopsAt(x) * at.per, behavior: "instant" });
      return true;
    };
    const paint = () => {
      if (!at.per) return;
      if (performance.now() < rowLeads && !handOnPage()) {
        requestStageFrame();
        return;
      }
      if (follow()) return;
      const t = Math.min(moves(), Math.max(0, (scrollY - top()) / at.per));
      if (t === painted) return;
      painted = t;
      wrote = xAt(t);
      r.scrollLeft = wrote;
    };
    const self = {
      host: h,
      measure() {
        at.stops = rowStops(r);
        at.per = Math.round(tuning.hand);
        tail = Math.round(innerHeight * tuning.edge);
        h.style.setProperty("--avl-run", `${moves() ? moves() * at.per + tail : 0}px`);
        wrote = r.scrollLeft;
        painted = NaN;
        requestStageFrame();
      },
      landing(y, dir2, notched2) {
        if (!moves()) return null;
        const a = top();
        if (y < a || y >= a + moves() * at.per) return null;
        const k = landingStop((y - a) / at.per, moves(), dir2, notched2 ? 1e-3 : tuning.commit);
        return k == null ? null : a + k * at.per;
      },
      next(from, way) {
        if (!moves()) return null;
        const a = top();
        if (from < a - 1 || from > a + moves() * at.per + tail) return null;
        const t = (from - a) / at.per;
        const k = way > 0 ? Math.floor(t + 0.01) + 1 : Math.ceil(t - 0.01) - 1;
        return k < 0 || k > moves() ? null : a + k * at.per;
      },
      move: () => at.per,
      lastStop: () => top() + moves() * at.per
    };
    const leave = addRun(self);
    const stopPainting = onStageFrame(paint);
    r.addEventListener("scroll", follow, { passive: true });
    const ro = new ResizeObserver(() => self.measure());
    ro.observe(r);
    addEventListener("resize", self.measure);
    let gone = false;
    document.fonts?.ready.then(() => gone || self.measure());
    self.measure();
    return () => {
      gone = true;
      leave();
      stopPainting();
      r.removeEventListener("scroll", follow);
      ro.disconnect();
      removeEventListener("resize", self.measure);
      h.style.removeProperty("--avl-run");
      at.per = 0;
      at.stops = [0];
    };
  }, [on, host, row]);
  const placeOf = react.useCallback((index) => live.current.per ? stopOf(index) * live.current.per : 0, [stopOf]);
  const step = react.useCallback(
    (dir2) => {
      const r = row.current;
      const to = r && on && live.current.per ? nextStop(live.current.stops, r.scrollLeft, dir2) : null;
      if (r && to != null) r.scrollTo({ left: to, behavior: "smooth" });
    },
    [on, row]
  );
  return { on, placeOf, step };
}
function useActiveSection(ids) {
  const [current, setCurrent] = react.useState(0);
  const key = ids.join(" ");
  react.useEffect(() => {
    const list = key.split(" ");
    return onStageFrame(() => {
      const mid = innerHeight * 0.45;
      let cur = 0;
      list.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < mid) cur = i;
      });
      setCurrent(cur);
    });
  }, [key]);
  return current;
}
function SiteBar({ brand, links, pastId, active, action, menuEnd }) {
  const bar = react.useRef(null);
  const menuBtn = react.useRef(null);
  const menu = react.useRef(null);
  const [past, setPast] = react.useState(false);
  const [focused, setFocused] = react.useState(false);
  const [open, setOpen] = react.useState(false);
  react.useEffect(
    () => onStageFrame(() => {
      const hero = pastId ? document.getElementById(pastId) : null;
      setPast(!hero || hero.getBoundingClientRect().bottom <= 0);
    }),
    [pastId]
  );
  const close = react.useCallback((refocus) => {
    setOpen(false);
    if (refocus) menuBtn.current?.focus();
  }, []);
  react.useEffect(() => {
    if (!open) return;
    const outside = [...document.querySelectorAll("main, .avl-rail, .avl-motion, .avl-bar-brand, .avl-bar-action")].filter((el) => !menu.current?.contains(el));
    outside.forEach((el) => el.inert = true);
    menu.current?.querySelector("a, button")?.focus();
    const onKey2 = (e) => {
      if (e.key === "Escape") close(true);
      if (e.key !== "Tab" || !menu.current || !menuBtn.current) return;
      const loop = [...menu.current.querySelectorAll("a, button"), menuBtn.current];
      const i = loop.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        menuBtn.current.focus();
      } else if (!e.shiftKey && i === loop.length - 1) {
        e.preventDefault();
        loop[0].focus();
      }
    };
    const onResize2 = () => {
      if (!matchMedia("(max-width: 1100px)").matches) close();
    };
    addEventListener("keydown", onKey2);
    addEventListener("resize", onResize2);
    return () => {
      outside.forEach((el) => el.inert = false);
      removeEventListener("keydown", onKey2);
      removeEventListener("resize", onResize2);
    };
  }, [open, close]);
  const shown = past || focused || open;
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "header",
      {
        ref: bar,
        className: "avl-bar",
        "data-shown": shown || void 0,
        onFocus: () => setFocused(true),
        onBlur: (e) => {
          if (!bar.current?.contains(e.relatedTarget)) setFocused(false);
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "avl-bar-brand", children: brand }),
          /* @__PURE__ */ jsxRuntime.jsx("nav", { className: "avl-bar-links", "aria-label": "Sections", children: links.map((l) => /* @__PURE__ */ jsxRuntime.jsx("a", { href: `#${l.id}`, "aria-current": active === l.id ? "true" : void 0, children: l.label }, l.id)) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "avl-bar-end", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "avl-bar-action", children: action }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "avl-bar-slot avl-bar-slot-menu", "aria-hidden": "true" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "avl-bar-slot", "aria-hidden": "true" })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        ref: menuBtn,
        type: "button",
        className: "avl-bar-menu",
        "aria-expanded": open,
        "aria-controls": "avl-menu",
        "aria-label": open ? "Close the menu" : "Open the menu",
        onClick: () => setOpen((o) => !o),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("i", {}),
          /* @__PURE__ */ jsxRuntime.jsx("i", {})
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { ref: menu, id: "avl-menu", className: "avl-menu", role: "dialog", "aria-modal": "true", "aria-label": "Sections", hidden: !open, children: [
      links.map((l) => /* @__PURE__ */ jsxRuntime.jsxs("a", { href: `#${l.id}`, onClick: () => close(), children: [
        l.no && /* @__PURE__ */ jsxRuntime.jsx("b", { children: l.no }),
        l.label
      ] }, l.id)),
      menuEnd
    ] })
  ] });
}
function SectionRail({ sections: sections2, current }) {
  return /* @__PURE__ */ jsxRuntime.jsxs("nav", { className: "avl-rail", "aria-label": "Jump to a section", children: [
    /* @__PURE__ */ jsxRuntime.jsx("ol", { children: sections2.map((s, i) => /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("a", { href: `#${s.id}`, "aria-current": i === current ? "true" : void 0, children: [
      /* @__PURE__ */ jsxRuntime.jsx("i", {}),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: s.label })
    ] }) }, s.id)) }),
    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "avl-rail-label", "aria-hidden": "true", children: sections2[current]?.label })
  ] });
}
function colophonRows(c) {
  const n = (v) => v.toLocaleString("en");
  return [
    { label: "Tokens", value: `${n(c.tokens)}, with the first message` },
    { label: "Description", value: `${n(c.desc)} words` },
    { label: "First message", value: `${n(c.first)} words` },
    { label: "Greetings", value: `${c.alts + 1}` },
    { label: "Lorebook", value: c.book ? `Yes, ${c.book} entries` : "No" },
    ...c.warn.length ? [{ label: "Warnings", value: c.warn.join(", ") }] : [],
    ...c.tags.length ? [{ label: "Tags", value: c.tags.join(", ") }] : [],
    { label: "Card", value: `${c.spec} PNG, ${(c.bytes / 1048576).toFixed(1)} MB` }
  ];
}
function PlatformLinks({ links }) {
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: links.map((l) => /* @__PURE__ */ jsxRuntime.jsx("a", { className: "avl-plat", href: l.url, target: "_blank", rel: "noopener", children: l.platform }, l.url)) });
}
function DownloadIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M12 4v11M7 10l5 5 5-5M5 20h14" }) });
}
function TurnIcon() {
  return /* @__PURE__ */ jsxRuntime.jsx("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" }) });
}
function CardBack({ id, name, maker, colophon, href, turned, color, headingRef, children }) {
  const rows = colophon ? colophonRows(colophon) : [{ label: "Card", value: "A character card PNG" }];
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      id,
      className: "avl-card-back",
      "aria-hidden": !turned,
      inert: !turned,
      style: color ? { "--avl-card": color } : void 0,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("h4", { className: "avl-card-name", ref: headingRef, tabIndex: -1, children: name }),
        /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "avl-card-by", children: [
          "Made by ",
          maker
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("dl", { className: "avl-card-rows", children: rows.map((r) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("dt", { children: r.label }),
          /* @__PURE__ */ jsxRuntime.jsx("dd", { children: r.value })
        ] }, r.label)) }),
        (href || children) && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "avl-card-actions", children: [
          href && /* @__PURE__ */ jsxRuntime.jsxs("a", { className: "avl-solid", href, download: true, children: [
            /* @__PURE__ */ jsxRuntime.jsx(DownloadIcon, {}),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Download card" })
          ] }),
          children
        ] })
      ]
    }
  );
}

exports.CardBack = CardBack;
exports.DepthPlane = DepthPlane;
exports.DownloadIcon = DownloadIcon;
exports.MistBand = MistBand;
exports.MotionProvider = MotionProvider;
exports.MotionToggle = MotionToggle;
exports.PHONE = PHONE;
exports.ParallaxPlane = ParallaxPlane;
exports.PlatformLinks = PlatformLinks;
exports.Reveal = Reveal;
exports.SectionRail = SectionRail;
exports.SiteBar = SiteBar;
exports.SplitText = SplitText;
exports.TurnIcon = TurnIcon;
exports.fitWidth = fitWidth;
exports.getRunTuning = getRunTuning;
exports.jumpTo = jumpTo;
exports.onStageFrame = onStageFrame;
exports.requestStageFrame = requestStageFrame;
exports.setRunTuning = setRunTuning;
exports.useActiveSection = useActiveSection;
exports.useFitWidth = useFitWidth;
exports.useInView = useInView;
exports.useMedia = useMedia;
exports.useMotion = useMotion;
exports.useRowRun = useRowRun;
exports.useSectionSnap = useSectionSnap;
exports.useSideRow = useSideRow;
exports.viewportProgress = viewportProgress;
//# sourceMappingURL=stage.cjs.map
//# sourceMappingURL=stage.cjs.map