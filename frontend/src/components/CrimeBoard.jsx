import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SVGThreads from "./SVGThreads";
import Polaroid from "./Polaroid";
import NewspaperModal from "./NewspaperModal";
import { POLAROIDS } from "./data";

export default function CrimeBoard({ polaroids, setPolaroids, activeTopic, isStreaming, onExplore, onAsk, onClear }) {
  const [selected, setSelected] = useState(null);
  const [boardSearch, setBoardSearch] = useState("");
  const [unpinningId, setUnpinningId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  
  // Linking state
  const [linkMode, setLinkMode] = useState(false);
  const [linkStartId, setLinkStartId] = useState(null);

  const handleOpenComplete = (polaroid) => {
    setUnpinningId(polaroid.id);
    setTimeout(() => {
      setSelected(polaroid);
      setUnpinningId(null);
    }, 120);
  };

  const handleClose = () => {
    setSelected(null);
  };

  const handleAddPolaroid = () => {
    const newId = Math.max(...polaroids.map(p => p.id), 0) + 1;
    // place near the center of the 800x600 board with some randomness
    const newX = 320 + (Math.random() * 60 - 30);
    const newY = 220 + (Math.random() * 60 - 30);
    
    const possibleImages = [
      "https://images.unsplash.com/photo-1582298538104-efa9cb1052ce?w=300&q=80",
      "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80",
      "https://images.unsplash.com/photo-1515474594679-6a66b7fdcbe4?w=300&q=80",
    ];

    const newDoc = {
      id: newId,
      title: "Evidence #" + newId,
      image: possibleImages[newId % possibleImages.length],
      tags: ["Pending"],
      x: newX, y: newY,
      description: "Recently acquired evidence from the field. Awaiting review.",
      connections: [],
      rotation: Math.random() * 12 - 6,
      pinColor: "#8b6e4e", // Neutral brown pin
    };
    
    setPolaroids([...polaroids, newDoc]);
  };

  const handleSelectForLink = (id) => {
    if (!linkMode) return;
    
    if (!linkStartId) {
      // First click: select the origin
      setLinkStartId(id);
    } else {
      // Second click: select the target and draw thread
      if (linkStartId !== id) {
        setPolaroids(prev => prev.map(p => {
          if (p.id === linkStartId) {
            if (!p.connections.includes(id)) {
              return { ...p, connections: [...p.connections, id] };
            }
          }
          return p;
        }));
      }
      setLinkStartId(null);
      setLinkMode(false);
    }
  };

  return (
    <div style={{
      width: "100%", height: "100vh", minHeight: 600,
      position: "relative", overflow: "hidden",
      background: "#17120d",
      backgroundImage: `
        radial-gradient(ellipse at 15% 15%, rgba(70,40,15,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 85%, rgba(50,25,8,0.6) 0%, transparent 55%),
        repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px),
        repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.012) 39px, rgba(255,255,255,0.012) 40px)
      `,
      fontFamily: "Georgia, serif",
    }}>
      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(6,4,2,0.92)",
        borderBottom: "1px solid rgba(180,100,30,0.25)",
        padding: "10px 24px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c0392b", boxShadow: "0 0 8px #c0392b99" }} />
        <span style={{ color: "#c8a96e", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
          Evidence Board · Case #4471 · Active Investigation
        </span>
        <div style={{ flex: 1 }} />
        
        {/* Navigation Link to Dashboard */}
        <Link to="/dashboard" style={{
          color: "#aaa", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", 
          textDecoration: "none", transition: "color 0.2s", cursor: "pointer",
          marginRight: "16px"
        }}
        onMouseEnter={(e) => e.target.style.color = "#fff"}
        onMouseLeave={(e) => e.target.style.color = "#aaa"}>
          ← Back to Dashboard
        </Link>

        <span style={{ color: "#555", fontSize: 10, letterSpacing: 2 }}>CLASSIFIED</span>
      </div>

      {/* Centered Board Content */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800,
        height: 600,
      }}>
        {/* Threads */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          <SVGThreads polaroids={polaroids} activePolaroid={hoveredId || linkStartId} unpinningId={unpinningId} />
        </div>

        {/* Polaroids */}
        <div style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          {polaroids.map((p, i) => (
            <Polaroid
              key={p.id}
              data={p}
              index={i}
              onOpenComplete={handleOpenComplete}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              isUnpinning={unpinningId === p.id}
              onSelectForLink={linkMode ? () => handleSelectForLink(p.id) : null}
              onDragUpdate={(id, dx, dy) => {
                setPolaroids(prev => prev.map(item => 
                  item.id === id ? { ...item, x: item.x + dx, y: item.y + dy } : item
                ));
              }}
            />
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 16, zIndex: 110,
        background: "linear-gradient(to bottom, #3e2723, #1b0000)", padding: "12px 24px",
        borderRadius: 8, border: "2px solid #5d4037",
        boxShadow: "0 8px 32px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.1)"
      }}>
        {/* Topic search transmitter */}
        <form onSubmit={(e) => {
          e.preventDefault();
          if (boardSearch.trim() && !isStreaming) {
            onExplore(boardSearch.trim());
            setBoardSearch("");
          }
        }} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="text"
            placeholder="Transmit topic..."
            value={boardSearch}
            onChange={(e) => setBoardSearch(e.target.value)}
            disabled={isStreaming}
            style={{
              padding: "6px 12px",
              background: "rgba(0,0,0,0.45)",
              border: "1px solid #795548",
              color: "#e6c27a",
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12,
              outline: "none",
              width: 150,
              borderRadius: 3,
            }}
          />
          <button
            type="submit"
            disabled={isStreaming || !boardSearch.trim()}
            style={{
              background: "transparent", color: "#e6c27a", border: "1px solid #795548",
              padding: "6px 12px", borderRadius: 3, cursor: "pointer", fontFamily: "'Courier Prime', monospace",
              transition: "all 0.2s",
              opacity: boardSearch.trim() ? 1 : 0.6
            }}
            onMouseEnter={(e) => { if (boardSearch.trim()) { e.currentTarget.style.background = "#5d4037"; e.currentTarget.style.color = "#fff"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e6c27a"; }}
          >
            Go
          </button>
        </form>

        <div style={{ width: 1, height: 28, background: "#5d4037" }} />

        <button 
          onClick={handleAddPolaroid}
          style={{
            background: "transparent", color: "#e6c27a", border: "1px solid #795548",
            padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier Prime', monospace",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#5d4037"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e6c27a"; }}
        >
          Add Evidence
        </button>
        <button 
          onClick={() => { setLinkMode(!linkMode); setLinkStartId(null); }}
          style={{
            background: linkMode ? "#7b3a0e" : "transparent", 
            color: linkMode ? "#fff" : "#e6c27a", 
            border: "1px solid #795548",
            padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier Prime', monospace",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { 
            if(!linkMode) {
              e.currentTarget.style.background = "#5d4037"; 
              e.currentTarget.style.color = "#fff"; 
            }
          }}
          onMouseLeave={(e) => { 
            if(!linkMode) {
              e.currentTarget.style.background = "transparent"; 
              e.currentTarget.style.color = "#e6c27a"; 
            }
          }}
        >
          {linkMode ? (linkStartId ? "Select Target..." : "Cancel Link Mode") : "Draw Thread Mode"}
        </button>

        <div style={{ width: 1, height: 28, background: "#5d4037" }} />

        <button 
          onClick={onClear}
          style={{
            background: "transparent", color: "#e6c27a", border: "1px solid #795548",
            padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontFamily: "'Courier Prime', monospace",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#5d4037"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#e6c27a"; }}
        >
          Reset Board
        </button>
      </div>

      {/* Hint */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
        style={{
          position: "absolute", bottom: 15, left: "50%", transform: "translateX(-50%)",
          color: "rgba(200,169,110,0.4)", fontSize: 10, letterSpacing: 2,
          textTransform: "uppercase", zIndex: 100, pointerEvents: "none", whiteSpace: "nowrap",
        }}
      >
        Click a polaroid to examine the evidence
      </motion.div>

      {/* Newspaper modal */}
      <AnimatePresence>
        {selected && (
          <NewspaperModal 
            polaroid={polaroids.find(p => p.id === selected.id) || selected} 
            onClose={handleClose} 
            activeTopic={activeTopic}
            isStreaming={isStreaming}
            onExplore={onExplore}
            onAsk={onAsk}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
