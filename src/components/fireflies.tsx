"use client"

import { useEffect, useState } from "react"

interface Firefly {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface FirefliesProps {
  coreColor?: string
  glowColor?: string
  count?: number
}

export function Fireflies({
  coreColor = "oklch(0.9 0.15 150)",
  glowColor = "oklch(0.8 0.12 150)",
  count = 20,
}: FirefliesProps) {
  const [fireflies, setFireflies] = useState<Firefly[]>([])

  useEffect(() => {
    const flies: Firefly[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 10,
      duration: Math.random() * 6 + 6,
    }))
    setFireflies(flies)
  }, [count])

  return (
    <div className="fixed inset-0 z-10 pointer-events-none overflow-hidden">
      {fireflies.map((fly) => (
        <div
          key={fly.id}
          className="absolute animate-firefly"
          style={{
            left: `${fly.x}%`,
            top: `${fly.y}%`,
            width: fly.size,
            height: fly.size,
            animationDelay: `${fly.delay}s`,
            animationDuration: `${fly.duration}s`,
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${coreColor} 0%, ${glowColor.replace(")", " / 0.8)")} 40%, transparent 70%)`,
              boxShadow: `0 0 ${fly.size * 3}px ${fly.size}px ${glowColor.replace(")", " / 0.6)")}`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
