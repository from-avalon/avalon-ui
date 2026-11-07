/* World art with real depth. One small WebGL pass per painting: a smooth procedural depth (a floor ramping to the
   viewer, trees framing the sides, a canopy overhead) warps the art as the camera moves, a mist band hangs at mid depth
   and a few motes drift in front. No cut lines, so nothing tears. The <img> underneath stays as the fallback. */

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`
const FRAG = `
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
}`

type Rgb = [number, number, number]

export interface DepthOptions {
  /** The procedural relief, each 0 to 1: where the horizon sits, and how far the floor, the sides and the canopy come forward. */
  shape?: { horizon: number; floor: number; sides: number; canopy: number }
  mist?: { color: Rgb; amount: number }
  /** Colour of the drifting motes; leave out for none. */
  motes?: Rgb
  zoom?: number
  anchor?: [number, number]
  bright?: number
  /** Render resolution. These sit behind copy, dimmed and misted, so they render under screen size. */
  scale?: number
}

export interface DepthHandle {
  cam(x: number, y: number): void
  setPaused(paused: boolean): void
  destroy(): void
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

/** host holds the <img>; watch is the element whose visibility runs the loop, since the host may overhang it. */
export async function createDepthPlane(host: HTMLElement, src: string, watch: Element, options: DepthOptions): Promise<DepthHandle | null> {
  const canvas = document.createElement("canvas")
  canvas.setAttribute("aria-hidden", "true")
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" })
  if (!gl) return null
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, source)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader")
    return s
  }
  const prog = gl.createProgram()!
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  gl.useProgram(prog)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const loc = gl.getAttribLocation(prog, "p")
  gl.enableVertexAttribArray(loc)
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
  const u = (name: string) => gl.getUniformLocation(prog, name)
  const uRes = u("uRes"), uCam = u("uCam"), uTime = u("uTime")

  const image = await loadImage(src)
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.uniform2f(u("uImg"), image.naturalWidth, image.naturalHeight)
  const { horizon, floor, sides, canopy } = options.shape ?? { horizon: 0.6, floor: 0.8, sides: 0.4, canopy: 0.2 }
  const mist = options.mist ?? { color: [0.6, 0.8, 0.8], amount: 0.5 }
  gl.uniform4f(u("uShape"), horizon, floor, sides, canopy)
  gl.uniform4f(u("uMist"), ...mist.color, mist.amount)
  gl.uniform3f(u("uMote"), ...(options.motes ?? [0, 0, 0]))
  gl.uniform2f(u("uAnchor"), ...(options.anchor ?? [0.5, 0.5]))
  gl.uniform1f(u("uZoom"), options.zoom ?? 1.1)
  gl.uniform1f(u("uBright"), options.bright ?? 1)
  host.appendChild(canvas)
  host.classList.add("is-gl")

  const dpr = Math.min(window.devicePixelRatio || 1, 1) * (options.scale ?? 0.6)
  let cx = 0, cy = 0, running = false, visible = false, paused = false, moved = true, odd = false, frozen = 0, raf = 0
  let t0 = performance.now()

  const resize = () => {
    canvas.width = Math.round(Math.max(1, canvas.clientWidth) * dpr)
    canvas.height = Math.round(Math.max(1, canvas.clientHeight) * dpr)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.uniform2f(uRes, canvas.width, canvas.height)
    moved = true
    if (!running) raf = requestAnimationFrame(draw)
  }
  function draw(now: number) {
    gl!.uniform1f(uTime, ((paused ? frozen : now) - t0) / 1000)
    gl!.uniform2f(uCam, cx * 0.06, cy * 0.05)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }
  // full rate while the camera moves; the mist alone only needs every other frame
  function loop(now: number) {
    if (!running) return
    odd = !odd
    if (moved || odd) draw(now)
    moved = false
    raf = requestAnimationFrame(loop)
  }
  const start = () => {
    if (visible && !running && !paused) {
      running = true
      raf = requestAnimationFrame(loop)
    }
  }
  const ro = new ResizeObserver(resize)
  ro.observe(canvas)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) start()
    else running = false
  })
  io.observe(watch)

  return {
    cam(x, y) {
      if (x !== cx || y !== cy) moved = true
      cx = x
      cy = y
      if (paused) raf = requestAnimationFrame(draw)
    },
    setPaused(next) {
      if (next === paused) return
      const now = performance.now()
      if (next) {
        frozen = now
        running = false
      } else t0 += now - (frozen || now)
      paused = next
      if (!next) start()
    },
    destroy() {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.remove()
      host.classList.remove("is-gl")
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    },
  }
}
