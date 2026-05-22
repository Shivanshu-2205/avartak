import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import Platen from './components/Platen'
import RelatedNodes from './components/RelatedNodes'
import StatusBar from './components/StatusBar'
import { checkStatus, clearContext } from './api/client'
import { streamExplore } from './api/stream'
import styles from './App.module.css'

export default function App() {
  const [activeTopic, setActiveTopic]   = useState(null)
  const [chatHistory, setChatHistory]   = useState([])
  const [relatedNodes, setRelatedNodes] = useState([])
  const [isStreaming, setIsStreaming]   = useState(false)
  const [serverStatus, setServerStatus] = useState('checking')

  useEffect(() => {
    checkStatus()
      .then(data => {
        setServerStatus('online')
        if (data.activeContext) setActiveTopic(data.activeContext.topic)
      })
      .catch(() => setServerStatus('offline'))
  }, [])

  const appendToken = useCallback((msgId, token) => {
    setChatHistory(prev =>
      prev.map(m => m.id === msgId ? { ...m, text: m.text + token } : m)
    )
  }, [])

  const exploreTopic = useCallback(topic => {
    if (!topic.trim() || isStreaming) return
    setActiveTopic(topic.trim())
    setRelatedNodes([])
    setIsStreaming(true)

    const msgId = Date.now()
    setChatHistory([{ id: msgId, role: 'assistant', text: '' }])

    streamExplore(
      '/api/topic',
      { topic: topic.trim() },
      token  => appendToken(msgId, token),
      topics => setRelatedNodes(topics),
      err    => {
        setChatHistory(p => [...p, { id: Date.now(), role: 'error', text: err }])
        setIsStreaming(false)
      }
    ).then(() => setIsStreaming(false))
  }, [isStreaming, appendToken])

  const askQuestion = useCallback(question => {
    if (!question.trim() || isStreaming) return
    setIsStreaming(true)

    const userMsg = { id: Date.now(),     role: 'user',      text: question }
    const aiMsgId =   Date.now() + 1
    const aiMsg   = { id: aiMsgId,        role: 'assistant', text: '' }
    setChatHistory(p => [...p, userMsg, aiMsg])

    streamExplore(
      '/api/ask',
      { question },
      token  => appendToken(aiMsgId, token),
      topics => setRelatedNodes(topics),
      err    => {
        setChatHistory(p => [...p, { id: Date.now(), role: 'error', text: err }])
        setIsStreaming(false)
      }
    ).then(() => setIsStreaming(false))
  }, [isStreaming, appendToken])

  const handleClear = useCallback(() => {
    clearContext().catch(() => {})
    setActiveTopic(null)
    setChatHistory([])
    setRelatedNodes([])
  }, [])

  return (
    <div className={styles.root}>
      <div className={styles.scanlines} aria-hidden="true" />
      <Header />
      <div className={styles.carriage} aria-hidden="true" />
      <Platen
        activeTopic={activeTopic}
        chatHistory={chatHistory}
        isStreaming={isStreaming}
        onExplore={exploreTopic}
        onAsk={askQuestion}
        onClear={handleClear}
      />
      {relatedNodes.length > 0 && (
        <RelatedNodes
          nodes={relatedNodes}
          disabled={isStreaming}
          onSelect={exploreTopic}
        />
      )}
      <StatusBar status={serverStatus} isStreaming={isStreaming} />
    </div>
  )
}
