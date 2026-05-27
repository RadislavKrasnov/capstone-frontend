import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

import type { RootState } from '../../../app/store';

type RequireAuthProps = {
    children: ReactNode;
};

export function RequireAuth({ children }: RequireAuthProps) {
    const location = useLocation();

    const isAuthenticated = useSelector(
        (state: RootState) => Boolean(state.auth.accessToken && state.auth.user),
    );

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return children;
}
