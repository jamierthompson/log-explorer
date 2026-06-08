import styles from "./eyebrow.module.css";

export type EyebrowVariant = "default" | "accent";

/** Small mono kicker that sits above a title. */
export function Eyebrow({
  variant = "default",
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & {
  variant?: EyebrowVariant;
}) {
  return (
    <p
      className={[styles.eyebrow, className].filter(Boolean).join(" ")}
      data-variant={variant === "accent" ? "accent" : undefined}
      {...rest}
    >
      {children}
    </p>
  );
}
