import { useMemo, useState } from 'react';
import { AlertTriangle, Edit2, MapPin, Plus, Trash2 } from 'lucide-react';

import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import {
    useDeleteItineraryItemMutation,
    useDeleteTourDayMutation,
    useGetItineraryItemsQuery,
} from '../api/itineraryApi';
import type { ItineraryIntensity, ItineraryItem, TourDay } from '../types/itinerary.types';
import { ItineraryItemForm } from './ItineraryItemForm';
import { ItineraryTypeBadge } from './ItineraryTypeBadge';
import { TourDayForm, getErrorMessage } from './TourDayForm';

type ItineraryDayCardProps = {
    day: TourDay;
};

function formatTime(value?: string | null) {
    return value ? value.slice(0, 5) : '—';
}

function getLocation(item: ItineraryItem) {
    if (item.locationName) {
        return item.locationName;
    }

    if (item.startLocation && item.endLocation) {
        return `${item.startLocation} → ${item.endLocation}`;
    }

    return item.startLocation ?? item.endLocation ?? '—';
}

function getIntensityLabel(value?: ItineraryIntensity | null) {
    if (value === 'LOW') {
        return 'Easy';
    }

    if (value === 'MEDIUM') {
        return 'Medium';
    }

    if (value === 'HIGH') {
        return 'Demanding';
    }

    return '—';
}

function getIntensityClass(value?: ItineraryIntensity | null) {
    if (value === 'LOW') {
        return 'text-green-600';
    }

    if (value === 'MEDIUM') {
        return 'text-amber-600';
    }

    if (value === 'HIGH') {
        return 'text-red-600';
    }

    return 'text-slate-300';
}

export function ItineraryDayCard({ day }: ItineraryDayCardProps) {
    const [modal, setModal] = useState<'edit-day' | 'delete-day' | 'add-item' | 'edit-item' | 'delete-item' | null>(null);
    const [selectedItem, setSelectedItem] = useState<ItineraryItem | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetItineraryItemsQuery({
        page: 1,
        limit: 100,
        dayId: day.id,
    });

    const [deleteTourDay, { isLoading: isDeletingDay }] = useDeleteTourDayMutation();
    const [deleteItineraryItem, { isLoading: isDeletingItem }] =
        useDeleteItineraryItemMutation();

    const items = useMemo(
        () => [...(data?.data ?? [])].sort((a, b) => a.itemOrder - b.itemOrder),
        [data?.data],
    );

    const nextItemOrder = items.length
        ? Math.max(...items.map((item) => item.itemOrder)) + 1
        : 1;

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setDeleteError(null);
    };

    const confirmDeleteDay = async () => {
        setDeleteError(null);

        try {
            await deleteTourDay({ uuid: day.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    const confirmDeleteItem = async () => {
        if (!selectedItem) {
            return;
        }

        setDeleteError(null);

        try {
            await deleteItineraryItem({ uuid: selectedItem.uuid }).unwrap();
            closeModal();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex border-b border-slate-100">
                <div className="flex w-[58px] shrink-0 flex-col items-center justify-center bg-slate-800 text-white">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-300">
                        Day
                    </span>
                    <span className="text-[22px] font-semibold leading-none">
                        {day.dayNumber}
                    </span>
                </div>

                <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
                    <div>
                        <h3 className="text-[15px] font-semibold text-slate-900">
                            Day {day.dayNumber} — {day.title}
                        </h3>
                        <p className="mt-1 text-[12px] text-slate-400">
                            {day.description || (day.isRestDay ? 'Rest day' : 'No description yet')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <UiButton
                            variant="secondary"
                            size="sm"
                            icon={<Edit2 size={13} />}
                            onClick={() => setModal('edit-day')}
                        >
                            Edit
                        </UiButton>
                        <UiButton
                            variant="secondary"
                            size="sm"
                            icon={<Trash2 size={13} />}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setModal('delete-day')}
                        >
                            Delete
                        </UiButton>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                    Loading day items...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-between px-5 py-5 text-sm text-red-600">
                    <span>Unable to load itinerary items.</span>
                    <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                        Retry
                    </UiButton>
                </div>
            ) : items.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                    No itinerary items yet.
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                    <tr>
                        {['Time', 'Type', 'Title', 'Location', 'Intensity', ''].map(
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
                    {items.map((item) => (
                        <tr key={item.uuid} className="group hover:bg-slate-50/60">
                            <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] text-slate-500">
                                {formatTime(item.startTime)} - {formatTime(item.endTime)}
                            </td>

                            <td className="px-5 py-4">
                                <ItineraryTypeBadge type={item.type} />
                            </td>

                            <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-slate-800">
                                    {item.title}
                                </p>
                                {item.description && (
                                    <p className="mt-0.5 text-xs text-slate-400">
                                        {item.description}
                                    </p>
                                )}
                            </td>

                            <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin size={12} />
                                        {getLocation(item)}
                                    </span>
                            </td>

                            <td className="px-5 py-4">
                                    <span
                                        className={[
                                            'text-xs font-semibold',
                                            getIntensityClass(item.intensity),
                                        ].join(' ')}
                                    >
                                        {getIntensityLabel(item.intensity)}
                                    </span>
                            </td>

                            <td className="px-5 py-4">
                                <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setModal('edit-item');
                                        }}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                    >
                                        <Edit2 size={11} />
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedItem(item);
                                            setDeleteError(null);
                                            setModal('delete-item');
                                        }}
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

            <div className="border-t border-slate-100 px-5 py-3">
                <button
                    type="button"
                    onClick={() => setModal('add-item')}
                    className="inline-flex items-center gap-2 text-[13px] font-medium text-blue-600 transition hover:text-blue-700"
                >
                    <Plus size={14} />
                    Add Item
                </button>
            </div>

            {modal === 'edit-day' && (
                <UiModal
                    title={`Edit Day ${day.dayNumber}`}
                    onClose={closeModal}
                    widthClassName="max-w-lg"
                >
                    <TourDayForm
                        mode="edit"
                        packageId={day.packageId}
                        day={day}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'add-item' && (
                <UiModal
                    title={`Add Item — Day ${day.dayNumber}`}
                    onClose={closeModal}
                    widthClassName="max-w-2xl"
                >
                    <ItineraryItemForm
                        mode="add"
                        dayId={day.id}
                        nextItemOrder={nextItemOrder}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'edit-item' && selectedItem && (
                <UiModal
                    title={`Edit Item — ${selectedItem.title}`}
                    onClose={closeModal}
                    widthClassName="max-w-2xl"
                >
                    <ItineraryItemForm
                        mode="edit"
                        dayId={day.id}
                        item={selectedItem}
                        onCancel={closeModal}
                        onSuccess={closeModal}
                    />
                </UiModal>
            )}

            {modal === 'delete-day' && (
                <ConfirmDeleteModal
                    title="Delete Day"
                    text={`Are you sure you want to delete Day ${day.dayNumber}? All itinerary items for this day will also be deleted.`}
                    error={deleteError}
                    isDeleting={isDeletingDay}
                    onClose={closeModal}
                    onConfirm={confirmDeleteDay}
                />
            )}

            {modal === 'delete-item' && selectedItem && (
                <ConfirmDeleteModal
                    title="Delete Item"
                    text={`Are you sure you want to delete "${selectedItem.title}"?`}
                    error={deleteError}
                    isDeleting={isDeletingItem}
                    onClose={closeModal}
                    onConfirm={confirmDeleteItem}
                />
            )}
        </div>
    );
}

function ConfirmDeleteModal({
                                title,
                                text,
                                error,
                                isDeleting,
                                onClose,
                                onConfirm,
                            }: {
    title: string;
    text: string;
    error: string | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <UiModal title={title} onClose={onClose} widthClassName="max-w-sm">
            <div className="space-y-4">
                {error && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-3">
                    <AlertTriangle
                        size={16}
                        className="mt-0.5 shrink-0 text-red-500"
                    />
                    <p className="text-sm leading-relaxed text-red-700">{text}</p>
                </div>

                <div className="flex justify-end gap-2">
                    <UiButton variant="secondary" onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </UiButton>
                    <UiButton
                        variant="danger"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        icon={<Trash2 size={13} />}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </UiButton>
                </div>
            </div>
        </UiModal>
    );
}
