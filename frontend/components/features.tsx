"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lightbulb, Gauge, GitFork, LayoutGrid } from "lucide-react"

const BOUNDS_W = 960
const BOUNDS_H = 500
const CARD_W = 220
const CARD_H = 180
const HUB = { x: BOUNDS_W / 2, y: 20 }

const features = [
  {
    id: "card1",
    icon: Lightbulb,
    label: "Feature",
    title: "Suggestions that know your board",
    body: "The AI reads your entire investigation before suggesting the next card. Personal to your board, not generic.",
    rotation: -2,
    initialX: 80,
    initialY: 100,
  },
  {
    id: "card2",
    icon: Gauge,
    label: "Feature",
    title: "How deep are you in?",
    body: "Every board gets a live depth score — cards explored, connections drawn, notes written. See your investigation grow.",
    rotation: 2,
    initialX: 660,
    initialY: 80,
  },
  {
    id: "card3",
    icon: GitFork,
    label: "Feature",
    title: "Hit a wall? We notice.",
    body: "Three abandoned cards in a row and Avartak flags it. A nudge to try a new angle before you give up.",
    rotation: 2,
    initialX: 100,
    initialY: 290,
  },
  {
    id: "card4",
    icon: LayoutGrid,
    label: "Feature",
    title: "Start with a structure",
    body: "Historical Event, Scientific Concept, Person — pre-built board structures so you never start from a blank board.",
    rotation: -2,
    initialX: 640,
    initialY: 300,
  },
]

type Positions = Record<string, { x: number; y: number }>

export function Features() {
  const [positions, setPositions] = useState<Positions>(() => {
    const initial: Positions = {}
    features.forEach((f) => {
      initial[f.id] = { x: f.initialX, y: f.initialY }
    })
    return initial
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handlePan = (cardId: string, deltaX: number, deltaY: number) => {
    setPositions((prev) => {
      const current = prev[cardId]
      const newX = Math.max(0, Math.min(current.x + deltaX, BOUNDS_W - CARD_W))
      const newY = Math.max(0, Math.min(current.y + deltaY, BOUNDS_H - CARD_H))
      return { ...prev, [cardId]: { x: newX, y: newY } }
    })
  }

  // Calculate string path from hub to card pin
  const getStringPath = (cardId: string) => {
    const pos = positions[cardId]
    const from = HUB
    const to = { x: pos.x + CARD_W / 2, y: pos.y + 8 }
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
    const sag = Math.min(dist * 0.18, 50)
    return {
      d: `M ${from.x} ${from.y} Q ${mx} ${my + sag} ${to.x} ${to.y}`,
      to,
    }
  }

  return (
    <section id="features" className="bg-transparent py-24 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Built for the curious.
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to go deeper.
          </p>
        </div>

        {/* Desktop: Fixed bounds container with draggable cards */}
        <div
          className="relative mx-auto overflow-hidden hidden md:block"
          style={{ width: BOUNDS_W, height: BOUNDS_H }}
        >
          {/* SVG Strings overlay */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 20,
              overflow: "visible",
            }}
          >
            {features.map((feature) => {
              const { d, to } = getStringPath(feature.id)
              return (
                <g key={feature.id}>
                  {/* Shadow */}
                  <path
                    d={d}
                    fill="none"
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    style={{ transform: "translateY(2px)" }}
                  />
                  {/* Main string */}
                  <path
                    d={d}
                    fill="none"
                    stroke="#C0392B"
                    strokeWidth={1.6}
                    strokeLinecap="round"
                    strokeOpacity={0.85}
                  />
                  {/* Highlight */}
                  <path
                    d={d}
                    fill="none"
                    stroke="rgba(220,100,80,0.3)"
                    strokeWidth={0.6}
                    strokeLinecap="round"
                  />
                  {/* Gold pin at card end */}
                  <circle cx={to.x} cy={to.y} r={4} fill="#B8960C" />
                </g>
              )
            })}
            {/* Gold pin at hub */}
            <circle cx={HUB.x} cy={HUB.y} r={5} fill="#B8960C" />
          </svg>

          {/* Draggable Cards */}
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              style={{
                width: CARD_W,
                background: "#faf8f2",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "14px 14px 36px",
                boxShadow:
                  draggingId === feature.id
                    ? "0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)"
                    : "0 4px 16px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
                cursor: draggingId === feature.id ? "grabbing" : "grab",
                position: "absolute",
                left: positions[feature.id].x,
                top: positions[feature.id].y,
                transform: `rotate(${feature.rotation}deg)`,
                transformOrigin: "50% 8px",
                userSelect: "none",
                zIndex: draggingId === feature.id ? 50 : 10,
              }}
              onPanStart={() => setDraggingId(feature.id)}
              onPan={(_, info) => handlePan(feature.id, info.delta.x, info.delta.y)}
              onPanEnd={() => setDraggingId(null)}
            >
              {/* Gold pin at top center */}
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #e8c84a, #8a6a00)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  zIndex: 10,
                }}
              />

              {/* Content area */}
              <div style={{ minHeight: 80 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: "#888",
                    fontFamily: "Inter, sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  {feature.label}
                </div>
                <feature.icon
                  className="w-5 h-5 mb-2"
                  style={{ color: "#555" }}
                  strokeWidth={1.5}
                />
                <div
                  style={{
                    fontSize: 14,
                    color: "#1a1a1a",
                    fontFamily: "Playfair Display, serif",
                    fontWeight: 600,
                    lineHeight: 1.4,
                  }}
                >
                  {feature.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#555",
                    fontFamily: "Inter, sans-serif",
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {feature.body}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile: Simple grid without dragging */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {features.map((feature) => (
            <div
              key={feature.id}
              style={{
                background: "#faf8f2",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "14px 14px 24px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
                transform: `rotate(${feature.rotation}deg)`,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "#888",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 6,
                }}
              >
                {feature.label}
              </div>
              <feature.icon
                className="w-5 h-5 mb-2"
                style={{ color: "#555" }}
                strokeWidth={1.5}
              />
              <div
                style={{
                  fontSize: 14,
                  color: "#1a1a1a",
                  fontFamily: "Playfair Display, serif",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {feature.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#555",
                  fontFamily: "Inter, sans-serif",
                  marginTop: 6,
                  lineHeight: 1.5,
                }}
              >
                {feature.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
