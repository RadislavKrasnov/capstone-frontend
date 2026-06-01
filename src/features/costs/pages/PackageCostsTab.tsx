import { useMemo, useState } from 'react';
import { AlertTriangle, Edit2, Plus, Trash2 } from 'lucide-react';

import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import type { TourPackage } from '../../tour-packages/types/tourPackage.types';
import { useGetSuppliersQuery } from '../../suppliers/api/suppliersApi';
import { useGetTourDaysQuery } from '../../itinerary/api/itineraryApi';
import {
    useDeleteCostItemMutation,
    useGetCostItemsQuery,
} from '../api/costItemsApi';
import { CostCategoryBadge } from '../components/CostCategoryBadge';
import { CostItemForm, getErrorMessage } from '../components/CostItemForm';
import { CostTypeBadge } from '../components/CostTypeBadge';
import type { CostItem, CostType } from '../types/cost.types';

type PackageCostsTabProps = {
    tourPackage: TourPackage;
};

function toNumber(value: number | string | null | undefined) {
    return Number(value ?? 0);
}

function calculateLineTotal(
    item: Pick<CostItem, 'costType' | 'quantity' | 'unitCost'>,
    groupSize: number,
    durationDays: number,
) {
    const quantity = toNumber(item.quantity);
    const unitCost = toNumber(item.unitCost);

    if (item.costType === 'PER_PERSON') {
        return quantity * unitCost * groupSize;
    }

    if (item.costType === 'PER_DAY') {
        return quantity * unitCost * durationDays;
    }

    return quantity * unitCost;
}

function formatMoney(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatPlainMoney(value: number) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function getMultiplierText(costType: CostType, groupSize: number, durationDays: number) {
    if (costType === 'PER_PERSON') {
        return `× ${groupSize}`;
    }

    if (costType === 'PER_DAY') {
        return `× ${durationDays}`;
    }

    return '';
}

export function PackageCostsTab({ tourPackage }: PackageCostsTabProps) {
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedCostItem, setSelectedCostItem] = useState<CostItem | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetCostItemsQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const { data: suppliersData } = useGetSuppliersQuery(
        {
            page: 1,
            limit: 100,
            agencyId: tourPackage.agencyId,
        },
        {
            skip: !tourPackage.agencyId,
        },
    );

    const { data: daysData } = useGetTourDaysQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const [deleteCostItem, { isLoading: isDeleting }] =
        useDeleteCostItemMutation();

    const costItems = useMemo(
        () => [...(data?.data ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
        [data?.data],
    );

    const suppliers = suppliersData?.data ?? [];
    const days = useMemo(
        () => [...(daysData?.data ?? [])].sort((a, b) => a.dayNumber - b.dayNumber),
        [daysData?.data],
    );

    const groupSize = tourPackage.expectedGroupSize;
    const durationDays = tourPackage.durationDays;
    const currencyCode = tourPackage.currencyCode;

    const totalCost = costItems.reduce(
        (sum, item) => sum + calculateLineTotal(item, groupSize, durationDays),
        0,
    );
    const costPerPerson = groupSize > 0 ? totalCost / groupSize : 0;
    const revenue = tourPackage.sellingPricePerPerson * groupSize;
    const grossProfit = revenue - totalCost;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const openAdd = () => {
        setSelectedCostItem(null);
        setModal('add');
    };

    const openEdit = (costItem: CostItem) => {
        setSelectedCostItem(costItem);
        setModal('edit');
    };

    const openDelete = (costItem: CostItem) => {
        setSelectedCostItem(costItem);
        setDeleteError(null);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedCostItem(null);
        setDeleteError(null);
    };

    const confirmDelete = async () => {
        if (!selectedCostItem) {
            return;
        }

        setDeleteError(null);

        try {
            await deleteCostItem({ uuid: selectedCostItem.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="max-w-[1120px] space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-slate-900">
                        Costs
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-400">
                        {costItems.length} cost items · group size {groupSize} pax
                        {isFetching ? ' · Refreshing...' : ''}
                    </p>
                </div>

                <UiButton
                    icon={<Plus size={15} />}
                    className="h-10 px-5"
                    onClick={openAdd}
                >
                    Add Cost Item
                </UiButton>
            </div>

            <div className="grid max-w-[980px] grid-cols-4 gap-4">
                <SummaryCard
                    label="Total Cost"
                    value={formatMoney(totalCost, currencyCode)}
                    hint="all items combined"
                />
                <SummaryCard
                    label="Cost / Person"
                    value={formatMoney(costPerPerson, currencyCode)}
                    hint={`based on ${groupSize} pax`}
                />
                <SummaryCard
                    label="Revenue"
                    value={formatMoney(revenue, currencyCode)}
                    hint={`${formatMoney(tourPackage.sellingPricePerPerson, currencyCode)} × ${groupSize} pax`}
                />
                <SummaryCard
                    label="Gross Margin"
                    value={`${grossMargin.toFixed(1)}%`}
                    hint={`${formatMoney(grossProfit, currencyCode)} profit`}
                    isNegative={grossProfit < 0}
                />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Cost Items
                    </h3>
                    <p className="text-xs text-slate-400">
                        Costs marked Per Person are multiplied by group size ({groupSize}) automatically.
                    </p>
                </div>

                {isLoading ? (
                    <div className="px-5 py-16 text-center text-sm text-slate-400">
                        Loading cost items...
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center gap-3 px-5 py-16 text-center">
                        <AlertTriangle size={22} className="text-red-500" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">
                                Unable to load cost items
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Please check backend availability and try again.
                            </p>
                        </div>
                        <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                            Retry
                        </UiButton>
                    </div>
                ) : costItems.length === 0 ? (
                    <div className="px-5 py-16 text-center shadow-sm">
                        <p className="text-sm font-medium text-slate-800">
                            No cost items yet
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Add the first cost item to calculate profitability.
                        </p>
                        <UiButton
                            className="mt-4"
                            icon={<Plus size={15} />}
                            onClick={openAdd}
                        >
                            Add Cost Item
                        </UiButton>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-slate-100">
                            {[
                                'Name',
                                'Category',
                                'Type',
                                'Qty',
                                'Unit Cost',
                                'Total',
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
                        {costItems.map((costItem) => {
                            const total = calculateLineTotal(
                                costItem,
                                groupSize,
                                durationDays,
                            );

                            return (
                                <tr
                                    key={costItem.uuid}
                                    className="group transition hover:bg-slate-50/70"
                                >
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            {costItem.name}
                                        </p>
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {costItem.description ||
                                                costItem.supplier?.name ||
                                                'No description'}
                                        </p>
                                    </td>

                                    <td className="px-5 py-4">
                                        <CostCategoryBadge category={costItem.category} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <CostTypeBadge costType={costItem.costType} />
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="text-sm text-slate-700">
                                            {formatPlainMoney(toNumber(costItem.quantity))}
                                            <span className="ml-1 text-xs text-slate-400">
                                                {getMultiplierText(
                                                    costItem.costType,
                                                    groupSize,
                                                    durationDays,
                                                )}
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                        {costItem.currencyCode}{' '}
                                        {formatPlainMoney(toNumber(costItem.unitCost))}
                                    </td>

                                    <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                        {costItem.currencyCode}{' '}
                                        {formatPlainMoney(total)}
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(costItem)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                            >
                                                <Edit2 size={11} />
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => openDelete(costItem)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-medium text-red-500 transition hover:bg-red-50"
                                            >
                                                <Trash2 size={11} />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <UiModal
                    title={
                        modal === 'add'
                            ? 'Add Cost Item'
                            : `Edit Cost Item — ${selectedCostItem?.name ?? ''}`
                    }
                    onClose={closeModal}
                    widthClassName="max-w-2xl"
                >
                    <CostItemForm
                        mode={modal}
                        packageId={tourPackage.id}
                        defaultCurrencyCode={currencyCode}
                        costItem={selectedCostItem}
                        suppliers={suppliers}
                        days={days}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'delete' && selectedCostItem && (
                <UiModal
                    title="Delete Cost Item"
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
                                    {selectedCostItem.name}
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

function SummaryCard({
                         label,
                         value,
                         hint,
                         isNegative = false,
                     }: {
    label: string;
    value: string;
    hint: string;
    isNegative?: boolean;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p
                className={[
                    'mt-2 text-[20px] font-bold leading-tight',
                    isNegative ? 'text-red-600' : 'text-slate-900',
                ].join(' ')}
            >
                {value}
            </p>
            <p
                className={[
                    'mt-2 text-[12px]',
                    isNegative ? 'text-red-500' : 'text-slate-400',
                ].join(' ')}
            >
                {hint}
            </p>
        </div>
    );
}
