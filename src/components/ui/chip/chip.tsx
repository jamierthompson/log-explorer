import styles from "./chip.module.css";

export type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function Chip({
  children,
  active = false,
  className,
  ...rest
}: ChipProps) {
  return (
    <button
      type="button"
      className={[styles.chip, className].filter(Boolean).join(" ")}
      data-active={active ? "true" : undefined}
      aria-pressed={active}
      {...rest}
    >
      {children}
    </button>
  );
}
