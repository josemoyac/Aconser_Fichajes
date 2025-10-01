import { PropsWithChildren } from 'react';
import clsx from 'clsx';

type CardProps = PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
}>;

export const Card = ({ children, className, title, subtitle }: CardProps) => (
  <section className={clsx('rounded-3xl bg-white p-5 shadow-md', className)}>
    {(title || subtitle) && (
      <header className="mb-4">
        {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </header>
    )}
    {children}
  </section>
);
