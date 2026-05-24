"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const BOUNDS_W = 960
const BOUNDS_H = 500
const CARD_W = 140
const CARD_H = 50
// Hub pin is now below the heading and tagline (approx 100px from top)
const HUB = { x: BOUNDS_W / 2, y: 100 }

const footerLinks = [
  { id: "link1", label: "Dashboard", initialX: 60, initialY: 140, rotation: -2 },
  { id: "link2", label: "About Us", initialX: 220, initialY: 120, rotation: 1 },
  { id: "link3", label: "Register", initialX: 400, initialY: 130, rotation: -1 },
  { id: "link4", label: "Plans & Pricing", initialX: 560, initialY: 125, rotation: 2 },
  { id: "link5", label: "Support", initialX: 760, initialY: 140, rotation: -1.5 },
  { id: "link6", label: "Contact Us", initialX: 100, initialY: 240, rotation: 1.5 },
  { id: "link7", label: "LinkedIn", initialX: 300, initialY: 250, rotation: -2 },
  { id: "link8", label: "X.com", initialX: 500, initialY: 235, rotation: 2 },
  { id: "link9", label: "Detective Cards", initialX: 680, initialY: 245, rotation: -1 },
  { id: "link10", label: "Suggestions", initialX: 380, initialY: 350, rotation: 1.5 },
]

type Positions = Record<string, { x: number; y: number }>

export function Footer() {
  const [positions, setPositions] = useState<Positions>(() => {
    const initial: Positions = {}
    footerLinks.forEach((link) => {
      initial[link.id] = { x: link.initialX, y: link.initialY }
    })
    return initial
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const handlePan = (linkId: string, deltaX: number, deltaY: number) => {
    setPositions((prev) => {
      const current = prev[linkId]
      const newX = Math.max(0, Math.min(current.x + deltaX, BOUNDS_W - CARD_W))
      const newY = Math.max(0, Math.min(current.y + deltaY, BOUNDS_H - CARD_H))
      return { ...prev, [linkId]: { x: newX, y: newY } }
    })
  }

  const getStringPath = (linkId: string) => {
    const pos = positions[linkId]
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
    <footer id="footer" className="bg-[#211D1A] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Desktop: Fixed bounds container */}
        <div
          className="relative mx-auto overflow-hidden hidden md:block"
          style={{ width: BOUNDS_W, height: BOUNDS_H }}
        >
          {/* Avartak heading - positioned at top */}
          <div
            className="absolute text-center"
            style={{ left: "50%", top: 20, transform: "translateX(-50%)" }}
          >
            <h2 className="font-serif text-3xl text-cream mb-1 inline-block relative">
              Avartak
            </h2>
            <p className="text-muted-foreground text-sm">Every great mind works a case.</p>
          </div>

          {/* Gold hub pin - positioned 25px below the tagline */}
          <div
            className="absolute"
            style={{ 
              left: HUB.x - 6, 
              top: HUB.y - 6,
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #e8c84a, #8a6a00)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              zIndex: 30,
            }}
          />

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
            {footerLinks.map((link) => {
              const { d, to } = getStringPath(link.id)
              return (
                <g key={link.id}>
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
            {/* Gold pin at hub - now rendered via DOM element above */}
          </svg>

          {/* Draggable Link Cards */}
          {footerLinks.map((link) => (
            <motion.div
              key={link.id}
              style={{
                width: CARD_W,
                background: "#faf8f2",
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "10px 14px 20px",
                boxShadow:
                  draggingId === link.id
                    ? "0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)"
                    : "0 4px 16px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
                cursor: draggingId === link.id ? "grabbing" : "grab",
                position: "absolute",
                left: positions[link.id].x,
                top: positions[link.id].y,
                transform: `rotate(${link.rotation}deg)`,
                transformOrigin: "50% 8px",
                userSelect: "none",
                zIndex: draggingId === link.id ? 50 : 10,
              }}
              onPanStart={() => setDraggingId(link.id)}
              onPan={(_, info) => handlePan(link.id, info.delta.x, info.delta.y)}
              onPanEnd={() => setDraggingId(null)}
            >
              {/* Gold pin at top center */}
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 35%, #e8c84a, #8a6a00)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  zIndex: 10,
                }}
              />

              <span
                style={{
                  fontSize: 13,
                  color: "#1a1a1a",
                  fontFamily: "Inter, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {link.label}
              </span>
            </motion.div>
          ))}

          {/* Bottom copyright */}
          <div
            className="absolute text-center"
            style={{ left: "50%", bottom: 20, transform: "translateX(-50%)" }}
          >
            <p className="text-muted-foreground text-xs">
              © 2025 Avartak. All rights reserved.
            </p>
          </div>
        </div>

        {/* Mobile: Simple layout without dragging */}
        <div className="md:hidden">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-cream mb-2">Avartak</h2>
            <p className="text-muted-foreground text-sm">Every great mind works a case.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {footerLinks.map((link) => (
              <div
                key={link.id}
                style={{
                  background: "#faf8f2",
                  border: "1px solid rgba(0,0,0,0.1)",
                  padding: "8px 14px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                  transform: `rotate(${link.rotation}deg)`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "#1a1a1a",
                    fontFamily: "Inter, sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {link.label}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center pt-6 border-t border-cream/10">
            <p className="text-muted-foreground text-xs">
              © 2025 Avartak. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
