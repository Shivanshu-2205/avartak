import { motion } from "framer-motion";

const POLAROID_WIDTH = 160;

function getPinCenter(p) {
  return { x: p.x + POLAROID_WIDTH / 2, y: p.y + 6 };
}

export default function SVGThreads({ polaroids, activePolaroid, unpinningId }) {
  const paths = [];
  polaroids.forEach((p) => {
    p.connections.forEach((targetId) => {
      const target = polaroids.find((q) => q.id === targetId);
      if (!target) return;
      const from = getPinCenter(p);
      const to = getPinCenter(target);
      const isActive = activePolaroid === p.id || activePolaroid === targetId;
      const isUnpinning = unpinningId === p.id || unpinningId === targetId;

      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
      const sag = Math.min(dist * 0.2, 70);
      const d = `M ${from.x} ${from.y} Q ${mx} ${my + sag} ${to.x} ${to.y}`;

      paths.push(
        <g key={`${p.id}-${targetId}`}>
          <path d={d} fill="none" stroke="rgba(0,0,0,0.55)"
            strokeWidth={isActive ? 4.5 : 3.2} strokeLinecap="round"
            style={{ transform: "translateY(2.5px)", transition: "stroke-width 0.3s" }}
          />
          <motion.path d={d} fill="none" strokeLinecap="round"
            animate={{
              stroke: isUnpinning ? "#ff6644" : isActive ? "#ff2f1f" : "#8b1a0a",
              strokeWidth: isActive ? 2.4 : 1.6,
              strokeOpacity: isUnpinning ? 0.3 : isActive ? 1 : 0.82,
              strokeDasharray: isUnpinning ? "4 6" : "none",
            }}
            transition={{ duration: 0.3 }}
            style={{ filter: isActive && !isUnpinning ? "drop-shadow(0 0 5px #e74c3cbb)" : "none" }}
          />
          <path d={d} fill="none"
            stroke={isActive ? "rgba(255,150,130,0.65)" : "rgba(190,70,50,0.22)"}
            strokeWidth={0.7} strokeLinecap="round"
            style={{ transition: "stroke 0.3s" }}
          />
        </g>
      );
    });
  });

  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2, overflow: "visible" }}>
      {paths}
    </svg>
  );
}
