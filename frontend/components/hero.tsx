"use client"

import { motion, useMotionValue } from "framer-motion"
import { useState } from "react"

const postItNotes = [
  { text: "Your thoughts, pinned.", rotation: -3 },
  { text: "The board your brain never had.", rotation: 2 },
  { text: "Pin what you find.", rotation: -4 },
  { text: "Think in rabbit holes.", rotation: 3 },
  { text: "Every great mind works a case.", rotation: -2 },
  { text: "Open an investigation.", rotation: 4 },
]

// Positions relative to center card - clustered close around it, but not overlapping
// These offsets are from the center of the signup card
const postItPositions = [
  { x: -290, y: -190 }, // top-left
  { x: 290, y: -180 },  // top-right
  { x: -315, y: -10 },  // left side, middle
  { x: 310, y: 10 },    // right side, middle
  { x: -290, y: 180 },  // bottom-left
  { x: 295, y: 190 },   // bottom-right
]

function PostItNote({ text }: { text: string }) {
  return (
    <div 
      className="relative animate-fade-in"
      style={{ 
        width: 120,
        height: 110,
      }}
    >
      {/* Gold push pin at top center of the note body */}
      <div 
        className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#E6B800] to-[#B8960C] z-30"
        style={{
          border: '1px solid #9A7D0A',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        }}
      >
        {/* Specular highlight for a realistic 3D look */}
        <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-white opacity-60" />
      </div>

      {/* Darker top edge - glued strip simulation */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          background: '#E6B800',
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
      
      {/* Main post-it body */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          background: '#F5C842',
          padding: '14px 10px 10px',
          boxShadow: '2px 3px 0px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p 
          style={{
            color: '#1a1a1a',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          {text}
        </p>
      </div>
    </div>
  )
}

export function Hero({ onLogin }: { onLogin: (token: string, email?: string, profile?: any) => void }) {
  const [renderTrigger, setRenderTrigger] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignup, setIsSignup] = useState(false)
  const [authError, setAuthError] = useState("")

  // Declare 6 static pairs of motion values for the 6 notes to follow Hook rules
  const x0 = useMotionValue(0)
  const y0 = useMotionValue(0)
  const x1 = useMotionValue(0)
  const y1 = useMotionValue(0)
  const x2 = useMotionValue(0)
  const y2 = useMotionValue(0)
  const x3 = useMotionValue(0)
  const y3 = useMotionValue(0)
  const x4 = useMotionValue(0)
  const y4 = useMotionValue(0)
  const x5 = useMotionValue(0)
  const y5 = useMotionValue(0)

  const motionValues = [
    { x: x0, y: y0 },
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 },
    { x: x4, y: y4 },
    { x: x5, y: y5 },
  ]

  const forceUpdate = () => setRenderTrigger(prev => prev + 1)

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Center container for signup card and clustered post-its */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="relative">
          {/* SVG threads connecting post-it notes to the push pin - Desktop only */}
          <svg
            className="absolute pointer-events-none overflow-visible hidden md:block"
            style={{
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
              zIndex: 15, // In front of main signup card (z-10) and behind post-its (z-20)
            }}
          >
            {postItPositions.map((pos, index) => {
              const currentX = motionValues[index].x.get()
              const currentY = motionValues[index].y.get()
              
              // Pin starting coordinates (matches gold push pin position at top center)
              const p0 = { x: 0, y: -248 }
              // Note ending coordinates (attaches exactly to the gold push pin center on the post-it)
              const p2 = {
                x: pos.x + currentX,
                y: pos.y + currentY - 57
              }
              // Curved string sag/hang control point
              const p1 = {
                x: (p0.x + p2.x) / 2,
                y: (p0.y + p2.y) / 2 + 35
              }

              return (
                <g key={index}>
                  {/* Subtle shadow layer for the thread */}
                  <path
                    d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.3)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: "blur(2px)", transform: "translate(1px, 2px)" }}
                  />
                  {/* Visual red thread line */}
                  <path
                    d={`M ${p0.x} ${p0.y} Q ${p1.x} ${p1.y} ${p2.x} ${p2.y}`}
                    fill="none"
                    stroke="#C0392B"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              )
            })}
          </svg>

          {/* Post-it Notes - Clustered around the card, desktop only */}
          {postItNotes.map((note, index) => (
            <motion.div
              key={index}
              drag
              dragMomentum={false}
              dragElastic={0.1}
              onDrag={forceUpdate}
              whileDrag={{ scale: 1.05, zIndex: 100 }}
              className="absolute hidden md:block cursor-grab active:cursor-grabbing select-none"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: postItPositions[index].x - 60, // offset half of the width (120px) to center it
                marginTop: postItPositions[index].y - 55,  // offset half of the height (110px) to center it
                x: motionValues[index].x,
                y: motionValues[index].y,
                rotate: note.rotation,
                zIndex: 20,
              }}
            >
              <PostItNote text={note.text} />
            </motion.div>
          ))}

          {/* Center Signup Card - Polaroid Style */}
          <div className="relative z-10 w-full max-w-md">
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
                <div className="mb-4 p-3 bg-red-100 border border-red-200 text-[#C0392B] rounded-lg text-xs font-medium text-center animate-fade-in">
                  {authError}
                </div>
              )}

              {/* Google Sign In */}
              <button 
                type="button"
                onClick={() => onLogin('google-dev-token', 'google-dev@example.com', {
                  name: 'Google Investigator',
                  bio: 'Investigator signed in via Google.',
                  avatar: 'detective-2',
                  themePreference: 'dark'
                })}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors mb-4 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
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
              <form className="space-y-4" onSubmit={async (e) => {
                e.preventDefault();
                setAuthError("");
                
                if (!email || !password) {
                  setAuthError("Email and password are required.");
                  return;
                }

                if (isSignup && !name.trim()) {
                  setAuthError("Display name is required.");
                  return;
                }

                const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
                const body = isSignup 
                  ? { email, password, name } 
                  : { email, password };

                try {
                  const response = await fetch(`http://localhost:5000${endpoint}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                  });

                  const data = await response.json();
                  if (!response.ok) {
                    throw new Error(data.error || "Authentication failed.");
                  }

                  onLogin(data.token, data.email, data.profile);
                } catch (err: any) {
                  setAuthError(err.message || "Connection refused by backend.");
                }
              }}>
                {isSignup && (
                  <div>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C0392B] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#A93226] transition-colors cursor-pointer"
                >
                  {isSignup ? "Sign Up" : "Begin →"}
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setAuthError("");
                    }}
                    className="text-xs text-[#8A6A00] hover:underline font-medium focus:outline-none cursor-pointer"
                  >
                    {isSignup ? "Already have an account? Log In" : "Need an account? Sign Up"}
                  </button>
                </div>
              </form>

              {/* Developer Authentication Bypass Button */}
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-4 pt-4 border-t border-[#2C2416]/10 text-center">
                  <button
                    type="button"
                    onClick={() => onLogin('dev-bypass-token', 'developer@rabbithole.ai', {
                      name: 'Developer Sandbox',
                      bio: 'Default sandbox developer profile (Bypass Mode).',
                      avatar: 'detective-1',
                      themePreference: 'dark'
                    })}
                    className="w-full py-2.5 px-4 bg-[#B8960C]/10 hover:bg-[#B8960C]/20 border border-[#B8960C] border-dashed text-[#8A6A00] font-medium rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>⚡</span> [Dev Bypass Auth]
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Post-it Notes - Grid below card */}
          <div className="md:hidden mt-8 grid grid-cols-2 gap-3">
            {postItNotes.slice(0, 4).map((note, index) => (
              <div
                key={index}
                style={{
                  width: '100%',
                  background: '#F5C842',
                  padding: '10px',
                  boxShadow: '2px 3px 0px rgba(0,0,0,0.15), 0 4px 8px rgba(0,0,0,0.2)',
                  transform: `rotate(${note.rotation}deg)`,
                  position: 'relative',
                }}
              >
                {/* Darker top edge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: '#E6B800',
                  }}
                />
                <p 
                  style={{
                    color: '#1a1a1a',
                    fontSize: 12,
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: 1.4,
                    paddingTop: 4,
                  }}
                >
                  {note.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
