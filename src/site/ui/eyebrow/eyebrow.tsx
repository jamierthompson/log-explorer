import styles from "./eyebrow.module.css";

/** Small mono kicker that sits above a title. */
export function Eyebrow({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={[styles.eyebrow, className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </p>
  );
}
