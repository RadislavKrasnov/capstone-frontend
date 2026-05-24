import { Navigate, Route, Routes } from 'react-router';

import { AuthLayout } from '../layouts/AuthLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';

function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                <p className="mt-2 text-slate-600">
                    This page will be implemented in the next frontend step.
                </p>
            </div>
        </div>
    );
}

export function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route
                path="/login"
                element={
                    <AuthLayout>
                        <LoginPage />
                    </AuthLayout>
                }
            />

            <Route
                path="/signup"
                element={
                    <AuthLayout>
                        <PlaceholderPage title="Create account" />
                    </AuthLayout>
                }
            />

            <Route
                path="/packages"
                element={<PlaceholderPage title="Tour Packages" />}
            />

            <Route path="*" element={<PlaceholderPage title="404 Not Found" />} />
        </Routes>
    );
}
