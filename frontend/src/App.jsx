import { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CrimeBoard from "./components/CrimeBoard";
import Dashboard from "./components/Dashboard";
import Community from "./components/Community";
import { checkStatus, clearContext } from "./api/client";
import { streamExplore } from "./api/stream";
import { POLAROIDS } from "./components/data";

const THEME_IMAGES = [
  "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=300&q=80", // Misty woods
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80", // Abandoned factory
  "https://images.unsplash.com/photo-1515474594679-6a66b7fdcbe4?w=300&q=80", // Rainy street lamp
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", // Coastal cliffs
  "https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=300&q=80", // Retro diner
  "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=300&q=80", // Vintage typewriter
  "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&q=80", // Vintage map
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=300&q=80", // Old book pile
  "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?w=300&q=80", // Dark alleyway
  "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300&q=80", // Chemistry vials
  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=300&q=80", // Compass and journal
  "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=300&q=80", // Vintage newsroom
];

function getRandomThemeImage(index) {
  return THEME_IMAGES[index % THEME_IMAGES.length];
}

function getScatterCoords(parentX, parentY, index, totalCount) {
  const radius = 180;
  const startAngle = -Math.PI / 4;
  const endAngle = 5 * Math.PI / 4;
  const angleStep = totalCount > 1 ? (endAngle - startAngle) / (totalCount - 1) : 0;
  const angle = startAngle + index * angleStep;

  let x = parentX + radius * Math.cos(angle);
  let y = parentY + radius * Math.sin(angle);

  x = Math.max(20, Math.min(620, x));
  y = Math.max(50, Math.min(430, y));

  return { x, y };
}

export default function App() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [polaroids, setPolaroids] = useState(POLAROIDS);
  const [isStreaming, setIsStreaming] = useState(false);
  const [serverStatus, setServerStatus] = useState("checking");

  // Check backend server status on mount
  useEffect(() => {
    checkStatus()
      .then((data) => {
        setServerStatus("online");
        if (data.activeContext) {
          setActiveTopic(data.activeContext.topic);
          // Initialize active topic Polaroid if context is alive
          setPolaroids([
            {
              id: Date.now(),
              title: data.activeContext.topic,
              image: getRandomThemeImage(0),
              tags: ["Active Case", "Clue"],
              x: 320,
              y: 200,
              description: `Telegraph line established for "${data.activeContext.topic}". Context loaded from backend.`,
              connections: [],
              rotation: 2,
              pinColor: "#c0392b",
              isAiGenerated: true,
              chatHistory: [
                {
                  id: Date.now(),
                  role: "assistant",
                  text: `Active context restored for: "${data.activeContext.topic}".`,
                },
              ],
            },
          ]);
        }
      })
      .catch(() => setServerStatus("offline"));
  }, []);

  const addRelatedCards = useCallback((parentId, parentX, parentY, topics) => {
    if (!topics || topics.length === 0) return;
    setPolaroids((prev) => {
      const parentCard = prev.find((p) => p.id === parentId);
      if (!parentCard) return prev;

      // Filter out topics that already exist as polaroid titles on the board
      const filteredTopics = topics.filter(
        (t) => !prev.some((p) => p.title.toLowerCase() === t.toLowerCase())
      );

      if (filteredTopics.length === 0) return prev;

      const baseId = Date.now();
      const newCards = filteredTopics.map((topic, index) => {
        const cardId = baseId + index + 10;
        const coords = getScatterCoords(parentX, parentY, index, filteredTopics.length);
        return {
          id: cardId,
          title: topic,
          image: getRandomThemeImage(prev.length + index),
          tags: ["Unexplored", "Clue"],
          x: coords.x,
          y: coords.y,
          description: "Telegraphic record pending. Click 'Investigate Clue' to request intel.",
          connections: [],
          rotation: Math.random() * 10 - 5,
          pinColor: "#8b6e4e",
          isAiGenerated: true,
          chatHistory: [],
        };
      });

      const newConnections = newCards.map((c) => c.id);
      const updatedPrev = prev.map((p) =>
        p.id === parentId
          ? {
              ...p,
              connections: [...new Set([...p.connections, ...newConnections])],
            }
          : p
      );

      return [...updatedPrev, ...newCards];
    });
  }, []);

  const exploreTopic = useCallback(
    (topic, cardId = null) => {
      const cleanedTopic = topic.trim();
      if (!cleanedTopic || isStreaming) return;

      setActiveTopic(cleanedTopic);
      setIsStreaming(true);

      let targetId = cardId;
      const now = Date.now();
      const streamMsgId = now + 2; // offset to avoid collisions

      if (targetId === null) {
        // Start a completely fresh case, clear the board and show only the main topic card
        targetId = now + 1;
        const mainCard = {
          id: targetId,
          title: cleanedTopic,
          image: getRandomThemeImage(0),
          tags: ["Active Case", "Clue"],
          x: 320,
          y: 200,
          description: "",
          connections: [],
          rotation: Math.random() * 6 - 3,
          pinColor: "#c0392b",
          isAiGenerated: true,
          chatHistory: [{ id: streamMsgId, role: "assistant", text: "" }],
        };
        setPolaroids([mainCard]);
      } else {
        // Explored an existing related card pathway
        setPolaroids((prev) =>
          prev.map((p) => {
            if (p.id === targetId) {
              return {
                ...p,
                description: "",
                tags: ["Active Case", "Clue"],
                pinColor: "#c0392b",
                chatHistory: [{ id: streamMsgId, role: "assistant", text: "" }],
              };
            }
            // Update other active cases to standard clues
            if (p.pinColor === "#c0392b" && p.id !== targetId) {
              return { ...p, pinColor: "#8b6e4e", tags: ["Explored", "Clue"] };
            }
            return p;
          })
        );
      }

      streamExplore(
        "/api/topic",
        { topic: cleanedTopic },
        (token) => {
          setPolaroids((prev) =>
            prev.map((p) => {
              if (p.id === targetId) {
                const updatedHistory = p.chatHistory.map((m) =>
                  m.id === streamMsgId ? { ...m, text: m.text + token } : m
                );
                return {
                  ...p,
                  description: p.description + token,
                  chatHistory: updatedHistory,
                };
              }
              return p;
            })
          );
        },
        (topics) => {
          // Fetch the updated coords of the parent card to anchor children scatter
          setPolaroids((prev) => {
            const currentCard = prev.find((p) => p.id === targetId);
            const px = currentCard ? currentCard.x : 320;
            const py = currentCard ? currentCard.y : 200;
            setTimeout(() => addRelatedCards(targetId, px, py, topics), 50);
            return prev;
          });
        },
        (err) => {
          setPolaroids((prev) =>
            prev.map((p) => {
              if (p.id === targetId) {
                return {
                  ...p,
                  chatHistory: [
                    ...p.chatHistory,
                    { id: Date.now(), role: "error", text: err },
                  ],
                };
              }
              return p;
            })
          );
          setIsStreaming(false);
        }
      ).then(() => setIsStreaming(false));
    },
    [isStreaming, addRelatedCards]
  );

  const askQuestion = useCallback(
    (question) => {
      const cleanedQuestion = question.trim();
      if (!cleanedQuestion || isStreaming || !activeTopic) return;

      setIsStreaming(true);

      // Find the active polaroid card
      const activeCard = polaroids.find(
        (p) => p.title.toLowerCase() === activeTopic.toLowerCase()
      );
      if (!activeCard) {
        setIsStreaming(false);
        return;
      }

      const askNow = Date.now();
      const userMsgId = askNow;
      const aiMsgId = askNow + 1;
      const userMsg = { id: userMsgId, role: "user", text: cleanedQuestion };
      const aiMsg = { id: aiMsgId, role: "assistant", text: "" };

      setPolaroids((prev) =>
        prev.map((p) => {
          if (p.id === activeCard.id) {
            return {
              ...p,
              chatHistory: [...p.chatHistory, userMsg, aiMsg],
            };
          }
          return p;
        })
      );

      streamExplore(
        "/api/ask",
        { question: cleanedQuestion },
        (token) => {
          setPolaroids((prev) =>
            prev.map((p) => {
              if (p.id === activeCard.id) {
                const updatedHistory = p.chatHistory.map((m) =>
                  m.id === aiMsgId ? { ...m, text: m.text + token } : m
                );
                return {
                  ...p,
                  chatHistory: updatedHistory,
                };
              }
              return p;
            })
          );
        },
        (topics) => {
          // Add new related topics around the active card
          setPolaroids((prev) => {
            const currentCard = prev.find((p) => p.id === activeCard.id);
            const px = currentCard ? currentCard.x : 320;
            const py = currentCard ? currentCard.y : 200;
            setTimeout(() => addRelatedCards(activeCard.id, px, py, topics), 50);
            return prev;
          });
        },
        (err) => {
          setPolaroids((prev) =>
            prev.map((p) => {
              if (p.id === activeCard.id) {
                return {
                  ...p,
                  chatHistory: [
                    ...p.chatHistory,
                    { id: Date.now(), role: "error", text: err },
                  ],
                };
              }
              return p;
            })
          );
          setIsStreaming(false);
        }
      ).then(() => setIsStreaming(false));
    },
    [isStreaming, activeTopic, polaroids, addRelatedCards]
  );

  const handleClear = useCallback(() => {
    clearContext().catch(() => {});
    setActiveTopic(null);
    setPolaroids(POLAROIDS);
    setIsStreaming(false);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              activeTopic={activeTopic}
              isStreaming={isStreaming}
              onExplore={exploreTopic}
              onClear={handleClear}
              polaroids={polaroids}
            />
          }
        />
        <Route
          path="/crime-board"
          element={
            <CrimeBoard
              polaroids={polaroids}
              setPolaroids={setPolaroids}
              activeTopic={activeTopic}
              isStreaming={isStreaming}
              onExplore={exploreTopic}
              onAsk={askQuestion}
              onClear={handleClear}
            />
          }
        />
        <Route path="/community" element={<Community />} />
      </Routes>
    </Router>
  );
}
