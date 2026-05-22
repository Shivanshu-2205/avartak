import styles from './RelatedNodes.module.css'

export default function RelatedNodes({ nodes, disabled, onSelect }) {
  return (
    <section className={styles.wrap} aria-label="Related topics">
      <p className={styles.label}>◈ dig deeper</p>
      <div className={styles.nodes}>
        {nodes.map((node, i) => (
          <button
            key={i}
            className={styles.node}
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => onSelect(node)}
            disabled={disabled}
          >
            {node}
          </button>
        ))}
      </div>
    </section>
  )
}
