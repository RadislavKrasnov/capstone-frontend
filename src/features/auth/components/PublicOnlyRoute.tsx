import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

import type { RootState } from '../../../app/store';

type PublicOnlyRouteProps = {
    children: ReactNode;
};

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
    const isAuthenticated = useSelector(
        (state: RootState) => Boolean(state.auth.accessToken && state.auth.user),
    );

    if (isAuthenticated) {
        return <Navigate to="/packages" replace />;
    }

    return children;
}
