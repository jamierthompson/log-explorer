import styles from "./incident-brief.module.css";

/**
 * The case facts at the demo's threshold: when, what's failing, and on
 * which fleet. Pure scene-setting — the acts narrate the mechanics, the
 * brief states only what an on-call engineer would know walking in.
 */
export function IncidentBrief() {
  return (
    <aside className={styles.brief} aria-label="Incident briefing">
      <p className={styles.lead}>
        13:31 UTC. Checkout starts returning 503s while the logs tail live.
        Three instances, one failing request — work out what broke.
      </p>
      <dl className={styles.meta}>
        <div>
          <dt>Service</dt>
          <dd>api-gateway</dd>
        </div>
        <div>
          <dt>Symptom</dt>
          <dd>checkout 503s</dd>
        </div>
        <div>
          <dt>Instances</dt>
          <dd>kc4qn · m7w3p · t2x8r</dd>
        </div>
      </dl>
    </aside>
  );
}
