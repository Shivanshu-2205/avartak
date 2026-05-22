import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>
        Rabbit<span className={styles.dot}>●</span>Hole
      </h1>
      <p className={styles.tagline}>— a knowledge explorer —</p>
    </header>
  )
}
