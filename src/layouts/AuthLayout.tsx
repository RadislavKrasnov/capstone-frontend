import type { ReactNode } from 'react';

type AuthLayoutProps = {
    children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <main className="min-h-screen bg-[#eef3f9] text-slate-900">
            <div className="flex min-h-screen items-start justify-center px-4 pt-[190px] sm:pt-[185px]">
                {children}
            </div>
        </main>
    );
}
