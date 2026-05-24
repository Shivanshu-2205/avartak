import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useAnimate } from "framer-motion";
import RealisticPin from "./RealisticPin";

const POLAROID_WIDTH = 160;

export default function Polaroid({ data, index = 0, onOpenComplete, hoveredId, onHover, isUnpinning, onSelectForLink, onDragUpdate }) {
  const [scope, animateEl] = useAnimate();
  const isHovered = hoveredId === data.id;
  const isDragging = useRef(false);

  const handleClick = async () => {
    if (isUnpinning || isDragging.current) return;
    
    // If we're in linking mode, intercept the click and do not unpin
    if (onSelectForLink) {
      onSelectForLink(data.id);
      return;
    }

    onHover(null);

    // Stage 1 — Pin resistance: slight pull-back jiggle
    await animateEl(scope.current, { rotate: [data.rotation, data.rotation - 2, data.rotation + 3] }, { duration: 0.12, ease: "easeInOut" });

    // Stage 2 — Pin releases: card swings/drops freely
    await animateEl(scope.current, {
      rotate: [data.rotation + 3, data.rotation - 12, data.rotation + 8, data.rotation - 4, 0],
      y: [0, 12, 6, 16, 22],
      scale: [1, 1.04, 1.02, 1.06, 1.08],
    }, {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
      times: [0, 0.2, 0.45, 0.7, 1],
    });

    // Stage 3 — Zoom to center
    onOpenComplete(data);
  };

  return (
    <motion.div
      ref={scope}
      style={{
        position: "absolute",
        left: data.x, top: data.y,
        zIndex: isUnpinning ? 80 : isHovered ? 50 : 10,
        cursor: isUnpinning ? "default" : "grab",
        transformOrigin: "50% 6px",
        opacity: isUnpinning ? 0 : 1,
      }}
      initial={{ rotate: data.rotation, y: -400, opacity: 0 }}
      animate={{
        rotate: isHovered && !isUnpinning ? 0 : data.rotation,
        y: isHovered && !isUnpinning ? -8 : 0,
        scale: isHovered && !isUnpinning ? 1.07 : 1,
        opacity: isUnpinning ? 0 : 1,
      }}
      transition={{
        type: "spring", damping: 18, stiffness: 170,
        opacity: isUnpinning
          ? { duration: 0.1, delay: 0.62 }
          : { duration: 0.4, delay: index * 0.1 },
        y: { delay: index * 0.1, type: "spring" },
      }}
      onHoverStart={() => !isUnpinning && onHover(data.id)}
      onHoverEnd={() => onHover(null)}
      onClick={handleClick}
      onPanStart={() => { isDragging.current = true; }}
      onPan={(e, info) => {
        if (!isUnpinning) {
          onDragUpdate(data.id, info.delta.x, info.delta.y);
        }
      }}
      onPanEnd={(e, info) => { 
        // Allow a tiny delay before clicks are allowed again to prevent accidental clicks after drop
        setTimeout(() => isDragging.current = false, 50); 
      }}
    >
      <RealisticPin color={data.pinColor} id={data.id} unpinning={isUnpinning} />

      {/* Drop shadow */}
      <motion.div
        animate={{ opacity: isHovered ? 0.55 : 0.28, y: isHovered ? 14 : 7 }}
        transition={{ duration: 0.3 }}
        style={{
          position: "absolute", inset: "10px 4px -6px",
          background: "rgba(0,0,0,0.55)", filter: "blur(9px)", borderRadius: 2, zIndex: -1,
        }}
      />

      {/* Card */}
      <div style={{
        width: POLAROID_WIDTH,
        background: "#faf8f2",
        border: "1px solid rgba(0,0,0,0.13)",
        padding: "10px 10px 28px",
        marginTop: 10,
      }}>
        <div style={{ width: "100%", height: 110, overflow: "hidden", position: "relative" }}>
          <img src={data.image} alt={data.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(120,80,20,0.07)" }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: "'Courier New', monospace", fontSize: 11, color: "#444", textAlign: "center", letterSpacing: 0.5 }}>
          {data.title}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 6, justifyContent: "center" }}>
          {data.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 8, background: "#e8e0d0", color: "#555",
              padding: "1px 5px", borderRadius: 2,
              letterSpacing: 0.8, textTransform: "uppercase", fontFamily: "Georgia, serif",
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
