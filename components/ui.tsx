import type { HTMLAttributes, ReactNode } from "react";

export function SectionHeader({
  title,
  action
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-2xl font-semibold uppercase text-primary">{title}</h2>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & {
  children: ReactNode;
}) {
  return (
    <section className={`card p-5 ${className}`} {...props}>
      {children}
    </section>
  );
}
