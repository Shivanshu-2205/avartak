import Landing from './Landing'
import ChatView from './ChatView'
import styles from './Platen.module.css'

export default function Platen({ activeTopic, chatHistory, isStreaming, onExplore, onAsk, onClear }) {
  return (
    <main className={styles.platen}>
      <div className={styles.inner}>
        {!activeTopic ? (
          <Landing onExplore={onExplore} isStreaming={isStreaming} />
        ) : (
          <ChatView
            activeTopic={activeTopic}
            chatHistory={chatHistory}
            isStreaming={isStreaming}
            onAsk={onAsk}
            onClear={onClear}
          />
        )}
      </div>
    </main>
  )
}
