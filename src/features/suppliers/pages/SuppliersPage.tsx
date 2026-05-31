import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    Edit2,
    Mail,
    Phone,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import {
    useDeleteSupplierMutation,
    useGetSuppliersQuery,
} from '../api/suppliersApi';
import {
    SupplierForm,
    getErrorMessage,
} from '../components/SupplierForm';
import { SupplierTypeBadge } from '../components/SupplierTypeBadge';
import type { Supplier } from '../types/supplier.types';

function getAgencyName(supplier: Supplier) {
    return supplier.agency?.name ?? `Agency #${supplier.agencyId}`;
}

export function SuppliersPage() {
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedSupplier, setSelectedSupplier] =
        useState<Supplier | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetSuppliersQuery(
        {
            page: 1,
            limit: 100,
            agencyId: currentUser?.agencyId,
        },
        {
            skip: !currentUser?.agencyId,
        },
    );

    const [deleteSupplier, { isLoading: isDeleting }] =
        useDeleteSupplierMutation();

    const suppliers = data?.data ?? [];

    const visibleSuppliers = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return suppliers;
        }

        return suppliers.filter((supplier) => {
            return (
                supplier.name.toLowerCase().includes(query) ||
                supplier.type?.toLowerCase().includes(query) ||
                supplier.contactEmail?.toLowerCase().includes(query) ||
                supplier.contactPhone?.toLowerCase().includes(query) ||
                supplier.agency?.name.toLowerCase().includes(query)
            );
        });
    }, [search, suppliers]);

    const openAdd = () => {
        setSelectedSupplier(null);
        setModal('add');
    };

    const openEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setModal('edit');
    };

    const openDelete = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setDeleteError(null);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedSupplier(null);
        setDeleteError(null);
    };

    const confirmDelete = async () => {
        if (!selectedSupplier) {
            return;
        }

        setDeleteError(null);

        try {
            await deleteSupplier({ uuid: selectedSupplier.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-[18px] font-semibold leading-tight text-slate-900">
                        Suppliers
                    </h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        {suppliers.length} suppliers registered
                        {isFetching ? ' · Refreshing...' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-[230px]">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search suppliers..."
                            className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <UiButton icon={<Plus size={15} />} onClick={openAdd}>
                        New Supplier
                    </UiButton>
                </div>
            </div>

            {!currentUser?.agencyId ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
                    Agency is missing for the current user. Please sign in again.
                </div>
            ) : null}

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        Loading suppliers...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <AlertTriangle size={22} className="text-red-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                Unable to load suppliers
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Please check backend availability and try again.
                            </p>
                        </div>
                        <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                            Retry
                        </UiButton>
                    </div>
                ) : visibleSuppliers.length === 0 ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        {search
                            ? 'No suppliers match your search.'
                            : 'No suppliers yet. Add your first supplier.'}
                    </div>
                ) : (
                    <>
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                {[
                                    'Name',
                                    'Type',
                                    'Email',
                                    'Phone',
                                    '',
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50">
                            {visibleSuppliers.map((supplier) => (
                                <tr
                                    key={supplier.uuid}
                                    className="group transition hover:bg-slate-50/70"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {supplier.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {getAgencyName(supplier)}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <SupplierTypeBadge type={supplier.type} />
                                    </td>

                                    <td className="px-5 py-4">
                                        {supplier.contactEmail ? (
                                            <a
                                                href={`mailto:${supplier.contactEmail}`}
                                                className="flex items-center gap-1.5 text-xs text-slate-600 transition hover:text-blue-600"
                                            >
                                                <Mail
                                                    size={12}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                {supplier.contactEmail}
                                            </a>
                                        ) : (
                                            <span className="text-xs text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        {supplier.contactPhone ? (
                                            <span className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <Phone
                                                    size={12}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                {supplier.contactPhone}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-300">
                                                —
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(supplier)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                            >
                                                <Edit2 size={11} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDelete(supplier)}
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
                            {visibleSuppliers.length} of {suppliers.length} suppliers
                            {isFetching ? ' · Refreshing...' : null}
                        </div>
                    </>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <UiModal
                    title={
                        modal === 'add'
                            ? 'New Supplier'
                            : `Edit Supplier — ${selectedSupplier?.name ?? ''}`
                    }
                    onClose={closeModal}
                    widthClassName="max-w-lg"
                >
                    <SupplierForm
                        mode={modal}
                        supplier={selectedSupplier}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'delete' && selectedSupplier && (
                <UiModal
                    title="Delete Supplier"
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
                                    {selectedSupplier.name}
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
