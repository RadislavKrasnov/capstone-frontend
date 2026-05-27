import type { ReactNode } from 'react';

type UiBadgeVariant =
    | 'blue'
    | 'violet'
    | 'green'
    | 'gray'
    | 'red'
    | 'amber'
    | 'cyan';

type UiBadgeProps = {
    children: ReactNode;
    variant?: UiBadgeVariant;
    className?: string;
};

const badgeClasses: Record<UiBadgeVariant, string> = {
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    gray: 'border-slate-200 bg-slate-100 text-slate-600',
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
};

export function UiBadge({
                            children,
                            variant = 'gray',
                            className = '',
                        }: UiBadgeProps) {
    return (
        <span
            className={[
                'inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold',
                badgeClasses[variant],
                className,
            ].join(' ')}
        >
            {children}
        </span>
    );
}
