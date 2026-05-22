import styles from './StatusBar.module.css'

const STATUS_TEXT = {
  checking: 'checking machine...',
  online:   'machine online — carriage ready',
  offline:  '⚠ machine offline — check localhost:5000',
}

export default function StatusBar({ status, isStreaming }) {
  return (
    <p className={styles.bar} role="status" aria-live="polite">
      {status === 'online' && <span className={styles.dot} aria-hidden="true" />}
      {STATUS_TEXT[status] ?? status}
      {isStreaming && ' — typing...'}
    </p>
  )
}
