"use client"

import { useState } from "react"

export function Hero({ onLogin }: { onLogin: (token: string, email?: string, profile?: any) => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [authError, setAuthError] = useState("")

  return (
    /* Clean polaroid-style auth card — no post-it notes, no SVG threads, no full-page wrapper */
    <div className="relative w-full max-w-md mx-auto">
      {/* Polaroid Card */}
      <div
        className="relative bg-[#FDFBF7] border-[12px] border-white rounded-sm p-6 shadow-2xl"
        style={{ transform: "rotate(1deg)" }}
      >
        {/* Gold push pin at top center */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#B8960C] shadow-lg z-10" />

        <h2 className="font-serif text-2xl text-[#2C2416] text-center mb-6">
          {isSignup ? "Sign Up as Investigator" : "Open your first investigation"}
        </h2>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-[#C0392B] rounded-lg text-xs font-medium text-center">
            {authError}
          </div>
        )}

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() =>
            onLogin("google-dev-token", "google-dev@example.com", {
              name: "Google Investigator",
              bio: "Investigator signed in via Google.",
              avatar: "detective-2",
              themePreference: "dark",
            })
          }
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors mb-4 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#2C2416]/20" />
          <span className="text-[#2C2416]/50 text-sm">or</span>
          <div className="flex-1 h-px bg-[#2C2416]/20" />
        </div>

        {/* Email/Password Form */}
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setAuthError("")

            if (!email || !password) {
              setAuthError("Email and password are required.")
              return
            }
            if (isSignup && !name.trim()) {
              setAuthError("Display name is required.")
              return
            }

            const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login"
            const body = isSignup ? { email, password, name } : { email, password }

            try {
              const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
              })
              const data = await response.json()
              if (!response.ok) throw new Error(data.error || "Authentication failed.")
              onLogin(data.token, data.email, data.profile)
            } catch (err: any) {
              setAuthError(err.message || "Connection refused by backend.")
            }
          }}
        >
          {isSignup && (
            <input
              type="text"
              placeholder="Display Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
          />
          <button
            type="submit"
            className="w-full bg-[#C0392B] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#A93226] transition-colors cursor-pointer"
          >
            {isSignup ? "Sign Up" : "Begin →"}
          </button>

          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setAuthError("") }}
              className="text-xs text-[#8A6A00] hover:underline font-medium focus:outline-none cursor-pointer"
            >
              {isSignup ? "Already have an account? Log In" : "Need an account? Sign Up"}
            </button>
          </div>
        </form>

        {/* Developer Authentication Bypass Button */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-4 pt-4 border-t border-[#2C2416]/10 text-center">
            <button
              type="button"
              onClick={() =>
                onLogin("dev-bypass-token", "developer@rabbithole.ai", {
                  name: "Developer Sandbox",
                  bio: "Default sandbox developer profile (Bypass Mode).",
                  avatar: "detective-1",
                  themePreference: "dark",
                })
              }
              className="w-full py-2.5 px-4 bg-[#B8960C]/10 hover:bg-[#B8960C]/20 border border-[#B8960C] border-dashed text-[#8A6A00] font-medium rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⚡</span> [Dev Bypass Auth]
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
