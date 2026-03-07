"use client"

import { useState } from "react"
import Image from "next/image"
import { Download, ExternalLink } from "lucide-react"
import type { Character } from "../types"

interface CharacterCardProps {
  character: Character
  index: number
  isVisible: boolean
}

export function CharacterCard({ character, index, isVisible }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`group relative w-full transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      style={{
        transitionDelay: `${index * 80}ms`,
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
        WebkitTransform: "translateZ(0)",
        transform: "translateZ(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card glow effect */}
      <div
        className={`absolute -inset-1 rounded-xl transition-all duration-500 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--event-glow, oklch(0.65 0.1 175)) 30%, transparent) 0%, transparent 70%)`,
          filter: "blur(12px)",
        }}
      />

      {/* Card container */}
      <div
        className="relative bg-card/90 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden transition-all duration-500 group-hover:border-primary/40 group-hover:bg-card/95"
        style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
      >
        {/* Image section */}
        <div className="relative h-72 sm:h-80 overflow-hidden">
          <Image
            src={character.image || "/placeholder.svg"}
            alt={character.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
            className="object-cover object-[center_15%] transition-all duration-700 group-hover:scale-110"
            loading="lazy"
            quality={85}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

          {/* Shine effect on hover */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}
            style={{
              background: `linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, transparent 50%, color-mix(in oklch, var(--event-glow, oklch(0.65 0.1 175)) 10%, transparent) 100%)`,
            }}
          />
        </div>

        {/* Content section */}
        <div className="relative p-5 sm:p-6 -mt-8">
          <h3 className="font-serif text-xl sm:text-2xl tracking-wide text-foreground mb-1.5 group-hover:text-primary transition-colors duration-300 text-readable">
            {character.name}
          </h3>
          <p className="text-sm tracking-wider text-primary/70 mb-3">by {character.maker}</p>

          {character.subtitle && (
            <p className="text-sm italic text-foreground/50 mb-3 line-clamp-2">{character.subtitle}</p>
          )}

          <p className="text-base text-foreground/70 leading-relaxed mb-5 line-clamp-3">
            {character.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {character.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-foreground/80 hover:text-primary border border-border/50 hover:border-primary/50 rounded-full transition-all duration-300 hover:bg-primary/5"
              >
                {link.platform}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ))}

            {character.cardFile && (
              <a
                href={`/cards/${character.cardFile}`}
                download={character.cardFile}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-primary border border-primary/50 hover:border-primary rounded-full transition-all duration-300 hover:bg-primary/10 ml-auto"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
