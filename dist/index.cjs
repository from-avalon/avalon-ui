'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');
var react = require('react');
var Image = require('next/image');
var lucideReact = require('lucide-react');
var jsxRuntime = require('react/jsx-runtime');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Image__default = /*#__PURE__*/_interopDefault(Image);

// src/utils.ts
function cn(...inputs) {
  return tailwindMerge.twMerge(clsx.clsx(inputs));
}
function getEventCharacters(data) {
  const characters = [];
  for (const author of data.authors) {
    for (const series of author.series) {
      for (const char of series.characters) {
        characters.push({ ...char, maker: author.name });
      }
    }
  }
  return characters;
}
function countEventCharacters(data) {
  return data.authors.reduce(
    (total, author) => total + author.series.reduce((s, series) => s + series.characters.length, 0),
    0
  );
}
function getEventPreviewImages(data, max = 4) {
  const images = [];
  for (const author of data.authors) {
    for (const series of author.series) {
      for (const char of series.characters) {
        if (images.length < max) images.push(char.image);
      }
    }
  }
  return images;
}

// src/theme/presets.ts
var launchTheme = {
  primary: "oklch(0.72 0.08 175)",
  accent: "oklch(0.68 0.07 175)",
  ring: "oklch(0.68 0.07 175)",
  card: "oklch(0.12 0.018 150)",
  border: "oklch(0.28 0.025 150)",
  glow: "oklch(0.65 0.1 175)",
  textGlow: "oklch(0.72 0.08 175)",
  particle: "oklch(0.85 0.1 180)",
  particleGlow: "oklch(0.70 0.10 180)",
  mist: "oklch(0.7 0.08 145)",
  fireflyCore: "oklch(0.9 0.15 150)",
  fireflyGlow: "oklch(0.8 0.12 150)",
  bgImage: "/images/launch-bg.webp",
  bgGradient: "linear-gradient(to bottom, oklch(0.1 0.015 150 / 0.85) 0%, oklch(0.12 0.02 145 / 0.8) 30%, oklch(0.1 0.015 150 / 0.85) 70%, oklch(0.08 0.015 150 / 0.9) 100%)"
};
var valentinesTheme = {
  primary: "oklch(0.72 0.12 10)",
  accent: "oklch(0.65 0.14 355)",
  ring: "oklch(0.65 0.14 355)",
  card: "oklch(0.12 0.02 350)",
  border: "oklch(0.28 0.03 350)",
  glow: "oklch(0.60 0.15 355)",
  textGlow: "oklch(0.72 0.12 10)",
  particle: "oklch(0.82 0.12 10)",
  particleGlow: "oklch(0.65 0.14 355)",
  mist: "oklch(0.65 0.10 350)",
  fireflyCore: "oklch(0.88 0.14 10)",
  fireflyGlow: "oklch(0.75 0.12 355)",
  bgImage: "/images/valentines-bg.webp",
  bgGradient: "linear-gradient(to bottom, oklch(0.1 0.02 350 / 0.85) 0%, oklch(0.12 0.025 355 / 0.8) 30%, oklch(0.1 0.02 350 / 0.85) 70%, oklch(0.08 0.02 350 / 0.9) 100%)"
};
var themePresets = {
  launch: launchTheme,
  valentines: valentinesTheme
};
function CharacterCard({ character, index, isVisible }) {
  const [isHovered, setIsHovered] = react.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `group relative w-full transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`,
      style: {
        transitionDelay: `${index * 80}ms`,
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)"
      },
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: `absolute -inset-1 rounded-xl transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`,
            style: {
              background: `radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--event-glow, oklch(0.65 0.1 175)) 30%, transparent) 0%, transparent 70%)`,
              filter: "blur(12px)"
            }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: "relative bg-card/90 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:bg-card/95",
            style: { WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" },
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative h-72 sm:h-80 overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  Image__default.default,
                  {
                    src: character.image || "/placeholder.svg",
                    alt: character.name,
                    fill: true,
                    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
                    className: "object-cover object-[center_15%] transition-all duration-700 group-hover:scale-110",
                    loading: "lazy",
                    quality: 85
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: `absolute inset-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`,
                    style: {
                      background: `linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, transparent 50%, color-mix(in oklch, var(--event-glow, oklch(0.65 0.1 175)) 10%, transparent) 100%)`
                    }
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative p-5 sm:p-6 -mt-8", children: [
                /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-serif text-xl sm:text-2xl tracking-wide text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 text-readable", children: character.name }),
                /* @__PURE__ */ jsxRuntime.jsxs("p", { className: "text-sm tracking-wider text-primary/70 mb-3", children: [
                  "by ",
                  character.maker
                ] }),
                character.subtitle && /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-sm italic text-foreground/50 mb-3 line-clamp-2", children: character.subtitle }),
                /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-base text-foreground/70 leading-relaxed mb-5 line-clamp-3", children: character.description }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                  character.links.map((link) => /* @__PURE__ */ jsxRuntime.jsxs(
                    "a",
                    {
                      href: link.url,
                      target: "_blank",
                      rel: "noopener noreferrer",
                      className: "inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-foreground/80 hover:text-primary border border-border/50 hover:border-primary/50 rounded-full transition-all duration-300 hover:bg-primary/5",
                      children: [
                        link.platform,
                        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { className: "w-3.5 h-3.5" })
                      ]
                    },
                    link.url
                  )),
                  character.cardFile && /* @__PURE__ */ jsxRuntime.jsxs(
                    "a",
                    {
                      href: `/cards/${character.cardFile}`,
                      download: character.cardFile,
                      className: "inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-primary border border-primary/50 hover:border-primary rounded-full transition-all duration-300 hover:bg-primary/10 ml-auto",
                      children: [
                        /* @__PURE__ */ jsxRuntime.jsx(lucideReact.Download, { className: "w-3.5 h-3.5" }),
                        "Download"
                      ]
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ]
    }
  );
}
function FeaturedCreator({ creator, index, isVisible }) {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `group relative flex flex-col items-center text-center transition-all duration-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`,
      style: { transitionDelay: `${index * 100}ms` },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute -inset-4 rounded-full transition-all duration-500 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
              style: {
                background: `radial-gradient(circle, oklch(0.65 0.1 175 / 0.2) 0%, oklch(0.55 0.12 180 / 0.1) 40%, transparent 70%)`,
                filter: "blur(8px)"
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute -inset-2 rounded-full border transition-all duration-500 border-transparent scale-100 group-hover:border-primary/40 group-hover:scale-110" }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-all duration-500 shadow-lg", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Image__default.default,
              {
                src: creator.image || "/placeholder.svg",
                alt: creator.name,
                fill: true,
                sizes: "(max-width: 768px) 144px, 176px",
                className: "object-cover object-top transition-all duration-700 group-hover:scale-110"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "div",
              {
                className: "absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                style: {
                  background: `linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, transparent 50%, oklch(0.65 0.1 175 / 0.1) 100%)`
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary transition-all duration-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100",
              style: { boxShadow: `0 0 10px 3px oklch(0.65 0.1 175 / 0.5)` }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("h3", { className: "font-serif text-xl md:text-2xl tracking-wider text-foreground mb-5 group-hover:text-primary transition-all duration-300 group-hover:text-glow-subtle text-readable", children: creator.name }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-wrap justify-center items-start gap-3", children: creator.links.map((link) => /* @__PURE__ */ jsxRuntime.jsxs(
          "a",
          {
            href: link.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-foreground/80 hover:text-primary border border-border/50 hover:border-primary/50 rounded-full transition-all duration-300 hover:bg-primary/5 hover:shadow-[0_0_15px_2px_oklch(0.65_0.1_175_/_0.15)] backdrop-blur-sm",
            children: [
              link.label,
              /* @__PURE__ */ jsxRuntime.jsx(lucideReact.ExternalLink, { className: "w-3.5 h-3.5" })
            ]
          },
          link.label
        )) })
      ]
    }
  );
}
function Fireflies({
  coreColor = "oklch(0.9 0.15 150)",
  glowColor = "oklch(0.8 0.12 150)",
  count = 20
}) {
  const [fireflies, setFireflies] = react.useState([]);
  react.useEffect(() => {
    const flies = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 10,
      duration: Math.random() * 6 + 6
    }));
    setFireflies(flies);
  }, [count]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 z-10 pointer-events-none overflow-hidden", children: fireflies.map((fly) => /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: "absolute animate-firefly",
      style: {
        left: `${fly.x}%`,
        top: `${fly.y}%`,
        width: fly.size,
        height: fly.size,
        animationDelay: `${fly.delay}s`,
        animationDuration: `${fly.duration}s`
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: "w-full h-full rounded-full",
          style: {
            background: `radial-gradient(circle, ${coreColor} 0%, ${glowColor.replace(")", " / 0.8)")} 40%, transparent 70%)`,
            boxShadow: `0 0 ${fly.size * 3}px ${fly.size}px ${glowColor.replace(")", " / 0.6)")}`
          }
        }
      )
    },
    fly.id
  )) });
}
function FloatingParticles({
  coreColor = "oklch(0.85 0.1 180)",
  glowColor = "oklch(0.70 0.10 180)",
  count = 60
}) {
  const [particles, setParticles] = react.useState([]);
  const [mousePos, setMousePos] = react.useState({ x: 0, y: 0 });
  const containerRef = react.useRef(null);
  react.useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
      brightness: Math.random() * 0.5 + 0.5
    }));
    setParticles(generated);
  }, [count]);
  const handleMouseMove = react.useCallback((e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width * 100,
        y: (e.clientY - rect.top) / rect.height * 100
      });
    }
  }, []);
  react.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { ref: containerRef, className: "fixed inset-0 pointer-events-none z-10 overflow-hidden", children: particles.map((particle) => {
    const dx = mousePos.x - particle.baseX;
    const dy = mousePos.y - particle.baseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = 30;
    const influence = Math.max(0, 1 - distance / maxDistance) * 0.3;
    const offsetX = dx * influence;
    const offsetY = dy * influence;
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "absolute rounded-full animate-float",
        style: {
          left: `calc(${particle.baseX}% + ${offsetX}px)`,
          top: `calc(${particle.baseY}% + ${offsetY}px)`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
          background: `radial-gradient(circle, ${coreColor.replace(")", ` / ${particle.brightness})`)} 0%, ${coreColor.replace(")", ` / ${particle.brightness * 0.5})`)} 50%, transparent 100%)`,
          boxShadow: `0 0 ${particle.size * 3}px ${particle.size}px ${glowColor.replace(")", ` / ${particle.brightness * 0.4})`)}`,
          transition: "left 0.3s ease-out, top 0.3s ease-out"
        }
      },
      particle.id
    );
  }) });
}
function MistLayers({ color = "oklch(0.7 0.08 145)", count = 4 }) {
  const [layers, setLayers] = react.useState([]);
  react.useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 30 + Math.random() * 20,
      opacity: 0.015 + Math.random() * 0.025,
      reverse: i % 2 === 0
    }));
    setLayers(generated);
  }, [count]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-0 pointer-events-none z-[5] overflow-hidden", children: layers.map((layer) => /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: `absolute w-[200%] h-24 ${layer.reverse ? "animate-mist-reverse" : "animate-mist"}`,
      style: {
        top: `${layer.y}%`,
        animationDelay: `${layer.delay}s`,
        animationDuration: `${layer.duration}s`,
        opacity: layer.opacity,
        background: `linear-gradient(90deg, transparent, ${color.replace(")", " / 0.3)")}, ${color.replace(")", " / 0.25)")}, transparent)`,
        filter: "blur(50px)"
      }
    },
    layer.id
  )) });
}

exports.CharacterCard = CharacterCard;
exports.FeaturedCreator = FeaturedCreator;
exports.Fireflies = Fireflies;
exports.FloatingParticles = FloatingParticles;
exports.MistLayers = MistLayers;
exports.cn = cn;
exports.countEventCharacters = countEventCharacters;
exports.getEventCharacters = getEventCharacters;
exports.getEventPreviewImages = getEventPreviewImages;
exports.launchTheme = launchTheme;
exports.themePresets = themePresets;
exports.valentinesTheme = valentinesTheme;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map