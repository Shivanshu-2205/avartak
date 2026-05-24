import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { Shield, Target, Users, BookOpen, Clock, FileText } from "lucide-react";

const COMMUNITY_BOARDS = [
  { id: 1, title: "The Gold Train Heist", status: "Active", investigators: 14, lastActive: "2 hrs ago", color: "#1b0000" },
  { id: 2, title: "Missing Bank Manager", status: "Cold Case", investigators: 3, lastActive: "5 days ago", color: "#2d1f11" },
  { id: 3, title: "Saloon Brawl & Arson", status: "Closed", investigators: 8, lastActive: "1 month ago", color: "#000" },
  { id: 4, title: "The Mayor's Blackmail", status: "Active", investigators: 32, lastActive: "15 mins ago", color: "#3e2723" },
  { id: 5, title: "Cattle Rustling Ring", status: "Active", investigators: 11, lastActive: "1 day ago", color: "#1a120b" },
  { id: 6, title: "Train Robbery '89", status: "Evaluating", investigators: 2, lastActive: "2 weeks ago", color: "#120a05" },
];

export default function Community() {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    // Intro Animation with GSAP
    const ctx = gsap.context(() => {
      gsap.fromTo(elementsRef.current, 
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.1 }
      );

      gsap.to(".lantern-light", {
        opacity: "random(0.6, 1)",
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "rough({ strength: 1, points: 20, randomize: true })"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) elementsRef.current.push(el);
  };

  const woodBackground = {
    background: "#2b1a10",
    backgroundImage: `
      repeating-linear-gradient(to right, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 20px),
      radial-gradient(circle at 50% 50%, rgba(20, 10, 5, 0.4) 0%, rgba(5, 2, 0, 0.95) 100%),
      repeating-linear-gradient(8deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 15px)
    `,
    minHeight: "100vh",
    width: "100%",
    position: "relative",
    overflowX: "hidden",
    fontFamily: "'Courier Prime', monospace",
  };

  const paperCardStyle = {
    background: "#e8d8c3",
    backgroundImage: `
      linear-gradient(to bottom, transparent 95%, rgba(0,0,0,0.05) 100%),
      radial-gradient(circle at top left, transparent 80%, rgba(100,50,0,0.1) 100%)
    `,
    boxShadow: "2px 4px 15px rgba(0,0,0,0.6), inset 0 0 40px rgba(139, 69, 19, 0.15)",
    border: "1px solid #c2b29a",
    borderRadius: "2px",
    position: "relative",
  };

  return (
    <div ref={containerRef} style={woodBackground}>
      <div className="lantern-light" style={{
        position: "absolute", top: "10%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "80vw", height: "80vw",
        background: "radial-gradient(circle, rgba(255,170,50,0.12) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0
      }} />

      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
        </filter>
      </svg>
      <div style={{ position: "fixed", inset: 0, opacity: 0.15, pointerEvents: "none", filter: "url(#noise)", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Header */}
        <motion.header 
          ref={addToRefs}
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "16px 32px",
            background: "linear-gradient(to bottom, #3e2723, #1b0000)",
            border: "2px solid #5d4037",
            borderRadius: "6px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.1)",
            color: "#d7ccc8",
            marginBottom: "60px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Shield size={28} color="#c8a96e" />
            <h1 style={{ 
              fontFamily: "'Rye', cursive", margin: 0, fontSize: 26, letterSpacing: "2px",
              color: "#e6c27a", textShadow: "2px 2px 4px rgba(0,0,0,0.8)"
            }}>
              Agency Bulletin Boards
            </h1>
          </div>

          <nav style={{ display: "flex", gap: 30, alignItems: "center", fontFamily: "'Playfair Display', serif", fontSize: "16px" }}>
            <Link to="/dashboard" style={{
              color: "#c8a96e", textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#c8a96e"; }}
            >
              ← Back to Desk
            </Link>
          </nav>
        </motion.header>

        {/* Boards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "40px" }}>
          {COMMUNITY_BOARDS.map((board) => (
            <Link 
              to="/crime-board" 
              key={board.id} 
              style={{ textDecoration: "none" }}
            >
              <motion.div 
                ref={addToRefs}
                whileHover={{ scale: 1.03, y: -5, boxShadow: "5px 15px 30px rgba(0,0,0,0.9)" }}
                style={{
                  ...paperCardStyle,
                  padding: "30px",
                  display: "flex", flexDirection: "column",
                  cursor: "pointer",
                  background: "#f4eedd", // slightly brighter paper
                }}
              >
                {/* Board Top Accent / Pin */}
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 40, height: 16, background: "rgba(0,0,0,0.2)", borderRadius: "2px" }} />
                <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 36, height: 12, background: "#800000", border: "1px solid #4a0000", borderRadius: "2px" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #5a3d1c", paddingBottom: 12, marginBottom: 16 }}>
                  <span style={{ fontFamily: "'Courier Prime', monospace", fontSize: 12, color: "#800000", fontWeight: "bold" }}>CASE #{1000 + board.id}</span>
                  <span style={{ 
                    fontFamily: "Georgia, serif", fontSize: 10, padding: "2px 6px", 
                    color: board.status === "Active" ? "#d32f2f" : board.status === "Closed" ? "#388e3c" : "#555",
                    border: `1px solid ${board.status === "Active" ? "#d32f2f" : board.status === "Closed" ? "#388e3c" : "#555"}`
                  }}>
                    {board.status}
                  </span>
                </div>

                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 20px 0", color: "#2d1f11", lineHeight: 1.2 }}>
                  {board.title}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto", fontFamily: "'Courier Prime', monospace", fontSize: 13, color: "#5a3d1c" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Users size={16} /> {board.investigators} Active Agents
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Clock size={16} /> Last Intel: {board.lastActive}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} /> {Math.floor(Math.random() * 40 + 5)} Linked Documents
                  </div>
                </div>

                <div style={{ marginTop: 24, textAlign: "center", fontFamily: "Georgia, serif", fontSize: 12, color: "#800000", fontStyle: "italic", opacity: 0.8 }}>
                  Click to Examine Board
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
