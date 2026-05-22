import { useState } from 'react'
import styles from './Landing.module.css'

export default function Landing({ onExplore, isStreaming }) {
  const [value, setValue] = useState('')

  const handleSubmit = () => {
    if (value.trim()) onExplore(value.trim())
  }

  return (
    <div className={styles.landing}>
      <p className={styles.prompt}>Insert topic to begin_</p>
      <div className={styles.searchRow}>
        <input
          className={styles.input}
          placeholder="e.g. Quantum Mechanics"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          autoFocus
        />
        <button
          className={styles.btn}
          disabled={isStreaming || !value.trim()}
          onClick={handleSubmit}
        >
          ↩ Explore
        </button>
      </div>
    </div>
  )
}
