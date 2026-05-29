import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Bell,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    Truck,
    Users,
    Zap,
} from 'lucide-react';

import type { AppDispatch, RootState } from '../app/store';
import { CanAccess } from '../features/auth/components/CanAccess';
import { clearCredentials } from '../features/auth/authSlice';
import { useLogoutMutation } from '../features/auth/api/authApi';
import { baseApi } from '../shared/api/baseApi';

function getInitials(firstName?: string, lastName?: string) {
    return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || 'U';
}

export function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.auth.user);
    const [logout, { isLoading }] = useLogoutMutation();
    const { t } = useTranslation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
        } finally {
            dispatch(clearCredentials());
            dispatch(baseApi.util.resetApiState());
            navigate('/login');
        }
    };

    const pageTitle =
        location.pathname === '/agency/users'
            ? t('pages.agencyUsers')
            : location.pathname === '/suppliers'
                ? t('pages.suppliers')
                : location.pathname === '/analysis-settings'
                    ? t('pages.analysisSettings')
                    : location.pathname.startsWith('/packages')
                        ? t('pages.packages')
                        : t('auth.appName');

    const pageSubtitle =
        location.pathname === '/agency/users'
            ? t('pages.agencyUsersSubtitle')
            : location.pathname === '/suppliers'
                ? 'Manage supplier relationships'
                : location.pathname === '/analysis-settings'
                    ? 'Configure thresholds and rules'
                    : location.pathname.startsWith('/packages')
                        ? 'Manage and analyze all packages'
                        : '';

    return (
        <div className="flex min-h-screen bg-[#f1f4f8] text-slate-900">
            <aside className="fixed left-0 top-0 hidden h-screen w-[242px] flex-col border-r border-slate-700/60 bg-slate-800 md:flex">
                <div className="flex h-[71px] items-center border-b border-slate-700/70 px-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                            <Zap size={17} strokeWidth={2.4} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-[13px] font-semibold leading-tight text-white">
                                {t('auth.shortAppName')}
                            </h1>
                            <p className="truncate text-[10px] leading-tight text-slate-500">
                                {user?.agencyId
                                    ? t('common.agencyNumber', { agencyId: user.agencyId })
                                    : t('auth.appName')}
                            </p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4">
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t('navigation.label')}
                    </p>

                    <div className="space-y-1">
                        <NavLink
                            to="/packages"
                            className={({ isActive }) =>
                                [
                                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200',
                                ].join(' ')
                            }
                        >
                            <Package size={15} />
                            {t('navigation.packages')}
                        </NavLink>

                        <NavLink
                            to="/suppliers"
                            className={({ isActive }) =>
                                [
                                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200',
                                ].join(' ')
                            }
                        >
                            <Truck size={15} />
                            Suppliers
                        </NavLink>

                        <NavLink
                            to="/analysis-settings"
                            className={({ isActive }) =>
                                [
                                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200',
                                ].join(' ')
                            }
                        >
                            <Settings size={15} />
                            Analysis Settings
                        </NavLink>

                        <CanAccess allowedRoles={['OWNER']}>
                            <NavLink
                                to="/agency/users"
                                className={({ isActive }) =>
                                    [
                                        'flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium transition-colors',
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'text-slate-400 hover:bg-slate-700/80 hover:text-slate-200',
                                    ].join(' ')
                                }
                            >
                                <Users size={15} />
                                {t('navigation.agencyUsers')}
                            </NavLink>
                        </CanAccess>
                    </div>
                </nav>

                <div className="border-t border-slate-700/70 px-3 py-4">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[13px] font-medium text-slate-400 transition-colors hover:bg-slate-700/80 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        <LogOut size={15} />
                        {isLoading ? t('auth.loggingOut') : t('auth.logout')}
                    </button>
                </div>
            </aside>

            <div className="min-h-screen flex-1 md:pl-[242px]">
                <header className="flex h-[53px] items-center border-b border-slate-200 bg-white px-6">
                    <div className="flex min-w-[198px] items-center">
                        <span className="text-[13px] font-semibold tracking-tight text-slate-800">
                            {t('auth.appName')}
                        </span>
                    </div>

                    <div className="mx-5 h-5 w-px bg-slate-200" />

                    <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-semibold text-slate-800">
                            {pageTitle}
                        </span>

                        {pageSubtitle && (
                            <span className="ml-1 text-xs text-slate-400">
                                {pageSubtitle}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="relative rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100"
                            aria-label={t('common.notifications')}
                        >
                            <Bell size={16} />
                            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white" />
                        </button>

                        <div className="flex items-center gap-2.5 rounded-md py-1.5 pl-1 pr-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                                {getInitials(user?.firstName, user?.lastName)}
                            </div>

                            <div className="hidden text-left sm:block">
                                <p className="text-[12px] font-semibold leading-tight text-slate-800">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-[10px] leading-tight text-slate-400">
                                    {user?.role ? t(`auth.roles.${user.role}`) : null}
                                </p>
                            </div>

                            <ChevronDown
                                size={13}
                                className="hidden text-slate-400 sm:block"
                            />
                        </div>
                    </div>
                </header>

                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
