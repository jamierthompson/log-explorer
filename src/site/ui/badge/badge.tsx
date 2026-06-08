import styles from "./badge.module.css";

export function Badge({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={[styles.badge, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </span>
  );
}
