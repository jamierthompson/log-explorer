import styles from "./keycap.module.css";

type KeySequence = readonly string[];

export function Keycap({ children }: { children: React.ReactNode }) {
  return <kbd className={styles.cap}>{children}</kbd>;
}

export function KeycapSequence({
  keys,
  aliases,
}: {
  keys: KeySequence;
  aliases?: readonly KeySequence[];
}) {
  return (
    <span className={styles.sequence} aria-hidden="true">
      <SequenceRun keys={keys} />
      {aliases?.map((alias, i) => (
        <span key={i} className={styles.alias}>
          <span className={styles.slash}>/</span>
          <SequenceRun keys={alias} />
        </span>
      ))}
    </span>
  );
}

function SequenceRun({ keys }: { keys: KeySequence }) {
  return keys.map((key, i) => (
    <span key={i} className={styles.pair}>
      {i > 0 ? <span className={styles.plus}>+</span> : null}
      <Keycap>{key}</Keycap>
    </span>
  ));
}
