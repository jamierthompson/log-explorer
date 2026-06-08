import styles from "./link.module.css";

export type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  /** Opens in a new tab with a safe rel. The caller supplies any
   * visible affordance (e.g. an ↗) as part of the children. */
  external?: boolean;
};

/** The application's anchor primitive — a styled <a> for real navigation. */
export function Link({
  external = false,
  className,
  children,
  ...rest
}: LinkProps) {
  const externalProps = external
    ? { target: "_blank", rel: "noreferrer" }
    : null;
  return (
    <a
      className={[styles.link, className].filter(Boolean).join(" ")}
      {...externalProps}
      {...rest}
    >
      {children}
    </a>
  );
}
