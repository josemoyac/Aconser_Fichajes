import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = ({ variant = 'primary', className, ...props }: Props) => (
  <button
    className={clsx(
      'rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed',
      {
        'bg-primary text-white hover:bg-primary/90': variant === 'primary',
        'bg-secondary text-white hover:bg-secondary/90': variant === 'secondary',
        'bg-transparent text-primary border border-primary hover:bg-primary/10': variant === 'ghost'
      },
      className
    )}
    {...props}
  />
);
