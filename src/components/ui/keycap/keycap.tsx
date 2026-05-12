import styles from "./keycap.module.css";

export function Keycap({ children }: { children: React.ReactNode }) {
  return <kbd className={styles.cap}>{children}</kbd>;
}

export function KeycapSequence({ keys }: { keys: readonly string[] }) {
  return (
    <span className={styles.sequence} aria-hidden="true">
      {keys.map((key, i) => (
        <span key={i} className={styles.pair}>
          {i > 0 ? <span className={styles.plus}>+</span> : null}
          <Keycap>{key}</Keycap>
        </span>
      ))}
    </span>
  );
}
