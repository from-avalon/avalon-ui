"use client"

import Image from "next/image"
import { ExternalLink } from "lucide-react"

interface CreatorLink {
  label: string
  url: string
}

interface Creator {
  name: string
  image: string
  links: CreatorLink[]
}

interface FeaturedCreatorProps {
  creator: Creator
  index: number
  isVisible: boolean
}

export function FeaturedCreator({ creator, index, isVisible }: FeaturedCreatorProps) {
  return (
    <div
      className={`group relative flex flex-col items-center text-center transition-all duration-500 ${
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Profile image container */}
      <div className="relative mb-6">
        {/* Outer magical aura */}
        <div
          className="absolute -inset-4 rounded-full transition-all duration-500 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
          style={{
            background: `radial-gradient(circle, oklch(0.65 0.1 175 / 0.2) 0%, oklch(0.55 0.12 180 / 0.1) 40%, transparent 70%)`,
            filter: "blur(8px)",
          }}
        />

        {/* Animated ring */}
        <div className="absolute -inset-2 rounded-full border transition-all duration-500 border-transparent scale-100 group-hover:border-primary/40 group-hover:scale-110" />

        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-border/50 group-hover:border-primary/50 transition-all duration-500 shadow-lg">
          <Image
            src={creator.image || "/placeholder.svg"}
            alt={creator.name}
            fill
            sizes="(max-width: 768px) 144px, 176px"
            className="object-cover object-top transition-all duration-700 group-hover:scale-110"
          />
          {/* Shine overlay on hover */}
          <div
            className="absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100"
            style={{
              background: `linear-gradient(135deg, oklch(1 0 0 / 0.1) 0%, transparent 50%, oklch(0.65 0.1 175 / 0.1) 100%)`,
            }}
          />
        </div>

        {/* Glowing dot accent */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary transition-all duration-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100"
          style={{ boxShadow: `0 0 10px 3px oklch(0.65 0.1 175 / 0.5)` }}
        />
      </div>

      <h3 className="font-serif text-xl md:text-2xl tracking-wider text-foreground mb-5 group-hover:text-primary transition-all duration-300 group-hover:text-glow-subtle text-readable">
        {creator.name}
      </h3>

      <div className="flex flex-wrap justify-center items-start gap-3">
        {creator.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm tracking-wider text-foreground/80 hover:text-primary border border-border/50 hover:border-primary/50 rounded-full transition-all duration-300 hover:bg-primary/5 hover:shadow-[0_0_15px_2px_oklch(0.65_0.1_175_/_0.15)] backdrop-blur-sm"
          >
            {link.label}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ))}
      </div>
    </div>
  )
}
