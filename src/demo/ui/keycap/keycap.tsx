import styles from "./keycap.module.css";

type KeySequence = readonly string[];

export function Keycap({ children }: { children: React.ReactNode }) {
  return <kbd className={styles.cap}>{children}</kbd>;
}

/*
 * `decorative` defaults to true for the uses where a
 * surrounding aria-label or description already announces the action.
 * Pass `decorative={false}` when the sequence stands alone in prose —
 * the inner <kbd> elements then get announced naturally.
 */
export function KeycapSequence({
  keys,
  aliases,
  decorative = true,
}: {
  keys: KeySequence;
  aliases?: readonly KeySequence[];
  decorative?: boolean;
}) {
  return (
    <span
      className={styles.sequence}
      aria-hidden={decorative ? true : undefined}
    >
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
