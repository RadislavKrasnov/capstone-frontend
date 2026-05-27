import { useEffect, useRef, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import type { AppDispatch, RootState } from '../../../app/store';
import { markAuthInitialized, setLoginCredentials } from '../authSlice';
import { useRefreshMutation } from '../api/authApi';

type AuthInitializerProps = {
    children: ReactNode;
};

export function AuthInitializer({ children }: AuthInitializerProps) {
    const dispatch = useDispatch<AppDispatch>();
    const isInitialized = useSelector((state: RootState) => state.auth.isInitialized);
    const [refresh] = useRefreshMutation();
    const didRunRef = useRef(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (didRunRef.current) {
            return;
        }

        didRunRef.current = true;

        const initializeAuth = async () => {
            try {
                const response = await refresh().unwrap();
                dispatch(setLoginCredentials(response));
            } catch {
                dispatch(markAuthInitialized());
            }
        };

        void initializeAuth();
    }, [dispatch, refresh]);

    if (!isInitialized) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] text-slate-500">
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
                    {t('auth.initializing')}
                </div>
            </main>
        );
    }

    return children;
}
