import { Link, Outlet, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import type { AppDispatch, RootState } from '../app/store';
import { CanAccess } from '../features/auth/components/CanAccess';
import { clearCredentials } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/api/authApi';

export function AppLayout() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const [logout, { isLoading }] = useLogoutMutation();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } finally {
            dispatch(clearCredentials());
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-white p-5 md:block">
                <h1 className="text-lg font-semibold text-slate-900">
                    {t('auth.appName')}
                </h1>

                <nav className="mt-8 space-y-2">
                    <Link
                        to="/packages"
                        className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                        {t('navigation.packages')}
                    </Link>

                    <CanAccess allowedRoles={['OWNER']}>
                        <Link
                            to="/agency/users"
                            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                            {t('navigation.agencyUsers')}
                        </Link>
                    </CanAccess>
                </nav>
            </aside>

            <div className="md:pl-64">
                <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
                    <div>
                        <p className="text-sm font-medium text-slate-900">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                            {user?.role ? t(`auth.roles.${user.role}`) : null}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isLoading ? t('auth.loggingOut') : t('auth.logout')}
                    </button>
                </header>

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
