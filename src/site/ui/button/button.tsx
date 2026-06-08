import styles from "./button.module.css";

export type ButtonVariant = "primary" | "ghost" | "link" | "quiet";

export type ButtonSize = "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * The application's button primitive. `link` styles a real <button> to
 * read like inline text — used where an action navigates client-side and
 * a <button> is the correct semantics even though it looks like a link.
 */
export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.button, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size === "lg" ? "lg" : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
