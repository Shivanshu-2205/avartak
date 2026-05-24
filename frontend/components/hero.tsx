"use client"

const postItNotes = [
  { text: "Your thoughts, pinned.", rotation: -3 },
  { text: "The board your brain never had.", rotation: 2 },
  { text: "Pin what you find.", rotation: -4 },
  { text: "Think in rabbit holes.", rotation: 3 },
  { text: "Every great mind works a case.", rotation: -2 },
  { text: "Open an investigation.", rotation: 4 },
]

// Positions relative to center card - clustered close around it
// These offsets are from the center of the signup card
const postItPositions = [
  { x: -200, y: -180 }, // top-left, overlapping edge
  { x: 140, y: -170 },  // top-right, tucked beside
  { x: -210, y: -20 },  // left side, middle
  { x: 180, y: -30 },   // right side, middle
  { x: -180, y: 140 },  // bottom-left
  { x: 160, y: 150 },   // bottom-right
]

function PostItNote({ text, rotation }: { text: string; rotation: number }) {
  return (
    <div 
      className="relative"
      style={{ 
        width: 120,
        height: 110,
        transform: `rotate(${rotation}deg)`,
      }}
    >
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

export function Hero() {
  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Center container for signup card and clustered post-its */}
      <div className="relative z-20 min-h-screen flex items-center justify-center px-4">
        <div className="relative">
          {/* Post-it Notes - Clustered around the card, desktop only */}
          {postItNotes.map((note, index) => (
            <div
              key={index}
              className="absolute hidden md:block"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${postItPositions[index].x}px), calc(-50% + ${postItPositions[index].y}px))`,
                zIndex: 20, // All post-its in front of signup card
              }}
            >
              <PostItNote text={note.text} rotation={note.rotation} />
            </div>
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
                Open your first investigation
              </h2>

              {/* Google Sign In */}
              <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 rounded-lg px-4 py-3 font-medium hover:bg-gray-50 transition-colors mb-4">
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
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-4 py-3 text-[#2C2416] placeholder:text-[#2C2416]/40 focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C0392B] text-white rounded-lg px-4 py-3 font-medium hover:bg-[#A93226] transition-colors"
                >
                  Begin →
                </button>
              </form>
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
