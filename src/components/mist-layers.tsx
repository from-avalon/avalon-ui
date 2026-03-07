"use client"

import { useEffect, useState } from "react"

interface MistLayer {
  id: number
  y: number
  delay: number
  duration: number
  opacity: number
  reverse: boolean
}

interface MistLayersProps {
  color?: string
  count?: number
}

export function MistLayers({ color = "oklch(0.7 0.08 145)", count = 4 }: MistLayersProps) {
  const [layers, setLayers] = useState<MistLayer[]>([])

  useEffect(() => {
    const generated: MistLayer[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      y: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 30 + Math.random() * 20,
      opacity: 0.015 + Math.random() * 0.025,
      reverse: i % 2 === 0,
    }))
    setLayers(generated)
  }, [count])

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`absolute w-[200%] h-24 ${layer.reverse ? "animate-mist-reverse" : "animate-mist"}`}
          style={{
            top: `${layer.y}%`,
            animationDelay: `${layer.delay}s`,
            animationDuration: `${layer.duration}s`,
            opacity: layer.opacity,
            background: `linear-gradient(90deg, transparent, ${color.replace(")", " / 0.3)")}, ${color.replace(")", " / 0.25)")}, transparent)`,
            filter: "blur(50px)",
          }}
        />
      ))}
    </div>
  )
}
