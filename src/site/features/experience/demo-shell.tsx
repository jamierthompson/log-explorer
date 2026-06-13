"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import styles from "./demo-shell.module.css";

const AnnounceContext = createContext<((message: string) => void) | null>(null);

/** Voice a message through the demo's one polite live region. */
export function useDemoAnnounce(): (message: string) => void {
  const announce = useContext(AnnounceContext);
  if (!announce) {
    throw new Error("useDemoAnnounce must be used within DemoShell");
  }
  return announce;
}

/**
 * The demo segment's frame and its one live region. Unlike the demo's
 * progress (which is held above every route so it survives leaving for the
 * story), announcements are transient and belong to the demo view, so they
 * live here and clear when the visitor leaves it.
 */
export function DemoShell({ children }: { children: ReactNode }) {
  const [announcement, setAnnouncement] = useState("");
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
  }, []);

  return (
    <AnnounceContext.Provider value={announce}>
      <div className={styles.demoView}>
        <div role="status" className={styles.srOnly}>
          {announcement}
        </div>
        <div className={styles.demoInner}>{children}</div>
      </div>
    </AnnounceContext.Provider>
  );
}
