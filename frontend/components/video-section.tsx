"use client"

import { useState } from "react"

const tabs = [
  { id: "build", label: "Build Boards" },
  { id: "ask", label: "Ask Questions" },
  { id: "suggest", label: "Get Suggestions" },
  { id: "track", label: "Track Progress" },
  { id: "collab", label: "Collaborate", badge: "soon" },
]

export function VideoSection() {
  const [activeTab, setActiveTab] = useState("build")

  return (
    <section id="usage" className="bg-transparent py-20 px-4 relative z-10">
      <div className="max-w-5xl mx-auto">
        {/* Tab Bar */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-1 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2 text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-cream"
                  : "text-muted-foreground hover:text-cream/80"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-accent/20 text-accent rounded-full">
                    {tab.badge}
                  </span>
                )}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-cream rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Video Placeholder */}
        <div className="relative aspect-video max-w-[900px] mx-auto rounded-xl border-2 border-dashed border-cream/30 bg-muted/20">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-lg">[ Product video coming soon ]</p>
          </div>
          {/* Inner shadow effect */}
          <div className="absolute inset-0 rounded-xl shadow-[inset_0_2px_20px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </section>
  )
}
