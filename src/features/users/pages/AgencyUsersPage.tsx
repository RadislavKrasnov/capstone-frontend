import { useMemo, useState } from 'react';
import { AlertTriangle, Edit2, Plus, Search, Trash2 } from 'lucide-react';

import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import {
    useDeleteUserMutation,
    useGetUsersQuery,
} from '../api/usersApi';
import { UserForm, getErrorMessage } from '../components/UserForm';
import type { AgencyUser } from '../types/user.types';
import type { UserRole } from '../../auth/types/auth.types';

const roleBadgeVariant: Record<UserRole, 'blue' | 'violet'> = {
    OWNER: 'blue',
    MANAGER: 'violet',
};

function getInitials(user: Pick<AgencyUser, 'firstName' | 'lastName'>) {
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();
}

function getAvatarClass(role: UserRole) {
    return role === 'OWNER'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-violet-100 text-violet-700';
}

export function AgencyUsersPage() {
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<AgencyUser | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { data, isLoading, isFetching, isError, refetch } = useGetUsersQuery({
        page: 1,
        limit: 100,
    });

    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

    const users = data?.data ?? [];

    const visibleUsers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return users;
        }

        return users.filter((user) => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

            return (
                fullName.includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.role.toLowerCase().includes(query) ||
                user.agency?.name.toLowerCase().includes(query)
            );
        });
    }, [search, users]);

    const activeCount = users.filter((user) => user.isActive).length;
    const inactiveCount = users.length - activeCount;

    const openEdit = (user: AgencyUser) => {
        setSelectedUser(user);
        setModal('edit');
    };

    const openDelete = (user: AgencyUser) => {
        setSelectedUser(user);
        setDeleteError(null);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedUser(null);
        setDeleteError(null);
    };

    const confirmDelete = async () => {
        if (!selectedUser) {
            return;
        }

        setDeleteError(null);

        try {
            await deleteUser({ uuid: selectedUser.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold text-slate-900">Users</h1>
                    <p className="mt-0.5 text-sm text-slate-400">
                        {users.length} users · {activeCount} active ·{' '}
                        <span className="text-amber-500">{inactiveCount} inactive</span>
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-[260px]">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search users..."
                            className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <UiButton
                        icon={<Plus size={15} />}
                        onClick={() => {
                            setSelectedUser(null);
                            setModal('add');
                        }}
                    >
                        New User
                    </UiButton>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        Loading users...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <AlertTriangle size={22} className="text-red-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                Unable to load users
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Please check backend availability and try again.
                            </p>
                        </div>
                        <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                            Retry
                        </UiButton>
                    </div>
                ) : visibleUsers.length === 0 ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        No users match your search.
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {['Name', 'Email', 'Role', 'Agency', 'Active', ''].map(
                                    (header) => (
                                        <th
                                            key={header}
                                            className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                                        >
                                            {header}
                                        </th>
                                    ),
                                )}
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                            {visibleUsers.map((user) => (
                                <tr
                                    key={user.uuid}
                                    className="group transition hover:bg-slate-50/70"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={[
                                                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                                                    getAvatarClass(user.role),
                                                ].join(' ')}
                                            >
                                                {getInitials(user)}
                                            </div>
                                            <div>
                                                <p
                                                    className={[
                                                        'text-sm font-semibold',
                                                        user.isActive
                                                            ? 'text-slate-900'
                                                            : 'text-slate-400',
                                                    ].join(' ')}
                                                >
                                                    {user.firstName} {user.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-600">
                                        {user.email}
                                    </td>

                                    <td className="px-5 py-4">
                                        <UiBadge variant={roleBadgeVariant[user.role]}>
                                            {user.role}
                                        </UiBadge>
                                    </td>

                                    <td className="px-5 py-4 text-sm text-slate-500">
                                        {user.agency?.name ?? `Agency #${user.agencyId}`}
                                    </td>

                                    <td className="px-5 py-4">
                                        {user.isActive ? (
                                            <UiBadge variant="green" className="gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                Yes
                                            </UiBadge>
                                        ) : (
                                            <UiBadge variant="gray" className="gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                No
                                            </UiBadge>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(user)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                            >
                                                <Edit2 size={11} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDelete(user)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-medium text-red-500 transition hover:bg-red-50"
                                            >
                                                <Trash2 size={11} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
                            {visibleUsers.length} of {users.length} users
                            {isFetching ? ' · Refreshing...' : null}
                        </div>
                    </>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <UiModal
                    title={
                        modal === 'add'
                            ? 'New User'
                            : `Edit User — ${selectedUser?.firstName} ${selectedUser?.lastName}`
                    }
                    onClose={closeModal}
                    widthClassName="max-w-lg"
                >
                    <UserForm
                        mode={modal}
                        user={selectedUser}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'delete' && selectedUser && (
                <UiModal
                    title="Delete User"
                    onClose={closeModal}
                    widthClassName="max-w-sm"
                >
                    <div className="space-y-4">
                        {deleteError && (
                            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
                            <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0 text-red-500"
                            />
                            <p className="text-sm leading-relaxed text-red-700">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end gap-2">
                            <UiButton
                                variant="secondary"
                                onClick={closeModal}
                                disabled={isDeleting}
                            >
                                Cancel
                            </UiButton>
                            <UiButton
                                variant="danger"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                icon={<Trash2 size={13} />}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </UiButton>
                        </div>
                    </div>
                </UiModal>
            )}
        </div>
    );
}
