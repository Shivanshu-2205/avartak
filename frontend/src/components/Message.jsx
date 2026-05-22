import styles from './Message.module.css'

const LABELS = {
  user:      '>> you',
  assistant: ':: rabbit hole',
  error:     '!! error',
}

export default function Message({ msg, isActive, showDivider }) {
  return (
    <div className={styles.msg}>
      {showDivider && <hr className={styles.divider} />}
      <span className={`${styles.label} ${msg.role === 'user' ? styles.labelUser : ''}`}>
        {LABELS[msg.role] ?? msg.role}
      </span>
      {msg.role === 'error' ? (
        <p className={styles.error}>{msg.text}</p>
      ) : (
        <p className={styles.body}>
          {msg.text}
          {isActive && <span className={styles.cursor} aria-hidden="true" />}
        </p>
      )}
    </div>
  )
}
