'use strict';

var clsx = require('clsx');
var tailwindMerge = require('tailwind-merge');

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
var pastelNightmaresTheme = {
  primary: "oklch(0.78 0.06 310)",
  // dusty lavender
  accent: "oklch(0.86 0.05 165)",
  // soft mint
  ring: "oklch(0.78 0.06 310)",
  // lavender (TBD: off-key candidate)
  card: "oklch(0.97 0.012 75)",
  // brighter paper (polaroids)
  border: "oklch(0.85 0.025 75)",
  // tea-stained edge
  glow: "oklch(0.78 0.10 350)",
  // rose halo (raised chroma to read on cream)
  textGlow: "oklch(0.78 0.10 350)",
  // rose (TBD: off-key candidate)
  particle: "oklch(0.78 0.12 350)",
  // dusty rose — visible on cream + taupe
  particleGlow: "oklch(0.82 0.08 340)",
  mist: "oklch(0.72 0.10 310)",
  // saturated lavender mist
  fireflyCore: "oklch(0.82 0.13 350)",
  // bright dusty rose firefly (TBD: off-key)
  fireflyGlow: "oklch(0.78 0.10 340)",
  bgImage: "/images/pastel-nightmares-bg.webp",
  bgGradient: "linear-gradient(to bottom, oklch(0.94 0.018 75) 0%, oklch(0.92 0.025 350 / 0.6) 30%, oklch(0.94 0.018 75) 70%, oklch(0.94 0.018 75) 100%)"
};
var deepwoodTheme = {
  primary: "oklch(0.62 0.11 50)",
  // rusted iron
  accent: "oklch(0.75 0.08 55)",
  // iron-soft
  ring: "oklch(0.62 0.11 50)",
  card: "oklch(0.12 0.018 150)",
  // forest card (base)
  border: "oklch(0.42 0.09 45)",
  // iron-deep
  glow: "oklch(0.65 0.13 50)",
  // iron glow
  textGlow: "oklch(0.75 0.08 55)",
  particle: "oklch(0.85 0.10 60)",
  // warm dust mote
  particleGlow: "oklch(0.65 0.13 50)",
  mist: "oklch(0.70 0.08 145)",
  // forest mist (greenish, cool)
  fireflyCore: "oklch(0.92 0.14 80)",
  // warm firefly, hotter than house teal
  fireflyGlow: "oklch(0.75 0.12 65)",
  bgImage: "/images/deep-woods.webp",
  bgGradient: "linear-gradient(180deg, oklch(0.10 0.018 150 / 0.85) 0%, oklch(0.08 0.015 150 / 0.92) 100%)"
};
var themePresets = {
  launch: launchTheme,
  valentines: valentinesTheme,
  pastelNightmares: pastelNightmaresTheme,
  deepwood: deepwoodTheme
};

exports.cn = cn;
exports.countEventCharacters = countEventCharacters;
exports.deepwoodTheme = deepwoodTheme;
exports.getEventCharacters = getEventCharacters;
exports.getEventPreviewImages = getEventPreviewImages;
exports.launchTheme = launchTheme;
exports.pastelNightmaresTheme = pastelNightmaresTheme;
exports.themePresets = themePresets;
exports.valentinesTheme = valentinesTheme;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map