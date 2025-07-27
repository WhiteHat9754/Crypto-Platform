import { forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'peer w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none',
        'border-slate-300/60 placeholder-transparent',
        'focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
        'dark:border-slate-600/60 dark:text-slate-100',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
