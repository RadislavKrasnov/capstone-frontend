import type { ReactNode } from 'react';
import { X } from 'lucide-react';

type UiModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
    widthClassName?: string;
};

export function UiModal({
                            title,
                            children,
                            onClose,
                            widthClassName = 'max-w-lg',
                        }: UiModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            <div
                className={[
                    'relative max-h-[90vh] w-full overflow-y-auto rounded-xl bg-white shadow-xl',
                    widthClassName,
                ].join(' ')}
            >
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h2 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5">{children}</div>
            </div>
        </div>
    );
}
