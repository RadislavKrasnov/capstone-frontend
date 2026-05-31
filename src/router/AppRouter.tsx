import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';

import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupAgencyOwnerPage } from '../features/auth/pages/SignupAgencyOwnerPage';
import { PublicOnlyRoute } from '../features/auth/components/PublicOnlyRoute';
import { RequireAuth } from '../features/auth/components/RequireAuth';
import { RequireRole } from '../features/auth/components/RequireRole';
import { AgencyUsersPage } from '../features/users/pages/AgencyUsersPage';
import { TourPackagesPage } from '../features/tour-packages/pages/TourPackagesPage';
import { SuppliersPage } from '../features/suppliers/pages/SuppliersPage';
import { TourPackageDetailPage } from '../features/tour-packages/pages/TourPackageDetailPage';

function PlaceholderPage({ title }: { title: string }) {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-600">
                {t('common.pageComingSoon')}
            </p>
        </div>
    );
}

export function AppRouter() {
    const { t } = useTranslation();

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/packages" replace />} />

            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <AuthLayout>
                            <LoginPage />
                        </AuthLayout>
                    </PublicOnlyRoute>
                }
            />

            <Route
                path="/signup"
                element={
                    <PublicOnlyRoute>
                        <AuthLayout>
                            <SignupAgencyOwnerPage />
                        </AuthLayout>
                    </PublicOnlyRoute>
                }
            />

            <Route
                element={
                    <RequireAuth>
                        <AppLayout />
                    </RequireAuth>
                }
            >
                <Route path="/packages" element={<TourPackagesPage />} />
                <Route path="/packages/:uuid" element={<TourPackageDetailPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route
                    path="/analysis-settings"
                    element={<PlaceholderPage title={t('pages.analysisSettings')} />}
                />

                <Route
                    path="/agency/users"
                    element={
                        <RequireRole allowedRoles={['OWNER']}>
                            <AgencyUsersPage />
                        </RequireRole>
                    }
                />
            </Route>

            <Route
                path="*"
                element={<PlaceholderPage title={t('common.notFound')} />}
            />
        </Routes>
    );
}
