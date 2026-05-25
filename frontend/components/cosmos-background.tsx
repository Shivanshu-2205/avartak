"use client"

import { useEffect, useRef } from "react"

export function CosmosBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let W = (canvas.width = window.innerWidth)
    let H = (canvas.height = window.innerHeight)

    class Particle {
      x!: number
      y!: number
      r!: number
      baseOpacity!: number
      opacity!: number
      speed!: number
      angle!: number
      vx!: number
      vy!: number
      twinkle!: number
      twinkleSpeed!: number
      gold!: boolean
      life!: number
      maxLife!: number

      constructor() {
        this.reset(true)
      }

      reset(initial = false) {
        this.x = Math.random() * W
        this.y = Math.random() * H
        this.r = Math.random() * 1.8 + 0.2
        this.baseOpacity = Math.random() * 0.7 + 0.1
        this.opacity = initial ? Math.random() * this.baseOpacity : 0
        this.speed = Math.random() * 0.25 + 0.04
        this.angle = Math.random() * Math.PI * 2
        this.vx = Math.cos(this.angle) * this.speed
        this.vy = Math.sin(this.angle) * this.speed
        this.twinkle = Math.random() * Math.PI * 2
        this.twinkleSpeed = Math.random() * 0.02 + 0.005
        this.gold = Math.random() < 0.12
        this.life = 0
        this.maxLife = 600 + Math.random() * 400
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.twinkle += this.twinkleSpeed
        this.life++
        const fade =
          this.life < 60
            ? this.life / 60
            : this.life > this.maxLife - 60
            ? (this.maxLife - this.life) / 60
            : 1
        this.opacity =
          this.baseOpacity * fade * (0.7 + 0.3 * Math.sin(this.twinkle))
        if (
          this.life >= this.maxLife ||
          this.x < -5 ||
          this.x > W + 5 ||
          this.y < -5 ||
          this.y > H + 5
        ) {
          this.reset(false)
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fillStyle = this.gold
          ? `rgba(201, 168, 76, ${this.opacity})`
          : `rgba(245, 240, 232, ${this.opacity})`
        ctx.fill()
      }
    }

    class Nebula {
      x!: number
      y!: number
      r!: number
      hue!: number
      opacity!: number
      vx!: number
      vy!: number
      life!: number
      maxLife!: number

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * W
        this.y = Math.random() * H
        this.r = Math.random() * 280 + 120
        this.hue = Math.random() < 0.4 ? 35 : Math.random() < 0.5 ? 10 : 220
        this.opacity = Math.random() * 0.045 + 0.01
        this.vx = (Math.random() - 0.5) * 0.08
        this.vy = (Math.random() - 0.5) * 0.05
        this.life = 0
        this.maxLife = 1200 + Math.random() * 800
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.life++
        if (this.life > this.maxLife) {
          this.reset()
        }
      }

      draw() {
        if (!ctx) return
        const fade =
          this.life < 120
            ? this.life / 120
            : this.life > this.maxLife - 120
            ? (this.maxLife - this.life) / 120
            : 1
        const grd = ctx.createRadialGradient(
          this.x,
          this.y,
          0,
          this.x,
          this.y,
          this.r
        )
        grd.addColorStop(0, `hsla(${this.hue}, 60%, 55%, ${this.opacity * fade})`)
        grd.addColorStop(1, `hsla(${this.hue}, 60%, 40%, 0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    class Probe {
      x!: number
      y!: number
      speed!: number
      angle!: number
      trail!: { x: number; y: number }[]
      life!: number
      maxLife!: number
      size!: number

      constructor() {
        this.reset()
      }

      reset() {
        this.x = -20
        this.y = Math.random() * H * 0.8 + H * 0.1
        this.speed = Math.random() * 0.6 + 0.3
        this.angle = (Math.random() - 0.5) * 0.3
        this.trail = []
        this.life = 0
        this.maxLife = W / this.speed + 200
        this.size = Math.random() * 1.5 + 0.8
      }

      update() {
        this.x += this.speed
        this.y += Math.sin(this.life * 0.02) * 0.4
        this.trail.push({ x: this.x, y: this.y })
        if (this.trail.length > 80) {
          this.trail.shift()
        }
        this.life++
        if (this.x > W + 40) {
          this.reset()
        }
      }

      draw() {
        if (!ctx || this.trail.length < 2) return
        for (let i = 1; i < this.trail.length; i++) {
          const t = i / this.trail.length
          ctx.beginPath()
          ctx.moveTo(this.trail[i - 1].x, this.trail[i - 1].y)
          ctx.lineTo(this.trail[i].x, this.trail[i].y)
          ctx.strokeStyle = `rgba(201, 168, 76, ${t * 0.35})`
          ctx.lineWidth = t * this.size
          ctx.stroke()
        }
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size + 0.5, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(245, 240, 232, 0.9)"
        ctx.fill()
      }
    }

    let particles = Array.from({ length: 220 }, () => new Particle())
    let nebulae = Array.from({ length: 5 }, () => new Nebula())
    let lines = Array.from({ length: 3 }, () => new Probe())

    function loop() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // Deep celestial background gradient
      const bg = ctx.createRadialGradient(
        W * 0.35,
        H * 0.4,
        0,
        W * 0.5,
        H * 0.5,
        Math.max(W, H) * 0.9
      )
      bg.addColorStop(0, "#1a1420")
      bg.addColorStop(0.5, "#0e0b12")
      bg.addColorStop(1, "#06060a")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      nebulae.forEach((n) => {
        n.update()
        n.draw()
      })
      particles.forEach((p) => {
        p.update()
        p.draw()
      })
      lines.forEach((l) => {
        l.update()
        l.draw()
      })

      animationFrameId = requestAnimationFrame(loop)
    }

    const handleResize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
      particles = Array.from({ length: 220 }, () => new Particle())
      nebulae = Array.from({ length: 5 }, () => new Nebula())
      lines = Array.from({ length: 3 }, () => new Probe())
    }

    window.addEventListener("resize", handleResize)
    loop()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="cosmos"
      className="fixed inset-0 w-full h-full z-0 block pointer-events-none"
    />
  )
}
