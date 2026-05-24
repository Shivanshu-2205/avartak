"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="font-serif text-xl text-cream tracking-wide">
            Avartak
          </a>

          {/* Center Links - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-8">
            {/* Product Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
                className="flex items-center gap-1 text-cream/80 hover:text-cream transition-colors text-sm"
              >
                Product
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-muted rounded-lg shadow-xl border border-border py-2">
                  <a href="#" className="block px-4 py-2 text-cream/80 hover:text-cream hover:bg-border/30 text-sm transition-colors">
                    Detective Board
                  </a>
                  <a href="#" className="block px-4 py-2 text-cream/80 hover:text-cream hover:bg-border/30 text-sm transition-colors">
                    LLM Suggestions
                  </a>
                  <a href="#" className="block px-4 py-2 text-cream/80 hover:text-cream hover:bg-border/30 text-sm transition-colors">
                    Investigation Score
                  </a>
                </div>
              )}
            </div>

            <a href="#pricing" className="text-cream/80 hover:text-cream transition-colors text-sm">
              Pricing
            </a>
            <a href="#footer" className="text-cream/80 hover:text-cream transition-colors text-sm">
              About Us
            </a>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:block px-4 py-2 text-cream border border-cream/40 rounded-lg hover:border-cream/70 transition-colors text-sm">
              Login
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
