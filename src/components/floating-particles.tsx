"use client"

import { useEffect, useState, useRef, useCallback } from "react"

interface Particle {
  id: number
  x: number
  y: number
  baseX: number
  baseY: number
  size: number
  delay: number
  duration: number
  brightness: number
}

interface FloatingParticlesProps {
  coreColor?: string
  glowColor?: string
  count?: number
}

export function FloatingParticles({
  coreColor = "oklch(0.85 0.1 180)",
  glowColor = "oklch(0.70 0.10 180)",
  count = 60,
}: FloatingParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const generated: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 4 + 4,
      brightness: Math.random() * 0.5 + 0.5,
    }))
    setParticles(generated)
  }, [count])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => {
        const dx = mousePos.x - particle.baseX
        const dy = mousePos.y - particle.baseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 30
        const influence = Math.max(0, 1 - distance / maxDistance) * 0.3
        const offsetX = dx * influence
        const offsetY = dy * influence

        return (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              left: `calc(${particle.baseX}% + ${offsetX}px)`,
              top: `calc(${particle.baseY}% + ${offsetY}px)`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              background: `radial-gradient(circle, ${coreColor.replace(")", ` / ${particle.brightness})`)} 0%, ${coreColor.replace(")", ` / ${particle.brightness * 0.5})`)} 50%, transparent 100%)`,
              boxShadow: `0 0 ${particle.size * 3}px ${particle.size}px ${glowColor.replace(")", ` / ${particle.brightness * 0.4})`)}`,
              transition: "left 0.3s ease-out, top 0.3s ease-out",
            }}
          />
        )
      })}
    </div>
  )
}
