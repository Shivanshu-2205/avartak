import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { User, Users, Shield, Target, BookOpen, Coffee, MapPin } from "lucide-react";

export default function Dashboard({ activeTopic, isStreaming, onExplore, onClear, polaroids }) {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);
  const navigate = useNavigate();
  const [topicInput, setTopicInput] = useState("");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (topicInput.trim()) {
      onExplore(topicInput.trim());
      setTopicInput("");
      navigate("/crime-board");
    }
  };

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Rye&family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;1,400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Initial Intro Animation with GSAP
    const ctx = gsap.context(() => {
      gsap.fromTo(elementsRef.current, 
        { y: 50, opacity: 0, rotation: () => Math.random() * 10 - 5 },
        { y: 0, opacity: 1, rotation: 0, duration: 1.2, stagger: 0.15, ease: "back.out(1.2)", delay: 0.2 }
      );

      // Flickering lantern effect
      gsap.to(".lantern-light", {
        opacity: "random(0.7, 1)",
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        ease: "rough({ template: none.out, strength: 1, points: 20, taper: none, randomize: true, clamp: false })"
      });
    }, containerRef);

    return () => {
      ctx.revert();
      document.head.removeChild(link);
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  // Realistic Wood Background styling
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

  // Old Paper/Card Styling
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
      {/* Background Lantern Glow */}
      <div className="lantern-light" style={{
        position: "absolute", top: "20%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(255,170,50,0.15) 0%, transparent 60%)",
        pointerEvents: "none", zIndex: 0
      }} />

      {/* SVG Noise filter for true grit */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch" />
          <feBlend mode="multiply" in="SourceGraphic" in2="blurOut" />
        </filter>
      </svg>
      <div style={{ position: "fixed", inset: 0, opacity: 0.15, pointerEvents: "none", filter: "url(#noise)", zIndex: 1 }} />

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
        
        {/* Navigation / Header - designed like a leather strap or engraved plaque */}
        <motion.header 
          ref={addToRefs}
          whileHover={{ scale: 1.01 }}
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
              Pinkerton Agency Desk
            </h1>
          </div>

          <nav style={{ display: "flex", gap: 30, alignItems: "center", fontFamily: "'Playfair Display', serif", fontSize: "16px" }}>
            <Link to="/crime-board" style={{
              color: "#c8a96e", textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              borderBottom: "1px dashed transparent", transition: "all 0.3s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderBottom = "1px dashed #fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#c8a96e"; e.currentTarget.style.borderBottom = "1px dashed transparent"; }}
            >
              <Target size={18} />
              Open Crime Board
            </Link>
            
            <div style={{ width: 1, height: 20, background: "#5d4037" }} />
            
            <Link to="/community" style={{
              color: "#c8a96e", textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
              borderBottom: "1px dashed transparent", transition: "all 0.3s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderBottom = "1px dashed #fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#c8a96e"; e.currentTarget.style.borderBottom = "1px dashed transparent"; }}
            >
              <Users size={18} />
              Agency Boards (Community)
            </Link>
            
            <div style={{ width: 1, height: 20, background: "#5d4037" }} />
            
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#a1887f" }}>
              <Coffee size={18} />
              <span>Logbook</span>
            </div>
          </nav>
        </motion.header>

        {/* Main Content Dashboard */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>
          
          {/* User Profile - Wanted Poster Style */}
          <motion.div 
            ref={addToRefs}
            whileHover={{ rotate: -1, scale: 1.02 }}
            style={{
              ...paperCardStyle,
              padding: "30px",
              display: "flex", flexDirection: "column", alignItems: "center",
              transformOrigin: "top center",
            }}
          >
            {/* Pin */}
            <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 12, height: 12, background: "radial-gradient(circle, #888, #222)", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.5)" }} />
            
            <h2 style={{ fontFamily: "'Rye', cursive", fontSize: 42, margin: "0 0 10px 0", color: "#3c2813", letterSpacing: "5px" }}>WANTED</h2>
            <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: "#5a3d1c", marginBottom: 20 }}>For Lead Investigation</div>
            
            <div style={{ 
              width: "100%", aspectRatio: "1/1", 
              background: "#d1c4ae", border: "3px solid #3c2813",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20, position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)" }} />
              <User size={80} color="#5a3d1c" style={{ filter: "drop-shadow(2px 4px 4px rgba(0,0,0,0.2))" }} />
              <div style={{ position: "absolute", bottom: 10, right: 10, fontSize: 12, fontWeight: "bold", color: "#8a2be2", transform: "rotate(-15deg)", border: "2px solid #8a2be2", padding: "2px 6px", opacity: 0.6 }}>APPROVED</div>
            </div>

            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 10px 0", color: "#2d1f11" }}>Agent John Doe</h3>
            <div style={{ width: "100%", height: 1, background: "#8b6e4e", margin: "10px 0" }} />
            
            <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%", fontSize: 14, color: "#3c2813", lineHeight: 1.8 }}>
              <li><strong>Bounty:</strong> $10,000 (Allocated)</li>
              <li><strong>Region:</strong> Western Territory</li>
              <li><strong>Status:</strong> Active on Case #4471</li>
              <li><strong>Alias:</strong> "The Hawk"</li>
            </ul>
          </motion.div>

          {/* Active Cases / Reports / Documents */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {activeTopic ? (
              <motion.div 
                ref={addToRefs}
                whileHover={{ y: -5, boxShadow: "5px 15px 30px rgba(0,0,0,0.8)" }}
                style={{
                  ...paperCardStyle,
                  padding: "40px",
                  transform: "rotate(1deg)",
                  background: "#f5edd6",
                }}
              >
                 <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 15px 0", color: "#800000", borderBottom: "2px solid #800000", paddingBottom: 10, display: "flex", justifyContent: "space-between" }}>
                   <span>Active Investigation Case</span>
                   <span style={{ fontSize: 11, padding: "2px 6px", border: "1px solid #800000", letterSpacing: 1 }}>
                     {isStreaming ? "TRANSMITTING..." : "OPEN CASE"}
                   </span>
                 </h2>
                 <div style={{ fontFamily: "'Courier Prime', monospace", fontSize: 13, color: "#3c2813", lineHeight: 1.6, marginBottom: 20 }}>
                   <div style={{ fontWeight: "bold", marginBottom: 5 }}>SUBJECT: {activeTopic.toUpperCase()}</div>
                   <div style={{ fontSize: 11, color: "#666", marginBottom: 10 }}>TELEGRAPH INTELLIGENCE INCIDENT</div>
                   <div style={{ fontStyle: "italic", borderLeft: "2px solid #800000", paddingLeft: 10, maxHeight: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                     {polaroids.find(p => p.title.toLowerCase() === activeTopic.toLowerCase())?.description?.slice(0, 180) || "Establishing telegraph connection. Retrieving external archives..."}
                     {(polaroids.find(p => p.title.toLowerCase() === activeTopic.toLowerCase())?.description?.length > 180) && "..."}
                   </div>
                 </div>
                 
                 <div style={{ display: "flex", gap: 15 }}>
                    <button 
                      onClick={() => navigate("/crime-board")}
                      style={{
                        padding: "10px 20px", background: "#800000", color: "#e8d8c3",
                        border: "none", fontFamily: "'Courier Prime', monospace", cursor: "pointer",
                        boxShadow: "2px 2px 0px rgba(0,0,0,0.5)", transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#a01e0c"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#800000"; }}
                    >
                      Go to Crime Board
                    </button>
                    <button 
                      onClick={onClear}
                      style={{
                        padding: "10px 20px", background: "transparent", color: "#3c2813",
                        border: "1px solid #3c2813", fontFamily: "'Courier Prime', monospace", cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#e0cfb8"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      Archive Case
                    </button>
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                ref={addToRefs}
                whileHover={{ y: -5, boxShadow: "5px 15px 30px rgba(0,0,0,0.8)" }}
                style={{
                  ...paperCardStyle,
                  padding: "40px",
                  transform: "rotate(1deg)",
                  background: "#f0eade",
                }}
              >
                 <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, margin: "0 0 15px 0", color: "#2d1f11", borderBottom: "2px solid #3c2813", paddingBottom: 10 }}>Transmit Case Inquiry</h2>
                 <p style={{ marginTop: 0, color: "#5a3d1c", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                   Enter a subject or historical concept to dispatch a Pinkerton inquiry. The telegraph office will search Wikipedia &amp; DuckDuckGo to compile a dynamic web of clues.
                 </p>
                 <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", width: "100%" }}>
                   <input
                     type="text"
                     placeholder="e.g. Butch Cassidy, Black Holes, Railroad Strike"
                     value={topicInput}
                     onChange={(e) => setTopicInput(e.target.value)}
                     style={{
                       flex: 1, minWidth: 200,
                       padding: "10px 14px",
                       background: "#faf8f2",
                       border: "1px solid #8b6e4e",
                       color: "#1a1208",
                       fontFamily: "'Courier Prime', monospace",
                       fontSize: 13,
                       borderRadius: "2px",
                       boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                       outline: "none"
                     }}
                   />
                   <button 
                     type="submit"
                     disabled={!topicInput.trim()}
                     style={{
                       padding: "10px 20px", background: "#3c2813", color: "#e8d8c3",
                       border: "none", fontFamily: "'Courier Prime', monospace", cursor: "pointer",
                       boxShadow: "2px 2px 0px rgba(0,0,0,0.5)", transition: "all 0.2s",
                       opacity: topicInput.trim() ? 1 : 0.6,
                     }}
                     onMouseEnter={(e) => { if(topicInput.trim()) { e.currentTarget.style.transform = "translate(1px, 1px)"; e.currentTarget.style.boxShadow = "1px 1px 0px rgba(0,0,0,0.5)"; } }}
                     onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0, 0)"; e.currentTarget.style.boxShadow = "2px 2px 0px rgba(0,0,0,0.5)"; }}
                   >
                     Transmit
                   </button>
                 </form>
              </motion.div>
            )}

            {/* Minor Documents Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
              {[
                { title: "Sheriff's Log", date: "Oct 14, 1899", icon: <BookOpen size={20} /> },
                { title: "Map Locations", date: "Oct 15, 1899", icon: <MapPin size={20} /> }
              ].map((doc, i) => (
                <motion.div 
                  key={i}
                  ref={addToRefs}
                  whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? -2 : 2, zIndex: 20 }}
                  style={{
                    ...paperCardStyle,
                    padding: "20px",
                    transform: `rotate(${i % 2 === 0 ? '-2deg' : '3deg'})`,
                    display: "flex", flexDirection: "column", gap: 10,
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#5a3d1c" }}>
                    {doc.icon}
                    <span style={{ fontSize: 12 }}>{doc.date}</span>
                  </div>
                  <h4 style={{ fontFamily: "'Playfair Display', serif", margin: "10px 0 0 0", fontSize: 18, color: "#2d1f11" }}>
                    {doc.title}
                  </h4>
                  <div style={{ width: 40, height: 2, background: "#800000", marginTop: 5 }} />
                </motion.div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
