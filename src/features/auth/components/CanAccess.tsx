import { useSelector } from 'react-redux';
import type { ReactNode } from 'react';

import type { RootState } from '../../../app/store';
import type { UserRole } from '../types/auth.types';

type CanAccessProps = {
    allowedRoles: UserRole[];
    children: ReactNode;
};

export function CanAccess({ allowedRoles, children }: CanAccessProps) {
    const user = useSelector((state: RootState) => state.auth.user);

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return children;
}
