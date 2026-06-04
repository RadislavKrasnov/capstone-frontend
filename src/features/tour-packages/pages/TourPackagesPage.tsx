import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    Edit2,
    MapPin,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../app/store';
import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import {
    useDeleteTourPackageMutation,
    useGetLatestPackageAnalysisQuery,
    useGetTourPackagesQuery,
} from '../api/tourPackagesApi';
import { PackageMarginText } from '../components/PackageMarginText';
import { PackageRiskBadge } from '../components/PackageRiskBadge';
import { PackageStatusBadge } from '../components/PackageStatusBadge';
import {
    TourPackageForm,
    getErrorMessage,
} from '../components/TourPackageForm';
import type { PackageStatus, TourPackage } from '../types/tourPackage.types';

const statusFilters: Array<'ALL' | PackageStatus> = [
    'ALL',
    'PUBLISHED',
    'ANALYZED',
    'DRAFT',
    'ARCHIVED',
];

const statusFilterLabels: Record<'ALL' | PackageStatus, string> = {
    ALL: 'All',
    PUBLISHED: 'Published',
    ANALYZED: 'Analyzed',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived',
};

function formatCurrency(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function getDestination(tourPackage: TourPackage) {
    const parts = [
        tourPackage.destinationCity,
        tourPackage.destinationCountry,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : '—';
}

function getPackageCode(tourPackage: TourPackage, index: number) {
    const id = String(tourPackage.id || index + 1).padStart(3, '0');

    return `PKG-${id}`;
}

function PackageAnalysisSummaryCells({
                                         tourPackage,
                                     }: {
    tourPackage: TourPackage;
}) {
    const shouldLoadLatestAnalysis =
        !!tourPackage.uuid &&
        ['ANALYZED', 'PUBLISHED'].includes(tourPackage.status);

    const {
        data: latestAnalysis,
        isFetching,
        isError,
    } = useGetLatestPackageAnalysisQuery(tourPackage.uuid, {
        skip: !shouldLoadLatestAnalysis,
    });

    const marginPercent = latestAnalysis?.financial?.grossMarginPercent ?? null;
    const riskLevel = latestAnalysis?.financial?.financialRiskLevel ?? null;

    return (
        <>
            <td className="px-5 py-4">
                {isFetching ? (
                    <span className="text-xs font-medium text-slate-300">
                        Loading...
                    </span>
                ) : isError ? (
                    <PackageMarginText marginPercent={null} />
                ) : (
                    <PackageMarginText marginPercent={marginPercent} />
                )}
            </td>

            <td className="px-5 py-4">
                <PackageStatusBadge status={tourPackage.status} />
            </td>

            <td className="px-5 py-4">
                {isFetching ? (
                    <PackageRiskBadge risk={null} />
                ) : isError ? (
                    <PackageRiskBadge risk={null} />
                ) : (
                    <PackageRiskBadge risk={riskLevel} />
                )}
            </td>
        </>
    );
}

export function TourPackagesPage() {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.auth.user);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<'ALL' | PackageStatus>('ALL');

    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedPackage, setSelectedPackage] =
        useState<TourPackage | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetTourPackagesQuery(
        {
            page: 1,
            limit: 100,
            agencyId: currentUser?.agencyId,
        },
        {
            skip: !currentUser?.agencyId,
        },
    );

    const [deleteTourPackage, { isLoading: isDeleting }] =
        useDeleteTourPackageMutation();

    const packages = data?.data ?? [];

    const visiblePackages = useMemo(() => {
        const query = search.trim().toLowerCase();

        return packages.filter((tourPackage) => {
            const destination = getDestination(tourPackage).toLowerCase();

            const matchesSearch =
                !query ||
                tourPackage.title.toLowerCase().includes(query) ||
                destination.includes(query) ||
                tourPackage.slug.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'ALL' || tourPackage.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [packages, search, statusFilter]);

    const openAdd = () => {
        setSelectedPackage(null);
        setModal('add');
    };

    const openEdit = (tourPackage: TourPackage) => {
        setSelectedPackage(tourPackage);
        setModal('edit');
    };

    const openDelete = (tourPackage: TourPackage) => {
        setSelectedPackage(tourPackage);
        setDeleteError(null);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedPackage(null);
        setDeleteError(null);
    };

    const confirmDelete = async () => {
        if (!selectedPackage) {
            return;
        }

        setDeleteError(null);

        try {
            await deleteTourPackage({ uuid: selectedPackage.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-[18px] font-semibold leading-tight text-slate-900">
                        Tour Packages
                    </h1>
                    <p className="mt-1 text-[13px] text-slate-400">
                        {packages.length} packages total
                        {isFetching ? ' · Refreshing...' : ''}
                    </p>
                </div>

                <UiButton
                    icon={<Plus size={15} />}
                    className="h-10 rounded-md px-4"
                    onClick={openAdd}
                >
                    New Package
                </UiButton>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full max-w-[420px]">
                    <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search packages or destinations..."
                        className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    {statusFilters.map((status) => {
                        const isActive = statusFilter === status;

                        return (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                className={[
                                    'h-9 rounded-md border px-4 text-[13px] font-medium transition-colors',
                                    isActive
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                                        : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50',
                                ].join(' ')}
                            >
                                {statusFilterLabels[status]}
                            </button>
                        );
                    })}
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
                        Loading packages...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <AlertTriangle size={22} className="text-red-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                Unable to load tour packages
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Please check backend availability and try again.
                            </p>
                        </div>
                        <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                            Retry
                        </UiButton>
                    </div>
                ) : visiblePackages.length === 0 ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        No packages match your search.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-100 bg-white">
                            {[
                                'Package Name',
                                'Destination',
                                'Duration',
                                'Group',
                                'Base Price',
                                'Margin',
                                'Status',
                                'Risk',
                                '',
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-50">
                        {visiblePackages.map((tourPackage, index) => (
                            <tr
                                key={tourPackage.uuid}
                                className="group transition hover:bg-slate-50/70"
                            >
                                <td className="px-5 py-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/packages/${tourPackage.uuid}`)
                                        }
                                        className="text-left"
                                    >
                                        <p className="text-[14px] font-semibold leading-tight text-blue-600 transition hover:text-blue-700">
                                            {tourPackage.title}
                                        </p>
                                        <p className="mt-0.5 text-[12px] font-medium text-slate-400">
                                            {getPackageCode(tourPackage, index)}
                                        </p>
                                    </button>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5 text-[14px] text-slate-600">
                                        <MapPin
                                            size={13}
                                            className="shrink-0 text-slate-400"
                                        />
                                        {getDestination(tourPackage)}
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-[14px] text-slate-600">
                                    {tourPackage.durationDays}d
                                </td>

                                <td className="px-5 py-4 text-[14px] text-slate-600">
                                    {tourPackage.expectedGroupSize} pax
                                </td>

                                <td className="px-5 py-4 text-[14px] font-semibold text-slate-800">
                                    {formatCurrency(
                                        tourPackage.sellingPricePerPerson,
                                        tourPackage.currencyCode,
                                    )}
                                </td>

                                <PackageAnalysisSummaryCells tourPackage={tourPackage} />

                                <td className="px-5 py-4">
                                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(tourPackage)}
                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                        >
                                            <Edit2 size={11} />
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => openDelete(tourPackage)}
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
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <UiModal
                    title={
                        modal === 'add'
                            ? 'Create New Package'
                            : `Edit Package — ${selectedPackage?.title ?? ''}`
                    }
                    onClose={closeModal}
                    widthClassName="max-w-2xl"
                >
                    <TourPackageForm
                        mode={modal}
                        tourPackage={selectedPackage}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'delete' && selectedPackage && (
                <UiModal
                    title="Delete Package"
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
                                    {selectedPackage.title}
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
