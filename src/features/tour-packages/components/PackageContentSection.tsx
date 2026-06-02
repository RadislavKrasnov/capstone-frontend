import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Edit2,
    Plus,
    Star,
    Trash2,
    X,
} from 'lucide-react';

import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import {
    useDeletePackageExclusionMutation,
    useDeletePackageHighlightMutation,
    useDeletePackageInclusionMutation,
} from '../api/packageContentApi';
import type {
    PackageContentItem,
    PackageContentType,
} from '../types/packageContent.types';
import {
    PackageContentItemForm,
    getErrorMessage,
} from './PackageContentItemForm';

type PackageContentSectionProps = {
    type: PackageContentType;
    packageId: number;
    title: string;
    addButtonLabel: string;
    items: PackageContentItem[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onChanged: () => void;
};

const iconByType: Record<PackageContentType, React.ReactNode> = {
    highlight: <Star size={16} />,
    inclusion: <CheckCircle2 size={16} />,
    exclusion: <X size={16} />,
};

const iconClassByType: Record<PackageContentType, string> = {
    highlight: 'bg-amber-50 text-amber-600',
    inclusion: 'bg-green-50 text-green-600',
    exclusion: 'bg-red-50 text-red-500',
};

export function PackageContentSection({
                                          type,
                                          packageId,
                                          title,
                                          addButtonLabel,
                                          items,
                                          isLoading,
                                          isError,
                                          onRetry,
                                          onChanged,
                                      }: PackageContentSectionProps) {
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
    const [selectedItem, setSelectedItem] =
        useState<PackageContentItem | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [deleteHighlight, { isLoading: isDeletingHighlight }] =
        useDeletePackageHighlightMutation();
    const [deleteInclusion, { isLoading: isDeletingInclusion }] =
        useDeletePackageInclusionMutation();
    const [deleteExclusion, { isLoading: isDeletingExclusion }] =
        useDeletePackageExclusionMutation();

    const sortedItems = useMemo(
        () => [...items].sort((a, b) => a.displayOrder - b.displayOrder),
        [items],
    );

    const nextDisplayOrder = sortedItems.length
        ? Math.max(...sortedItems.map((item) => item.displayOrder)) + 1
        : 1;

    const isDeleting =
        isDeletingHighlight || isDeletingInclusion || isDeletingExclusion;

    const openAdd = () => {
        setSelectedItem(null);
        setDeleteError(null);
        setModal('add');
    };

    const openEdit = (item: PackageContentItem) => {
        setSelectedItem(item);
        setDeleteError(null);
        setModal('edit');
    };

    const openDelete = (item: PackageContentItem) => {
        setSelectedItem(item);
        setDeleteError(null);
        setModal('delete');
    };

    const closeModal = () => {
        setModal(null);
        setSelectedItem(null);
        setDeleteError(null);
    };

    const handleSuccess = () => {
        closeModal();
        onChanged();
    };

    const confirmDelete = async () => {
        if (!selectedItem) {
            return;
        }

        setDeleteError(null);

        try {
            if (type === 'highlight') {
                await deleteHighlight({ uuid: selectedItem.uuid }).unwrap();
            }

            if (type === 'inclusion') {
                await deleteInclusion({ uuid: selectedItem.uuid }).unwrap();
            }

            if (type === 'exclusion') {
                await deleteExclusion({ uuid: selectedItem.uuid }).unwrap();
            }

            handleSuccess();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div
                        className={[
                            'flex h-8 w-8 items-center justify-center rounded-lg',
                            iconClassByType[type],
                        ].join(' ')}
                    >
                        {iconByType[type]}
                    </div>

                    <div>
                        <h3 className="text-[15px] font-semibold leading-tight text-slate-900">
                            {title}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-400">
                            {sortedItems.length} items
                        </p>
                    </div>
                </div>

                <UiButton
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={openAdd}
                >
                    {addButtonLabel}
                </UiButton>
            </div>

            {isLoading ? (
                <div className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading {title.toLowerCase()}...
                </div>
            ) : isError ? (
                <div className="flex items-center justify-between px-5 py-5 text-sm text-red-600">
                    <span>Unable to load {title.toLowerCase()}.</span>
                    <UiButton size="sm" variant="secondary" onClick={onRetry}>
                        Retry
                    </UiButton>
                </div>
            ) : sortedItems.length === 0 ? (
                <div className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-slate-800">
                        No {title.toLowerCase()} yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Add the first item to prepare customer-facing package content.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {sortedItems.map((item, index) => (
                        <div
                            key={item.uuid}
                            className="group flex min-h-[56px] items-center justify-between gap-4 px-5 py-3 transition hover:bg-slate-50/70"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                                    {index + 1}
                                </span>

                                <p className="truncate text-[14px] font-medium text-slate-800">
                                    {item.text}
                                </p>
                            </div>

                            <div className="flex shrink-0 justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-100"
                                >
                                    <Edit2 size={11} />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openDelete(item)}
                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-[11px] font-medium text-red-500 transition hover:bg-red-50"
                                >
                                    <Trash2 size={11} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {(modal === 'add' || modal === 'edit') && (
                <UiModal
                    title={
                        modal === 'add'
                            ? addButtonLabel
                            : `Edit ${title.slice(0, -1)}`
                    }
                    onClose={closeModal}
                    widthClassName="max-w-lg"
                >
                    <PackageContentItemForm
                        type={type}
                        mode={modal}
                        packageId={packageId}
                        item={selectedItem}
                        nextDisplayOrder={nextDisplayOrder}
                        onCancel={closeModal}
                        onSuccess={handleSuccess}
                    />
                </UiModal>
            )}

            {modal === 'delete' && selectedItem && (
                <UiModal
                    title={`Delete ${title.slice(0, -1)}`}
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
                                    {selectedItem.text}
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
