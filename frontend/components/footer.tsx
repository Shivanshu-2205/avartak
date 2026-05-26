"use client"

import { useState } from "react"
import { motion } from "framer-motion"

const BOUNDS_W = 960
const BOUNDS_H = 520
const CARD_W = 150
const CARD_H = 55
const HUB = { x: BOUNDS_W / 2, y: 100 }

// Removed: X.com (link8), Suggestions (link10)
const footerLinks = [
  { id: "link1", label: "Dashboard",       initialX: 50,  initialY: 150, rotation: -2   },
  { id: "link2", label: "About Us",        initialX: 220, initialY: 130, rotation: 1    },
  { id: "link3", label: "Register",        initialX: 400, initialY: 145, rotation: -1   },
  { id: "link4", label: "Plans & Pricing", initialX: 570, initialY: 135, rotation: 2    },
  { id: "link5", label: "Support",         initialX: 760, initialY: 150, rotation: -1.5 },
  { id: "link6", label: "Contact Us",      initialX: 80,  initialY: 290, rotation: 1.5  },
  { id: "link7", label: "LinkedIn",        initialX: 290, initialY: 275, rotation: -2   },
  { id: "link9", label: "Detective Cards", initialX: 590, initialY: 280, rotation: -1   },
]

// Cards that contain profile links (wider cards)
const linkedinProfiles = [
  { url: "https://www.linkedin.com/in/garv-verma-80a3942a0/",   label: "Garv Verma"      },
  { url: "https://www.linkedin.com/in/shivanshumaurya2203/",    label: "Shivanshu Maurya" },
]

const githubProfiles = [
  { url: "https://github.com/Shivanshu-2205", label: "Shivanshu-2205" },
  { url: "https://github.com/GarvVermaa",     label: "GarvVermaa"     },
]

type Positions = Record<string, { x: number; y: number }>

interface FooterProps {
  onOpenLogin?: () => void
}

export function Footer({ onOpenLogin }: FooterProps) {
  const [positions, setPositions] = useState<Positions>(() => {
    const initial: Positions = {}
    footerLinks.forEach((link) => {
      initial[link.id] = { x: link.initialX, y: link.initialY }
    })
    return initial
  })
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragMoved, setDragMoved] = useState(false)

  const handlePanStart = (linkId: string) => {
    setDraggingId(linkId)
    setDragMoved(false)
  }

  const handlePan = (linkId: string, deltaX: number, deltaY: number) => {
    setDragMoved(true)
    const cardH = getCardHeight(linkId)
    setPositions((prev) => {
      const current = prev[linkId]
      const newX = Math.max(0, Math.min(current.x + deltaX, BOUNDS_W - getCardWidth(linkId)))
      const newY = Math.max(0, Math.min(current.y + deltaY, BOUNDS_H - cardH))
      return { ...prev, [linkId]: { x: newX, y: newY } }
    })
  }

  const handleTap = (linkId: string) => {
    if (dragMoved) return
    if (linkId === "link1") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else if (linkId === "link3") {
      onOpenLogin?.()
    } else if (linkId === "link4") {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const getStringPath = (linkId: string) => {
    const pos = positions[linkId]
    const from = HUB
    const cardW = getCardWidth(linkId)
    const to = { x: pos.x + cardW / 2, y: pos.y + 8 }
    const mx = (from.x + to.x) / 2
    const my = (from.y + to.y) / 2
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
    const sag = Math.min(dist * 0.18, 50)
    return { d: `M ${from.x} ${from.y} Q ${mx} ${my + sag} ${to.x} ${to.y}`, to }
  }

  const getCardWidth = (id: string) => (id === "link7" || id === "link2") ? 190 : CARD_W
  const getCardHeight = (id: string) => (id === "link7" || id === "link2") ? 115 : CARD_H

  const isClickable = (id: string) => ["link1", "link3", "link4"].includes(id)

  return (
    <footer id="footer" className="bg-[#0a0a0f]/90 py-16 px-4 border-t border-[#c9a84c]/20 relative z-10">
      <div className="max-w-5xl mx-auto">

        {/* Desktop: Fixed bounds container */}
        <div
          className="relative mx-auto overflow-hidden hidden md:block"
          style={{ width: BOUNDS_W, height: BOUNDS_H }}
        >
          {/* Heading */}
          <div className="absolute text-center" style={{ left: "50%", top: 20, transform: "translateX(-50%)" }}>
            <h2 className="font-serif text-3xl text-cream mb-1 inline-block">Avartak</h2>
            <p className="text-muted-foreground text-sm">Every great mind works a case.</p>
          </div>

          {/* Gold hub pin */}
          <div
            className="absolute"
            style={{
              left: HUB.x - 6, top: HUB.y - 6,
              width: 12, height: 12, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #e8c84a, #8a6a00)",
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)", zIndex: 30,
            }}
          />

          {/* SVG Strings */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 20, overflow: "visible" }}>
            {footerLinks.map((link) => {
              const { d, to } = getStringPath(link.id)
              return (
                <g key={link.id}>
                  <path d={d} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={3} strokeLinecap="round" style={{ transform: "translateY(2px)" }} />
                  <path d={d} fill="none" stroke="#C0392B" strokeWidth={1.6} strokeLinecap="round" strokeOpacity={0.85} />
                  <path d={d} fill="none" stroke="rgba(220,100,80,0.3)" strokeWidth={0.6} strokeLinecap="round" />
                  <circle cx={to.x} cy={to.y} r={4} fill="#B8960C" />
                </g>
              )
            })}
          </svg>

          {/* Draggable Link Cards */}
          {footerLinks.map((link) => {
            const cardW = getCardWidth(link.id)
            const cardH = getCardHeight(link.id)
            const clickable = isClickable(link.id)

            return (
              <motion.div
                key={link.id}
                style={{
                  width: cardW,
                  background: "#faf8f2",
                  border: "1px solid rgba(0,0,0,0.1)",
                  padding: link.id === "link7" || link.id === "link2" ? "10px 14px 12px" : "10px 14px 20px",
                  boxShadow:
                    draggingId === link.id
                      ? "0 8px 24px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.25)"
                      : "0 4px 16px rgba(0,0,0,0.35), 0 1px 3px rgba(0,0,0,0.2)",
                  cursor: draggingId === link.id ? "grabbing" : clickable ? "pointer" : "grab",
                  position: "absolute",
                  left: positions[link.id].x,
                  top: positions[link.id].y,
                  transform: `rotate(${link.rotation}deg)`,
                  transformOrigin: "50% 8px",
                  userSelect: "none",
                  zIndex: draggingId === link.id ? 50 : 10,
                }}
                onPanStart={() => handlePanStart(link.id)}
                onPan={(_, info) => handlePan(link.id, info.delta.x, info.delta.y)}
                onPanEnd={() => { setDraggingId(null) }}
                onTap={() => handleTap(link.id)}
              >
                {/* Gold pin */}
                <div
                  style={{
                    position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                    width: 10, height: 10, borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #e8c84a, #8a6a00)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.5)", zIndex: 10,
                  }}
                />

                <span style={{ fontSize: 13, color: "#1a1a1a", fontFamily: "Inter, sans-serif", fontWeight: 600, whiteSpace: "nowrap", display: "block", marginBottom: (link.id === "link7" || link.id === "link2") ? 8 : 0 }}>
                  {link.label}
                </span>

                {/* LinkedIn profiles */}
                {link.id === "link7" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {linkedinProfiles.map((p) => (
                      <a
                        key={p.url}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11, color: "#0A66C2", fontFamily: "Inter, sans-serif",
                          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                          padding: "2px 0", borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        {p.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* GitHub profiles */}
                {link.id === "link2" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {githubProfiles.map((p) => (
                      <a
                        key={p.url}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11, color: "#24292e", fontFamily: "Inter, sans-serif",
                          textDecoration: "none", display: "flex", alignItems: "center", gap: 4,
                          padding: "2px 0", borderBottom: "1px solid rgba(0,0,0,0.06)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="#24292e">
                          <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                        </svg>
                        {p.label}
                      </a>
                    ))}
                  </div>
                )}

                {/* Clickable hint for Register / Dashboard / Plans */}
                {clickable && (
                  <span style={{ fontSize: 9, color: "#B8960C", fontFamily: "Inter, sans-serif", display: "block", marginTop: 4, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {link.id === "link1" ? "↑ Back to Top" : link.id === "link3" ? "→ Sign In" : "→ View Plans"}
                  </span>
                )}
              </motion.div>
            )
          })}

          {/* Copyright */}
          <div className="absolute text-center" style={{ left: "50%", bottom: 20, transform: "translateX(-50%)" }}>
            <p className="text-muted-foreground text-xs">© 2025 Avartak. All rights reserved.</p>
          </div>
        </div>

        {/* Mobile: Simple layout without dragging */}
        <div className="md:hidden">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-cream mb-2">Avartak</h2>
            <p className="text-muted-foreground text-sm">Every great mind works a case.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {footerLinks.map((link) => {
              const clickable = isClickable(link.id)
              return (
                <div
                  key={link.id}
                  onClick={() => handleTap(link.id)}
                  style={{
                    background: "#faf8f2",
                    border: "1px solid rgba(0,0,0,0.1)",
                    padding: "8px 14px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                    transform: `rotate(${link.rotation}deg)`,
                    cursor: clickable ? "pointer" : "default",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#1a1a1a", fontFamily: "Inter, sans-serif", fontWeight: 600, whiteSpace: "nowrap", display: "block" }}>
                    {link.label}
                  </span>

                  {/* LinkedIn mobile */}
                  {link.id === "link7" && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {linkedinProfiles.map((p) => (
                        <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 11, color: "#0A66C2", textDecoration: "none" }}>
                          ↗ {p.label}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* GitHub mobile */}
                  {link.id === "link2" && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {githubProfiles.map((p) => (
                        <a key={p.url} href={p.url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 11, color: "#24292e", textDecoration: "none" }}>
                          ↗ {p.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="text-center pt-6 border-t border-cream/10">
            <p className="text-muted-foreground text-xs">© 2025 Avartak. All rights reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  )
}
