import { useRef, useEffect, useState } from 'react'
import Message from './Message'
import styles from './ChatView.module.css'

export default function ChatView({ activeTopic, chatHistory, isStreaming, onAsk, onClear }) {
  const [askVal, setAskVal] = useState('')
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleAsk = () => {
    if (!askVal.trim() || isStreaming) return
    onAsk(askVal.trim())
    setAskVal('')
  }

  return (
    <>
      <div className={styles.topicHeader}>
        <span className={styles.topicTitle}>// {activeTopic}</span>
        <button className={styles.newBtn} onClick={onClear}>
          ✕ New Roll
        </button>
      </div>

      <div className={styles.chat} ref={chatRef}>
        {chatHistory.map((msg, i) => (
          <Message
            key={msg.id}
            msg={msg}
            isActive={isStreaming && i === chatHistory.length - 1 && msg.role === 'assistant'}
            showDivider={i > 0 && msg.role !== chatHistory[i - 1]?.role}
          />
        ))}
      </div>

      <div className={styles.askRow}>
        <span className={styles.prefix} aria-hidden="true">&gt;&gt;</span>
        <input
          className={styles.askInput}
          placeholder="ask a follow-up question..."
          value={askVal}
          onChange={e => setAskVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          disabled={isStreaming}
        />
        <button
          className={styles.sendBtn}
          disabled={isStreaming || !askVal.trim()}
          onClick={handleAsk}
        >
          ↩ Send
        </button>
      </div>
    </>
  )
}
