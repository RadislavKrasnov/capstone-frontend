import { Zap } from 'lucide-react';

export function AuthLogo() {
    return (
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Zap size={23} strokeWidth={2.4} />
        </div>
    );
}
