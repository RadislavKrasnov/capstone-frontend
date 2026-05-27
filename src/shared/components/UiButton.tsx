import type { ButtonHTMLAttributes, ReactNode } from 'react';

type UiButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type UiButtonSize = 'sm' | 'md';

type UiButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: UiButtonVariant;
    size?: UiButtonSize;
    icon?: ReactNode;
};

const variantClasses: Record<UiButtonVariant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
    secondary:
        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    ghost: 'text-slate-500 hover:bg-slate-100 disabled:hover:bg-transparent',
};

const sizeClasses: Record<UiButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
};

export function UiButton({
                             children,
                             variant = 'primary',
                             size = 'md',
                             icon,
                             className = '',
                             type = 'button',
                             ...props
                         }: UiButtonProps) {
    return (
        <button
            type={type}
            className={[
                'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-70',
                variantClasses[variant],
                sizeClasses[size],
                className,
            ].join(' ')}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}
