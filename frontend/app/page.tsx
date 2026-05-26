"use client"

import { useState, useEffect } from "react"
import { Hero } from "@/components/hero"
import { CosmosBackground } from "@/components/cosmos-background"
import { Features } from "@/components/features"
import { VideoSection } from "@/components/video-section"
import { Footer } from "@/components/footer"
import { Search, LogOut, RefreshCw, HelpCircle, ArrowRight, User, Settings, Check, X, ShieldCheck } from "lucide-react"

const API_BASE = "http://localhost:5000"

const AVATARS = [
  { id: "detective-1", emoji: "🕵️‍♂️", label: "Senior Sleuth", color: "bg-blue-900/40 text-blue-300 border-blue-700/50" },
  { id: "detective-2", emoji: "🕵️‍♀️", label: "Intelligence Analyst", color: "bg-pink-900/40 text-pink-300 border-pink-700/50" },
  { id: "detective-3", emoji: "🕵️", label: "Cyber Investigator", color: "bg-emerald-900/40 text-emerald-300 border-emerald-700/50" },
  { id: "detective-4", emoji: "🧐", label: "The Profiler", color: "bg-purple-900/40 text-purple-300 border-purple-700/50" },
  { id: "detective-5", emoji: "🦉", label: "The Night Owl", color: "bg-amber-900/40 text-amber-300 border-amber-700/50" },
]

interface UserProfile {
  name: string
  bio: string
  avatar: string
  themePreference: string
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  // Login modal on landing page
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Profile Edit Modal States
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editName, setEditName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editAvatar, setEditAvatar] = useState("detective-1")
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileError, setProfileError] = useState("")

  // Investigation Board States
  const [topicInput, setTopicInput] = useState("")
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState("")
  const [relatedTopics, setRelatedTopics] = useState<string[]>([])
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "assistant" | "error"; text: string }[]>([])
  const [followUpInput, setFollowUpInput] = useState("")
  const [exploredList, setExploredList] = useState<string[]>([])

  // Dashboard Stats
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0)

  // Parallax Mouse Effect
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 })

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("avartak_auth_token")
    const savedEmail = localStorage.getItem("avartak_auth_email")
    if (savedToken) {
      setToken(savedToken)
      setUserEmail(savedEmail || "developer@rabbithole.ai")
      fetchUserProfile(savedToken)
    }
  }, [])

  // Parallax mouse move listener (only active when landing page is displayed)
  useEffect(() => {
    if (token) return
    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 8
      const dy = (e.clientY / window.innerHeight - 0.5) * 5
      setParallaxOffset({ x: dx, y: dy })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [token])

  // Fetch User Profile from API
  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditName(data.name)
        setEditBio(data.bio)
        setEditAvatar(data.avatar || "detective-1")
      }
    } catch (err) {
      console.error("Failed to load user profile:", err)
    }
  }

  const handleLogin = (authToken: string, email?: string, initialProfile?: any) => {
    const emailVal = email || "developer@rabbithole.ai"
    setToken(authToken)
    setUserEmail(emailVal)
    setShowLoginModal(false)
    localStorage.setItem("avartak_auth_token", authToken)
    localStorage.setItem("avartak_auth_email", emailVal)

    if (initialProfile) {
      setProfile(initialProfile)
      setEditName(initialProfile.name)
      setEditBio(initialProfile.bio)
      setEditAvatar(initialProfile.avatar || "detective-1")
    } else {
      fetchUserProfile(authToken)
    }
  }

  const handleLogout = () => {
    setToken(null)
    setUserEmail("")
    setProfile(null)
    localStorage.removeItem("avartak_auth_token")
    localStorage.removeItem("avartak_auth_email")
    // Reset app states
    setActiveTopic(null)
    setStreamText("")
    setRelatedTopics([])
    setChatHistory([])
    setExploredList([])
    setTotalQuestionsAsked(0)
  }

  // Handle Profile Update Request
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return

    setIsSavingProfile(true)
    setProfileError("")

    try {
      const response = await fetch(`${API_BASE}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          avatar: editAvatar
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.")
      }

      setProfile(data)
      setShowProfileModal(false)
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile.")
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Clear Context on Backend
  const handleClearContext = async () => {
    try {
      await fetch(`${API_BASE}/api/context/clear`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      setActiveTopic(null)
      setStreamText("")
      setRelatedTopics([])
      setChatHistory([])
    } catch (err) {
      console.error("Failed to clear context:", err)
    }
  }

  // SSE Stream handler for Topic Exploration
  const handleExploreTopic = async (topicName: string) => {
    const trimmed = topicName.trim()
    if (!trimmed || isStreaming) return

    setIsStreaming(true)
    setActiveTopic(trimmed)
    setStreamText("")
    setRelatedTopics([])
    setChatHistory([])

    try {
      const response = await fetch(`${API_BASE}/api/topic`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ topic: trimmed })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to explore topic")
      }

      if (!response.body) throw new Error("No readable body response")

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""

      if (!exploredList.includes(trimmed)) {
        setExploredList(prev => [...prev, trimmed])
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const dataStr = line.slice(6).trim()
          
          if (dataStr === "[DONE]") {
            setIsStreaming(false)
            continue
          }

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.token) {
              setStreamText(prev => prev + parsed.token)
            }
            if (parsed.relatedTopics) {
              setRelatedTopics(parsed.relatedTopics)
            }
            if (parsed.error) {
              setChatHistory(prev => [...prev, { role: "error", text: parsed.error }])
            }
          } catch (_) {
            // Ignore malformed JSON chunks
          }
        }
      }
    } catch (error: any) {
      console.error(error)
      setChatHistory(prev => [...prev, { role: "error", text: error.message || "Connection refused by backend" }])
      setIsStreaming(false)
    }
  }

  // SSE Stream handler for Ask Follow-Up Question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = followUpInput.trim()
    if (!trimmed || isStreaming || !activeTopic) return

    setFollowUpInput("")
    setIsStreaming(true)
    setTotalQuestionsAsked(prev => prev + 1)
    
    // Add user message to history
    const userMsg = { role: "user" as const, text: trimmed }
    setChatHistory(prev => [...prev, userMsg])
    
    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question: trimmed })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to ask question")
      }

      if (!response.body) throw new Error("No response stream")

      const reader = response.body.getReader()
      const decoder = new TextDecoder("utf-8")
      let buffer = ""

      // Initialize AI response history item
      setChatHistory(prev => [...prev, { role: "assistant", text: "" }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const dataStr = line.slice(6).trim()
          
          if (dataStr === "[DONE]") {
            setIsStreaming(false)
            continue
          }

          try {
            const parsed = JSON.parse(dataStr)
            if (parsed.token) {
              setChatHistory(prev => {
                const copy = [...prev]
                const last = copy[copy.length - 1]
                if (last && last.role === "assistant") {
                  last.text += parsed.token
                }
                return copy
              })
            }
            if (parsed.relatedTopics) {
              setRelatedTopics(parsed.relatedTopics)
            }
            if (parsed.error) {
              setChatHistory(prev => [...prev, { role: "error", text: parsed.error }])
            }
          } catch (_) {
            // Ignore malformed JSON chunks
          }
        }
      }
    } catch (error: any) {
      console.error(error)
      setChatHistory(prev => [...prev, { role: "error", text: error.message || "Connection refused by backend" }])
      setIsStreaming(false)
    }
  }

  // Get active avatar configurations
  const activeAvatarObj = AVATARS.find(a => a.id === (profile?.avatar || "detective-1")) || AVATARS[0]

  // Render Dashboard/Workspace if logged in
  if (token) {
    const isBypassed = token === "dev-bypass-token"
    
    return (
      <main className="min-h-screen bg-[#141210] text-[#EADEC9] font-sans flex flex-col antialiased relative">
        {/* Workspace Header */}
        <header className="border-b border-[#2C2416]/40 bg-[#1A1613] px-6 py-4 flex items-center justify-between shadow-md z-20">
          <div className="flex items-center gap-3">
            <span className="font-serif text-2xl tracking-wider text-[#F3E5AB]">Avartak</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#C0392B]/20 text-[#EA4335] border border-[#C0392B]/30 font-mono">
              Investigation Workspace
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            {/* User Profile Card Header */}
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2C2416]/30 border border-[#2C2416]/40 rounded-lg cursor-pointer hover:border-[#B8960C]/50 transition-all select-none"
            >
              <span className="text-base">{activeAvatarObj.emoji}</span>
              <span className="font-mono text-[#D7C49E] text-xs font-semibold">{profile?.name || "Investigator"}</span>
              <Settings className="w-3.5 h-3.5 text-[#B8960C]/70 ml-1" />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C0392B]/10 hover:bg-[#C0392B]/20 text-[#EA4335] rounded-lg border border-[#C0392B]/30 transition-colors text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Leave Workspace</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden z-10">
          {/* Left Panel - Control panel */}
          <aside className="w-full lg:w-80 bg-[#1A1613] border-r border-[#2C2416]/40 p-6 flex flex-col gap-6 overflow-y-auto">
            {/* Investigator Bio Card */}
            <div className="bg-[#141210] border border-[#2C2416]/30 rounded-xl p-4 flex flex-col items-center text-center relative overflow-hidden shadow-inner">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-2xl mb-2 ${activeAvatarObj.color}`}>
                {activeAvatarObj.emoji}
              </div>
              <h3 className="font-serif font-bold text-sm text-[#F3E5AB]">{profile?.name || "Investigator"}</h3>
              <p className="text-[10px] text-[#B8960C]/80 uppercase tracking-widest font-mono font-bold mt-0.5">{activeAvatarObj.label}</p>
              <p className="text-[11px] text-muted-foreground mt-2 italic line-clamp-3">
                "{profile?.bio || "New investigator in search of the truth."}"
              </p>
              {isBypassed && (
                <div className="mt-3 flex items-center gap-1 text-[9px] px-2 py-0.5 bg-[#B8960C]/10 text-[#F5C842] border border-[#B8960C]/25 rounded font-mono font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B8960C]" />
                  BYPASS ACTIVE
                </div>
              )}
            </div>

            {/* Dashboard Stats */}
            <div className="space-y-3">
              <h3 className="text-xs text-[#D7C49E] uppercase tracking-widest font-semibold border-b border-[#2C2416]/20 pb-2">
                Case Files & Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#141210] border border-[#2C2416]/20 rounded-lg p-3 text-center shadow">
                  <span className="block text-2xl font-bold font-mono text-[#F3E5AB]">{exploredList.length}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Clues Found</span>
                </div>
                <div className="bg-[#141210] border border-[#2C2416]/20 rounded-lg p-3 text-center shadow">
                  <span className="block text-2xl font-bold font-mono text-[#F3E5AB]">{totalQuestionsAsked}</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Questions</span>
                </div>
              </div>
            </div>

            {/* Exploration Input */}
            <div className="space-y-2">
              <label className="text-xs text-[#D7C49E] uppercase tracking-widest font-semibold">Explore a New Clue</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Quantum Computing..."
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (handleExploreTopic(topicInput), setTopicInput(""))}
                  className="w-full bg-[#141210] border border-[#2C2416]/60 rounded-lg pl-3 pr-10 py-2.5 text-[#EADEC9] placeholder-[#2C2416]/70 focus:outline-none focus:border-[#B8960C] transition-colors text-sm"
                />
                <button
                  onClick={() => { handleExploreTopic(topicInput); setTopicInput(""); }}
                  disabled={isStreaming}
                  className="absolute right-1.5 top-1.5 p-1 bg-[#B8960C] hover:bg-[#B8960C]/90 text-[#141210] rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Explored Topics Ledger */}
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="text-xs text-[#D7C49E] uppercase tracking-widest font-semibold border-b border-[#2C2416]/20 pb-2">
                Case Ledger ({exploredList.length})
              </h3>
              {exploredList.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">No clues documented yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[180px] lg:max-h-none">
                  {exploredList.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExploreTopic(t)}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-all truncate cursor-pointer ${
                        activeTopic === t
                          ? "bg-[#B8960C]/10 border-[#B8960C] text-[#F5C842]"
                          : "bg-[#141210] border-[#2C2416]/30 text-[#D7C49E] hover:border-[#2C2416]/70"
                      }`}
                    >
                      📁 {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Board Actions */}
            <div className="pt-4 border-t border-[#2C2416]/20 flex flex-col gap-2">
              <button
                onClick={handleClearContext}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#2C2416]/30 hover:bg-[#2C2416]/60 border border-[#2C2416]/50 text-[#D7C49E] text-xs rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Clear Active Context
              </button>
            </div>
          </aside>

          {/* Main Board Area */}
          <main className="flex-1 bg-[#120F0D] relative p-6 overflow-y-auto flex flex-col">
            {/* Corkboard Background pattern simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#2C2416_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

            {!activeTopic ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                <div className="w-16 h-16 rounded-full bg-[#2C2416]/20 border-2 border-dashed border-[#2C2416]/50 flex items-center justify-center text-[#B8960C]/70 mb-4 animate-pulse">
                  🕵️‍♂️
                </div>
                <h3 className="font-serif text-xl text-[#F3E5AB] mb-2">No Active Case</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Specify a topic in the side explorer to start streaming intel, pin polaroids, and draw related clues.
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6 z-10">
                {/* Active Case Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2C2416]/20 pb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#B8960C] font-mono">Exploring Pathway</span>
                    <h2 className="font-serif text-2xl text-[#F3E5AB]">{activeTopic}</h2>
                  </div>
                  {isStreaming && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#B8960C]/10 text-[#F5C842] rounded-full border border-[#B8960C]/30 text-xs font-mono animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#F5C842]" />
                      Receiving stream...
                    </div>
                  )}
                </div>

                {/* Evidence Board Grid Layout */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                  
                  {/* Left Column: Polaroid Evidence */}
                  <div className="xl:col-span-2 space-y-6">
                    {/* The Active Polaroid Card */}
                    <div 
                      className="relative bg-[#FDFBF7] border-[12px] border-white rounded-sm p-6 shadow-2xl text-[#2C2416] transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                      style={{ transform: "rotate(-0.5deg)" }}
                    >
                      {/* Red/Gold Pin representation */}
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#C0392B] shadow-lg z-20 flex items-center justify-center border border-[#962D22]">
                        <div className="w-1.5 h-1.5 rounded-full bg-white opacity-60 absolute top-0.5 left-0.5" />
                      </div>

                      {/* Polaroid Header */}
                      <div className="flex items-center justify-between border-b border-[#2C2416]/10 pb-3 mb-4">
                        <span className="font-mono text-xs text-[#2C2416]/60 tracking-wider">EVIDENCE CARD</span>
                        <span className="text-xs bg-[#B8960C]/20 text-[#8A6A00] font-semibold px-2 py-0.5 rounded">Active</span>
                      </div>

                      {/* Polaroid Title */}
                      <h3 className="font-serif text-xl font-bold mb-3 border-b border-[#2C2416]/5 pb-1">
                        Topic Summary: {activeTopic}
                      </h3>

                      {/* Content Stream (Dynamic) */}
                      <div className="font-sans text-sm leading-relaxed space-y-4 text-justify min-h-[150px] whitespace-pre-wrap">
                        {streamText || (isStreaming ? "Retrieving source data..." : "No data received yet.")}
                      </div>

                      {/* Polaroid bottom border/label */}
                      <div className="mt-8 pt-4 border-t border-[#2C2416]/10 flex items-center justify-between text-[11px] text-[#2C2416]/50 font-mono">
                        <span>SOURCE: OPEN ENCYCLOPEDIA</span>
                        <span>LATENCY: LOCAL DEV</span>
                      </div>
                    </div>

                    {/* Chat view/Q&A for Follow up */}
                    <div className="bg-[#1A1613] border border-[#2C2416]/40 rounded-xl p-5 shadow-lg space-y-4">
                      <h4 className="text-xs text-[#D7C49E] uppercase tracking-wider font-semibold flex items-center gap-1.5 pb-2 border-b border-[#2C2416]/20">
                        <HelpCircle className="w-4 h-4 text-[#B8960C]" />
                        Investigate Clue Deeper
                      </h4>

                      {/* Conversation Flow */}
                      {chatHistory.length > 0 && (
                        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
                          {chatHistory.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex flex-col gap-1 max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                                msg.role === "user"
                                  ? "bg-[#B8960C]/10 text-[#F5C842] border border-[#B8960C]/20 ml-auto"
                                  : msg.role === "error"
                                  ? "bg-[#C0392B]/10 text-[#EA4335] border border-[#C0392B]/20"
                                  : "bg-[#141210] text-[#EADEC9] border border-[#2C2416]/20"
                              }`}
                            >
                              <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                                {msg.role === "user" ? "Q (You)" : msg.role === "error" ? "System Error" : "Intel Assistant"}
                              </span>
                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Question Submit Form */}
                      <form onSubmit={handleAskQuestion} className="flex gap-2">
                        <input
                          type="text"
                          value={followUpInput}
                          onChange={(e) => setFollowUpInput(e.target.value)}
                          placeholder={`Ask a follow-up about "${activeTopic}"...`}
                          disabled={isStreaming}
                          className="flex-1 bg-[#141210] border border-[#2C2416]/50 rounded-lg px-3 py-2 text-xs text-[#EADEC9] placeholder-[#2C2416]/50 focus:outline-none focus:border-[#B8960C] transition-colors"
                        />
                        <button
                          type="submit"
                          disabled={isStreaming || !followUpInput.trim()}
                          className="px-4 bg-[#C0392B] hover:bg-[#C0392B]/90 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer flex items-center gap-1"
                        >
                          <span>Ask</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Right Column: Pinned Related Clues */}
                  <div className="space-y-4">
                    <h3 className="text-xs text-[#D7C49E] uppercase tracking-widest font-semibold border-b border-[#2C2416]/20 pb-2">
                      Thread Pathways (Related Clues)
                    </h3>
                    
                    {relatedTopics.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No branching clues identified yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3.5">
                        {relatedTopics.map((topic, index) => {
                          // Alternate rotations for realistic board clustering
                          const rot = (index % 3 === 0) ? -2.5 : (index % 3 === 1) ? 1.5 : -1
                          
                          return (
                            <div
                              key={index}
                              onClick={() => handleExploreTopic(topic)}
                              className="relative cursor-pointer select-none transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                              style={{ transform: `rotate(${rot}deg)` }}
                            >
                              {/* Post-it Note style yellow card */}
                              <div className="bg-[#F5C842] p-4 shadow-lg border-t-[6px] border-[#E6B800] text-[#1a1a1a]">
                                {/* Gold Pin */}
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#B8960C] shadow border border-[#9A7D0A]" />
                                
                                <div className="text-[10px] text-[#1a1a1a]/50 font-mono tracking-wider mb-1 uppercase font-semibold">BRANCH PATHWAY</div>
                                <h4 className="font-serif text-sm font-bold truncate">{topic}</h4>
                                <p className="text-[11px] mt-2 text-[#1a1a1a]/70 flex items-center gap-1">
                                  <span>Investigate Pathway</span>
                                  <ArrowRight className="w-3 h-3" />
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </main>
        </div>

        {/* Profile Settings Modal Overlay */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
            <div 
              className="bg-[#FDFBF7] border-[12px] border-white rounded-sm p-6 shadow-2xl text-[#2C2416] max-w-md w-full relative"
              style={{ transform: "rotate(-0.5deg)" }}
            >
              {/* Push pin header */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#B8960C] shadow z-10" />

              <div className="flex items-center justify-between border-b border-[#2C2416]/10 pb-2 mb-4">
                <span className="font-serif font-bold text-lg text-[#2C2416]">Profile Ledger</span>
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 hover:bg-[#2C2416]/10 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {profileError && (
                <div className="mb-3 p-2.5 bg-red-100 border border-red-200 text-[#C0392B] rounded text-xs text-center font-medium">
                  {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#2C2416]/65 block uppercase">Investigator Avatar</label>
                  <div className="flex flex-wrap gap-2 justify-center py-2">
                    {AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setEditAvatar(av.id)}
                        className={`w-10 h-10 text-xl rounded-full border-2 flex items-center justify-center transition-all ${
                          editAvatar === av.id
                            ? "border-[#B8960C] scale-110 shadow-md bg-[#B8960C]/10"
                            : "border-gray-200 bg-white hover:border-gray-400"
                        }`}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Name Input */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#2C2416]/65 block uppercase">Display Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-3 py-2 text-[#2C2416] focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all text-sm"
                  />
                </div>

                {/* Investigator Bio */}
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold text-[#2C2416]/65 block uppercase">Investigator Bio / Motto</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your case-solving motto..."
                    className="w-full bg-white border border-[#2C2416]/20 rounded-lg px-3 py-2 text-[#2C2416] focus:outline-none focus:ring-2 focus:ring-[#B8960C]/50 focus:border-[#B8960C] transition-all text-sm resize-none"
                  />
                </div>

                {/* Save Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#2C2416]/10">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-3.5 py-1.5 border border-[#2C2416]/30 text-xs rounded-lg hover:bg-[#2C2416]/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-4 py-1.5 bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-medium rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {isSavingProfile ? "Saving..." : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Update File</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    )
  }

  // Render Cosmic Landing Page if not logged in (taking visual design from test.html)
  return (
    <main className="min-h-screen relative w-full overflow-x-hidden text-[#f5f0e8] bg-[#0a0a0f] selection:bg-[#c9a84c] selection:text-[#0a0a0f] scroll-smooth">
      {/* Dynamic star/nebula canvas simulation (fixed behind all sections) */}
      <CosmosBackground />

      {/* Styled font links and custom inline CSS from test.html */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Space+Mono:wght@400;700&display=swap');
        
        .cosmic-landing {
          font-family: 'Cormorant Garamond', serif;
        }
        
        .cosmic-grain::after {
          content: '';
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          opacity: 0.4;
        }

        .rise-0 { animation: rise 1s ease forwards 0.4s; }
        .rise-1 { animation: rise 1.1s cubic-bezier(0.16,1,0.3,1) forwards 0.65s; }
        .rise-2 { animation: rise 1s ease forwards 1s; }
        .rise-3 { animation: rise 1s ease forwards 1.25s; }
        .rise-4 { animation: rise 1s ease forwards 1.5s; }
        .rise-5 { animation: rise 1s ease forwards 2s; }

        @keyframes rise {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        
        .animate-ticker {
          animation: ticker-scroll 28s linear infinite;
        }
      ` }} />

      {/* Grain texture overlay */}
      <div className="cosmic-grain" />

      {/* Scoped Cosmic Landing UI Wrapper */}
      <div className="cosmic-landing flex flex-col relative z-10 w-full">
        
        {/* Sticky transparent header from test.html */}
        <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-[8vw] py-7 z-30 select-none bg-[#0a0a0f]/40 backdrop-blur-md border-b border-[#c9a84c]/5">
          <div className="font-mono text-xs tracking-[0.25em] text-[#c9a84c] uppercase">Avartak</div>
          <ul className="flex items-center gap-10 list-none">
            <li>
              <a 
                href="#features"
                className="font-mono text-[10px] tracking-[0.18em] text-[#d4cfc6]/60 hover:text-[#c9a84c] uppercase transition-all no-underline"
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#usage"
                className="font-mono text-[10px] tracking-[0.18em] text-[#d4cfc6]/60 hover:text-[#c9a84c] uppercase transition-all no-underline"
              >
                How It Works
              </a>
            </li>
            <li>
              <a 
                href="#pricing"
                className="font-mono text-[10px] tracking-[0.18em] text-[#d4cfc6]/60 hover:text-[#c9a84c] uppercase transition-all no-underline"
              >
                Pricing
              </a>
            </li>
            <li>
              <a 
                href="#footer"
                className="font-mono text-[10px] tracking-[0.18em] text-[#d4cfc6]/60 hover:text-[#c9a84c] uppercase transition-all no-underline"
              >
                Contact
              </a>
            </li>
            <li>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="font-mono text-[10px] tracking-[0.18em] text-[#d4cfc6]/60 hover:text-[#c9a84c] uppercase transition-all bg-transparent border-none cursor-pointer"
              >
                Login
              </button>
            </li>
          </ul>
        </nav>

        {/* 1. Hero Section from test.html */}
        <section 
          id="hero-content"
          className="min-h-screen flex flex-col justify-center items-start px-[8vw] transition-transform duration-300 ease-out select-none relative z-10"
          style={{ transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)` }}
        >
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] text-[#c9a84c] uppercase mb-5 opacity-0 rise-0">
            Where curiosity finds its home
          </p>
          
          <h1 className="font-serif font-black text-[5rem] sm:text-[9rem] xl:text-[13rem] leading-[0.9] tracking-tight text-[#f5f0e8] opacity-0 rise-1">
            Avar<span className="text-[#c9a84c] italic">tak</span>
          </h1>

          <p className="font-serif italic font-light text-xl sm:text-3xl text-[#d4cfc6] mt-7 max-w-[520px] leading-relaxed opacity-0 rise-2">
            A cure to all your hunger of curiosity.
          </p>

          <p className="font-serif font-normal text-sm sm:text-[1.05rem] text-[#d4cfc6]/65 mt-4 max-w-[480px] leading-relaxed opacity-0 rise-3">
            Every question you've ever sat with. Every wonder that kept you up. Every rabbit hole you wished you could fall deeper into — this is where you begin.
          </p>

          <div className="flex items-center gap-6 mt-12 opacity-0 rise-4">
            <button 
              onClick={() => setShowLoginModal(true)}
              className="font-mono text-[11px] tracking-[0.2em] text-[#0a0a0f] bg-[#c9a84c] hover:bg-[#f5f0e8] border-none px-9 py-4 uppercase font-semibold transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-lg"
            >
              Start Exploring
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById("features");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="font-mono text-[11px] tracking-[0.2em] text-[#d4cfc6] hover:text-[#c9a84c] hover:border-[#c9a84c] bg-transparent border border-[#d4cfc6]/35 px-9 py-4 uppercase font-semibold transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </section>

        {/* Sidebar watermark indicator rotated 90deg */}
        <div className="fixed right-12 top-[50%] -translate-y-[50%] rotate-90 origin-right font-mono text-[9px] tracking-[0.3em] text-[#c9a84c]/50 uppercase select-none opacity-0 rise-5 hidden lg:block z-30">
          Est. 2025 — Kanpur, India
        </div>

        {/* 2. Draggable Features Section ("What makes Avartak different") */}
        <Features />

        {/* 3. Draggable Video Usage Section ("How to use the app") */}
        <VideoSection />

        {/* 4. Elegant Pricing Section */}
        <section id="pricing" className="py-24 px-[8vw] bg-transparent relative z-10 select-none border-t border-[#c9a84c]/10">
          <div className="max-w-5xl mx-auto">
            {/* Heading */}
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] tracking-[0.35em] text-[#c9a84c] uppercase">Clearance Licenses</span>
              <h2 className="font-serif text-4xl md:text-5xl text-[#f5f0e8] mt-2 mb-4">Choose Your Access Level</h2>
              <p className="text-[#d4cfc6]/60 text-base max-w-md mx-auto italic">
                Secure the license appropriate for your depth of curiosity.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              
              {/* Free Plan */}
              <div 
                className="relative bg-[#faf8f2] border-8 border-white p-8 shadow-xl text-[#1c1917] transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                style={{ transform: "rotate(-1deg)" }}
              >
                {/* Gold Pin */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#B8960C] shadow-md border border-[#9A7D0A] z-10" />
                
                <div>
                  <div className="font-mono text-[9px] tracking-wider uppercase text-muted-foreground mb-1">Standard Clearance</div>
                  <h3 className="font-serif text-2xl font-bold border-b border-[#1c1917]/10 pb-2 mb-4">Sleuth Plan</h3>
                  <div className="font-serif text-4xl font-extrabold mb-6">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  
                  <ul className="space-y-3.5 mb-8 text-xs font-semibold text-[#1c1917]">
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#B8960C] before:font-bold">5 Active Investigation Boards</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#B8960C] before:font-bold">Basic LLM Path Suggestions</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#B8960C] before:font-bold">Local Context Saving</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#B8960C] before:font-bold">Standard Wikipedia Data Access</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full font-mono text-[10px] tracking-wider py-3 bg-[#1c1917] hover:bg-[#B8960C] hover:text-[#1c1917] text-[#f5f0e8] uppercase font-bold transition-all cursor-pointer text-center border-none"
                >
                  Activate License
                </button>
              </div>

              {/* Pro Plan */}
              <div 
                className="relative bg-[#faf8f2] border-8 border-white p-8 shadow-xl text-[#1c1917] transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                style={{ transform: "rotate(1.5deg)" }}
              >
                {/* Gold Pin */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#C0392B] shadow-md border border-[#962D22] z-10" />
                
                <div>
                  <div className="font-mono text-[9px] tracking-wider uppercase text-[#C0392B] font-bold mb-1 flex items-center gap-1">
                    <span>★</span> Top Clearance
                  </div>
                  <h3 className="font-serif text-2xl font-bold border-b border-[#1c1917]/10 pb-2 mb-4">Master Detective</h3>
                  <div className="font-serif text-4xl font-extrabold mb-6">$9<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  
                  <ul className="space-y-3.5 mb-8 text-xs font-semibold text-[#1c1917]">
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#C0392B] before:font-bold">Unlimited Investigation Boards</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#C0392B] before:font-bold">Priority Access to Suggestion Engine</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#C0392B] before:font-bold">Advanced Context Retrieval & Deep Search</li>
                    <li className="flex items-center gap-2 before:content-['—'] before:text-[#C0392B] before:font-bold">Board Sharing & Collaboration</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full font-mono text-[10px] tracking-wider py-3 bg-[#C0392B] hover:bg-[#A93226] text-white uppercase font-bold transition-all cursor-pointer text-center border-none"
                >
                  Acquire Clearance
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Draggable Footer Section ("Contact Us" / "About Us") */}
        <Footer onOpenLogin={() => setShowLoginModal(true)} />

        {/* Infinite Scroll Ticker at the absolute bottom of page */}
        <div className="w-full border-t border-[#c9a84c]/20 bg-[#0a0a0f]/90 overflow-hidden py-3 select-none relative z-20">
          <div className="flex w-max animate-ticker">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div key={idx} className="flex gap-0">
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Explore the Unknown
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Satisfy Your Curiosity
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Dive Deeper
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Knowledge is Endless
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Ask More Questions
                </span>
                <span className="font-mono text-[10px] tracking-[0.18em] text-[#c9a84c] px-12 uppercase flex items-center gap-12 whitespace-nowrap before:content-['✦'] before:opacity-60">
                  Wonder Without Limits
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Auth modal — clean centered card, click outside to close */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Hero onLogin={handleLogin} />
          </div>
        </div>
      )}

    </main>
  )
}
