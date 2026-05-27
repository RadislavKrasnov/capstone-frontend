import { Navigate } from 'react-router';
import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

import type { RootState } from '../../../app/store';
import type { UserRole } from '../types/auth.types';

type RequireRoleProps = {
    allowedRoles: UserRole[];
    children: ReactNode;
};

export function RequireRole({ allowedRoles, children }: RequireRoleProps) {
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/packages" replace />;
    }

    return children;
}
