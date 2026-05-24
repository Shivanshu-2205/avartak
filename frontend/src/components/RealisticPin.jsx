import { motion } from "framer-motion";

function darken(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.round(255 * amount));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export default function RealisticPin({ color, id, unpinning = false }) {
  const gradId = `ps-${id}`;
  const shaftId = `sh-${id}`;
  return (
    <motion.div
      style={{
        position: "absolute",
        top: -16, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        pointerEvents: "none",
        originX: "50%", originY: "100%",
      }}
      animate={unpinning ? {
        y: [-2, -18, -14],
        rotate: [0, -8, 5, 0],
        scale: [1, 1.15, 1.05],
      } : { y: 0, rotate: 0, scale: 1 }}
      transition={unpinning ? {
        duration: 0.45,
        times: [0, 0.5, 1],
        ease: "easeOut",
      } : { duration: 0.2 }}
    >
      <svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id={gradId} cx="35%" cy="28%" r="68%">
            <stop offset="0%" stopColor="white" stopOpacity="0.75" />
            <stop offset="25%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={darken(color, 0.55)} stopOpacity="1" />
          </radialGradient>
          <linearGradient id={shaftId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#777" />
            <stop offset="35%" stopColor="#e0e0e0" />
            <stop offset="65%" stopColor="#aaa" />
            <stop offset="100%" stopColor="#666" />
          </linearGradient>
        </defs>
        <ellipse cx="12" cy="20" rx="7" ry="2.2" fill="rgba(0,0,0,0.32)" />
        <polygon points="11,18 13,18 13.5,31 10.5,31" fill={`url(#${shaftId})`} />
        <ellipse cx="12" cy="31" rx="1.2" ry="0.55" fill="#3a3a3a" />
        <circle cx="12" cy="11" r="10" fill={`url(#${gradId})`} />
        <circle cx="12" cy="11" r="10" fill="none" stroke={darken(color, 0.6)} strokeWidth="0.8" />
        <ellipse cx="8.5" cy="7.5" rx="3.5" ry="2.2" fill="white" opacity="0.4" />
        <circle cx="7.8" cy="7" r="1.4" fill="white" opacity="0.7" />
      </svg>
    </motion.div>
  );
}
