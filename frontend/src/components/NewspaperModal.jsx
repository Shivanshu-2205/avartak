import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Strip the "### Related Exploration Paths" section from description
function getCleanDescription(text) {
  if (!text) return "";
  const markers = [
    "### Related Exploration Paths",
    "## Related Exploration Paths",
    "Related Exploration Paths",
    "### Related Topics",
  ];
  for (const marker of markers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) return text.slice(0, idx).trim();
  }
  return text.trim();
}

export default function NewspaperModal({
  polaroid,
  onClose,
  activeTopic,
  isStreaming,
  onExplore,
  onAsk,
}) {
  const [mode, setMode] = useState("article"); // 'article' | 'followup'
  const [followUpText, setFollowUpText] = useState("");
  const followUpRef = useRef(null);
  const chatRef = useRef(null);

  const isSelfActive =
    activeTopic && polaroid.title.toLowerCase() === activeTopic.toLowerCase();
  const hasContent = polaroid.description && polaroid.description.trim().length > 0;
  const cleanDescription = getCleanDescription(polaroid.description || "");

  // Follow-up messages: everything after the first assistant message (the article)
  const followUpMessages = polaroid.chatHistory
    ? polaroid.chatHistory.slice(1)
    : [];

  // Auto-focus the follow-up input when mode switches
  useEffect(() => {
    if (mode === "followup" && followUpRef.current) {
      followUpRef.current.focus();
    }
  }, [mode]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [followUpMessages]);

  const handleSuggestions = () => {
    if (isStreaming || !isSelfActive) return;
    onAsk(
      "Based on what you've told me, suggest 3 to 5 specific related topics or angles I should investigate next. Format them as a concise numbered list."
    );
    setMode("article");
  };

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!followUpText.trim() || isStreaming || !isSelfActive) return;
    onAsk(followUpText.trim());
    setFollowUpText("");
    setMode("article");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(8,5,2,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(8px)",
        padding: "20px",
      }}
    >
      <style>{`
        @keyframes blink-cursor { 50% { opacity: 0; } }
        @keyframes fade-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .newspaper-modal::-webkit-scrollbar { width: 5px; }
        .newspaper-modal::-webkit-scrollbar-track { background: #ede8dc; }
        .newspaper-modal::-webkit-scrollbar-thumb { background: #8b6e4e; border-radius: 3px; }
      `}</style>

      <motion.div
        initial={{ scale: 0.3, rotate: (polaroid.rotation || 0) * 2, opacity: 0, y: 40 }}
        animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
        exit={{ scale: 0.2, rotate: (polaroid.rotation || 0) * -2, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 28, stiffness: 280, opacity: { duration: 0.15 } }}
        onClick={(e) => e.stopPropagation()}
        className="newspaper-modal"
        style={{
          width: 700,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#f8f3e8",
          fontFamily: "Georgia, 'Times New Roman', serif",
          position: "relative",
          boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(0,0,0,0.15)",
        }}
      >
        {/* Paper texture overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(0,0,0,0.035) 23px, rgba(0,0,0,0.035) 24px),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")
          `,
        }} />

        {/* Close Button */}
        <motion.button
          whileHover={{ scale: 1.1, background: "#2d1f11" }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14, zIndex: 20,
            width: 30, height: 30, borderRadius: "50%",
            background: "#1a1a1a", color: "#f8f3e8", border: "none",
            cursor: "pointer", fontSize: 17, display: "flex",
            alignItems: "center", justifyContent: "center", lineHeight: 1,
          }}
        >×</motion.button>

        {/* ── NEWSPAPER HEADER ── */}
        <div style={{ padding: "20px 28px 0", position: "relative", zIndex: 3 }}>
          {/* Top rule & meta */}
          <div style={{ borderTop: "4px double #1a1a1a", paddingTop: 6, marginBottom: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: 2.5, textTransform: "uppercase", color: "#666" }}>
              <span>Pinkerton Intelligence · Case File</span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {isSelfActive && isStreaming && (
                  <span style={{ color: "#800000", fontWeight: "bold", animation: "fade-up 0.3s ease" }}>
                    ● LIVE DISPATCH
                  </span>
                )}
                <span>Vol. XLVII · CLASSIFIED</span>
              </span>
            </div>
          </div>

          {/* Title */}
          <div style={{ borderTop: "1px solid #1a1a1a", borderBottom: "3px double #1a1a1a", padding: "10px 0 8px" }}>
            <h1 style={{
              fontSize: 30, fontWeight: 900, textTransform: "uppercase",
              letterSpacing: 1.5, margin: 0, lineHeight: 1.0, color: "#0d0d0d",
              fontFamily: "'Playfair Display', 'Times New Roman', serif",
            }}>
              {polaroid.title}
            </h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {(polaroid.tags || []).map((t) => (
                <span key={t} style={{
                  fontSize: 9, border: "1px solid #5a3d1c", padding: "1px 6px",
                  letterSpacing: 1.2, textTransform: "uppercase", color: "#5a3d1c",
                  background: "rgba(90,61,28,0.06)",
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── ARTICLE BODY ── */}
        <div style={{ padding: "16px 28px 0", position: "relative", zIndex: 3 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

            {/* Left column: image */}
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: 170, height: 130,
                border: "2px solid #1a1a1a", overflow: "hidden",
                filter: "sepia(30%) contrast(1.05)",
                position: "relative",
                boxShadow: "3px 3px 0 rgba(0,0,0,0.25)",
              }}>
                <img
                  src={polaroid.image}
                  alt={polaroid.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {/* Photo label */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.72)", padding: "3px 8px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: 8, color: "#ccc", letterSpacing: 1, textTransform: "uppercase" }}>
                    Exhibit {String((polaroid.id || 1) % 1000).padStart(3, "0")}
                  </span>
                  <span style={{ fontSize: 8, color: "#aaa" }}>◆</span>
                </div>
              </div>

              {/* Caption below image */}
              <div style={{
                width: 170, marginTop: 6, fontSize: 9.5, fontStyle: "italic",
                color: "#5a3d1c", lineHeight: 1.4, textAlign: "center",
                borderTop: "1px solid #c2b29a", paddingTop: 4,
              }}>
                Evidence under active investigation.
              </div>
            </div>

            {/* Right column: article text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                color: "#666", borderBottom: "1px solid #c2b29a",
                paddingBottom: 4, marginBottom: 10,
                display: "flex", justifyContent: "space-between",
              }}>
                <span>Field Dispatch</span>
                <span style={{ fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>
                  {isSelfActive && isStreaming ? "Receiving…" : "Received"}
                </span>
              </div>

              {hasContent ? (
                <p style={{
                  fontSize: 13.5, lineHeight: 1.75, color: "#1a1208",
                  margin: 0, textAlign: "justify",
                  fontFamily: "Georgia, serif",
                }}>
                  {cleanDescription}
                  {isSelfActive && isStreaming && (
                    <span style={{
                      display: "inline-block", width: 7, height: 13,
                      background: "#800000", marginLeft: 3,
                      animation: "blink-cursor 0.9s step-end infinite",
                      verticalAlign: "middle",
                    }} />
                  )}
                </p>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  {isSelfActive && isStreaming ? (
                    <p style={{ color: "#800000", fontStyle: "italic", fontSize: 13 }}>
                      Awaiting telegraph dispatch
                      <span style={{
                        display: "inline-block", width: 7, height: 13,
                        background: "#800000", marginLeft: 4,
                        animation: "blink-cursor 0.9s step-end infinite",
                        verticalAlign: "middle",
                      }} />
                    </p>
                  ) : (
                    <>
                      <p style={{ color: "#888", fontStyle: "italic", fontSize: 12.5, marginBottom: 14 }}>
                        No intelligence filed for this pathway.
                      </p>
                      <motion.button
                        onClick={() => { onExplore(polaroid.title, polaroid.id); onClose(); }}
                        whileHover={{ scale: 1.04, background: "#800000", color: "#f8f3e8" }}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          padding: "8px 20px", border: "1.5px solid #800000",
                          background: "transparent", color: "#800000",
                          fontFamily: "Georgia, serif", fontSize: 11,
                          letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        ▷ Investigate this Clue
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FOLLOW-UP CHAT THREAD ── */}
        {followUpMessages.length > 0 && (
          <div
            ref={chatRef}
            style={{
              margin: "16px 28px 0",
              borderTop: "1px solid #c2b29a",
              paddingTop: 12,
              maxHeight: 220,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              position: "relative",
              zIndex: 3,
            }}
          >
            <div style={{ fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#666", marginBottom: 4 }}>
              Telegraph Exchange
            </div>
            {followUpMessages.map((msg, i) => (
              <div
                key={msg.id || i}
                style={{
                  borderLeft: `3px solid ${msg.role === "user" ? "#5a3d1c" : msg.role === "error" ? "#c0392b" : "#800000"}`,
                  paddingLeft: 10,
                  animation: "fade-up 0.3s ease",
                }}
              >
                <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: 0.8, color: "#888", marginBottom: 3 }}>
                  {msg.role === "user" ? "Agent Query" : msg.role === "error" ? "Transmission Error" : "Decoded Dispatch"}
                </div>
                <p style={{
                  fontSize: 13, lineHeight: 1.6, color: msg.role === "error" ? "#c0392b" : "#1a1208",
                  margin: 0, fontFamily: msg.role === "user" ? "Georgia, serif" : "'Courier Prime', 'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                  {isStreaming && i === followUpMessages.length - 1 && msg.role === "assistant" && (
                    <span style={{
                      display: "inline-block", width: 7, height: 13,
                      background: "#800000", marginLeft: 3,
                      animation: "blink-cursor 0.9s step-end infinite",
                      verticalAlign: "middle",
                    }} />
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── FOLLOW-UP INPUT (when mode = followup) ── */}
        <AnimatePresence>
          {mode === "followup" && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleFollowUpSubmit}
              style={{
                margin: "12px 28px 0",
                display: "flex",
                gap: 8,
                overflow: "hidden",
                position: "relative",
                zIndex: 3,
              }}
            >
              <input
                ref={followUpRef}
                type="text"
                placeholder="Type your inquiry and press Enter…"
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                disabled={isStreaming}
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  background: "#faf8f2",
                  border: "1.5px solid #8b6e4e",
                  color: "#1a1208",
                  fontFamily: "'Courier Prime', 'Courier New', monospace",
                  fontSize: 13,
                  outline: "none",
                  boxShadow: "inset 0 1px 4px rgba(0,0,0,0.1)",
                }}
              />
              <button
                type="submit"
                disabled={isStreaming || !followUpText.trim()}
                style={{
                  padding: "9px 18px",
                  background: "#1a1208",
                  color: "#f8f3e8",
                  border: "none",
                  fontFamily: "Georgia, serif",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  cursor: isStreaming || !followUpText.trim() ? "not-allowed" : "pointer",
                  opacity: isStreaming || !followUpText.trim() ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                Send
              </button>
              <button
                type="button"
                onClick={() => setMode("article")}
                style={{
                  padding: "9px 14px",
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #c2b29a",
                  fontFamily: "Georgia, serif",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ── FOOTER WITH 2 ACTION BUTTONS ── */}
        <div style={{
          margin: "16px 0 0",
          borderTop: "2px solid #1a1a1a",
          padding: "14px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#ede8dc",
          position: "relative",
          zIndex: 3,
        }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            {/* Button 1: Get Suggestions */}
            <motion.button
              onClick={handleSuggestions}
              disabled={isStreaming || !isSelfActive || !hasContent}
              whileHover={!isStreaming && isSelfActive && hasContent ? { scale: 1.03, background: "#3c2813", color: "#e8d8c3" } : {}}
              whileTap={!isStreaming && isSelfActive && hasContent ? { scale: 0.97 } : {}}
              title={!isSelfActive ? "Set this as the active investigation first" : ""}
              style={{
                padding: "9px 18px",
                border: "1.5px solid #3c2813",
                background: "transparent",
                color: "#3c2813",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                cursor: isStreaming || !isSelfActive || !hasContent ? "not-allowed" : "pointer",
                opacity: isStreaming || !isSelfActive || !hasContent ? 0.45 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ◆ Get Suggestions
            </motion.button>

            {/* Button 2: Ask Follow-up */}
            <motion.button
              onClick={() => setMode(mode === "followup" ? "article" : "followup")}
              disabled={isStreaming || !isSelfActive || !hasContent}
              whileHover={!isStreaming && isSelfActive && hasContent ? { scale: 1.03, background: "#800000", color: "#f8f3e8" } : {}}
              whileTap={!isStreaming && isSelfActive && hasContent ? { scale: 0.97 } : {}}
              title={!isSelfActive ? "Set this as the active investigation first" : ""}
              style={{
                padding: "9px 18px",
                border: "1.5px solid #800000",
                background: mode === "followup" ? "#800000" : "transparent",
                color: mode === "followup" ? "#f8f3e8" : "#800000",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 11,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                cursor: isStreaming || !isSelfActive || !hasContent ? "not-allowed" : "pointer",
                opacity: isStreaming || !isSelfActive || !hasContent ? 0.45 : 1,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ▷ Ask Follow-up
            </motion.button>
          </div>

          <span style={{ fontSize: 9, color: "#888", letterSpacing: 1.5, textTransform: "uppercase" }}>
            CLASSIFIED · EYES ONLY
          </span>
        </div>

        {/* Bottom torn paper edge */}
        <div style={{
          height: 14,
          background: "#ede8dc",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='14'%3E%3Cpath d='M0 0 Q5 14 10 5 Q15 12 20 3 Q25 10 30 4 Q35 13 40 6 Q45 11 50 2 Q55 14 60 5 Q65 12 70 3 Q75 10 80 7 Q85 14 90 4 Q95 11 100 0Z' fill='%23ede8dc'/%3E%3C/svg%3E")`,
          backgroundSize: "100px 14px",
        }} />
      </motion.div>
    </motion.div>
  );
}
