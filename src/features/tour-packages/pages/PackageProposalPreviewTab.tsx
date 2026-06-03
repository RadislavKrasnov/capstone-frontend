import { useMemo, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    MapPin,
    Send,
    Users,
    X,
} from 'lucide-react';

import { UiButton } from '../../../shared/components/UiButton';
import {
    useGetItineraryItemsQuery,
    useGetTourDaysQuery,
} from '../../itinerary/api/itineraryApi';
import type { TourDay } from '../../itinerary/types/itinerary.types';
import {
    useGetPackageExclusionsQuery,
    useGetPackageHighlightsQuery,
    useGetPackageInclusionsQuery,
} from '../api/packageContentApi';
import { useUpdateTourPackageMutation } from '../api/tourPackagesApi';
import type {
    PackageProposalItem,
    TourPackage,
} from '../types/tourPackage.types';

type PackageProposalPreviewTabProps = {
    tourPackage: TourPackage;
    onBackToEditor: () => void;
};

function getDestination(tourPackage: TourPackage) {
    const parts = [
        tourPackage.destinationCity,
        tourPackage.destinationCountry,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : '—';
}

function formatMoney(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'EUR',
        maximumFractionDigits: 0,
    }).format(value);
}

function sortProposalItems(items: PackageProposalItem[]) {
    return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function sortDays(days: TourDay[]) {
    return [...days].sort((a, b) => a.dayNumber - b.dayNumber);
}

function getErrorMessage(error: unknown) {
    if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
    ) {
        const message = error.data.message;

        if (Array.isArray(message)) {
            return message.join(', ');
        }

        if (typeof message === 'string') {
            return message;
        }
    }

    return 'Something went wrong. Please try again.';
}

export function PackageProposalPreviewTab({
                                              tourPackage,
                                              onBackToEditor,
                                          }: PackageProposalPreviewTabProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [updateTourPackage, { isLoading: isPublishing }] =
        useUpdateTourPackageMutation();

    const highlightsQuery = useGetPackageHighlightsQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const inclusionsQuery = useGetPackageInclusionsQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const exclusionsQuery = useGetPackageExclusionsQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const daysQuery = useGetTourDaysQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const highlights = useMemo(
        () => sortProposalItems(highlightsQuery.data?.data ?? []),
        [highlightsQuery.data?.data],
    );

    const inclusions = useMemo(
        () => sortProposalItems(inclusionsQuery.data?.data ?? []),
        [inclusionsQuery.data?.data],
    );

    const exclusions = useMemo(
        () => sortProposalItems(exclusionsQuery.data?.data ?? []),
        [exclusionsQuery.data?.data],
    );

    const days = useMemo(
        () => sortDays(daysQuery.data?.data ?? []),
        [daysQuery.data?.data],
    );

    const isLoading =
        highlightsQuery.isLoading ||
        inclusionsQuery.isLoading ||
        exclusionsQuery.isLoading ||
        daysQuery.isLoading;

    const handlePublish = async () => {
        setServerError(null);
        setSuccessMessage(null);

        try {
            await updateTourPackage({
                uuid: tourPackage.uuid,
                body: {
                    status: 'PUBLISHED',
                },
            }).unwrap();

            setSuccessMessage('Package was published successfully.');
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    return (
        <div className="max-w-[900px] space-y-5">
            <div className="flex items-center justify-between gap-4">
                <p className="flex items-center gap-2 text-[13px] text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-slate-300" />
                    Preview mode — customers will see this content
                </p>

                <div className="flex items-center gap-2">
                    <UiButton
                        variant="secondary"
                        icon={<ArrowLeft size={13} />}
                        onClick={onBackToEditor}
                    >
                        Back to Editor
                    </UiButton>

                    <UiButton
                        icon={<Send size={14} />}
                        onClick={handlePublish}
                        disabled={isPublishing}
                    >
                        {isPublishing ? 'Publishing...' : 'Publish Package'}
                    </UiButton>
                </div>
            </div>

            {serverError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                </div>
            )}

            {successMessage && (
                <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-slate-950 px-10 py-10 text-white">
                    <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-blue-400">
                        {tourPackage.agency?.name ?? 'Wandercraft Travel'}
                    </p>

                    <h1 className="mt-5 text-[32px] font-bold leading-tight">
                        {tourPackage.title}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-5 text-[14px] text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={15} />
                            {getDestination(tourPackage)}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={15} />
                            {tourPackage.durationDays} days
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                            <Users size={15} />
                            Max {tourPackage.expectedGroupSize} travellers
                        </span>
                    </div>

                    <div className="mt-8 flex items-end gap-2">
                        <span className="mb-2 text-sm text-slate-400">from</span>
                        <span className="text-[42px] font-bold leading-none">
                            {formatMoney(
                                Number(tourPackage.sellingPricePerPerson),
                                tourPackage.currencyCode,
                            )}
                        </span>
                        <span className="mb-2 text-sm text-slate-400">
                            / person
                        </span>
                    </div>
                </div>

                <div className="px-10 py-8">
                    {isLoading ? (
                        <div className="py-16 text-center text-sm text-slate-400">
                            Loading proposal preview...
                        </div>
                    ) : (
                        <div className="space-y-9">
                            {tourPackage.description && (
                                <section className="border-b border-slate-100 pb-8">
                                    <p className="max-w-2xl text-[15px] leading-7 text-slate-600">
                                        {tourPackage.description}
                                    </p>
                                </section>
                            )}

                            <section className="border-b border-slate-100 pb-8">
                                <SectionTitle>Highlights</SectionTitle>

                                {highlights.length === 0 ? (
                                    <EmptySectionText>
                                        No highlights have been added yet.
                                    </EmptySectionText>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                        {highlights.map((item) => (
                                            <ProposalCheckItem
                                                key={item.uuid}
                                                text={item.text}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="border-b border-slate-100 pb-8">
                                <SectionTitle>Itinerary</SectionTitle>

                                {days.length === 0 ? (
                                    <EmptySectionText>
                                        No itinerary days have been added yet.
                                    </EmptySectionText>
                                ) : (
                                    <div className="space-y-5">
                                        {days.map((day) => (
                                            <ProposalItineraryDay
                                                key={day.uuid}
                                                day={day}
                                            />
                                        ))}
                                    </div>
                                )}
                            </section>

                            <section className="border-b border-slate-100 pb-8">
                                <SectionTitle>What's Included</SectionTitle>

                                <div className="grid grid-cols-2 gap-10">
                                    <div>
                                        <p className="mb-4 text-[12px] font-bold uppercase tracking-wide text-slate-400">
                                            Included
                                        </p>

                                        {inclusions.length === 0 ? (
                                            <EmptySectionText>
                                                No inclusions have been added yet.
                                            </EmptySectionText>
                                        ) : (
                                            <div className="space-y-3">
                                                {inclusions.map((item) => (
                                                    <ProposalCheckItem
                                                        key={item.uuid}
                                                        text={item.text}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <p className="mb-4 text-[12px] font-bold uppercase tracking-wide text-slate-400">
                                            Not Included
                                        </p>

                                        {exclusions.length === 0 ? (
                                            <EmptySectionText>
                                                No exclusions have been added yet.
                                            </EmptySectionText>
                                        ) : (
                                            <div className="space-y-3">
                                                {exclusions.map((item) => (
                                                    <ProposalExcludedItem
                                                        key={item.uuid}
                                                        text={item.text}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <p className="text-center text-xs text-slate-400">
                                Prices are per person · subject to availability · minimum group size may apply
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProposalItineraryDay({ day }: { day: TourDay }) {
    const { data } = useGetItineraryItemsQuery({
        page: 1,
        limit: 100,
        dayId: day.id,
    });

    const items = useMemo(
        () => [...(data?.data ?? [])].sort((a, b) => a.itemOrder - b.itemOrder),
        [data?.data],
    );

    const summary =
        day.description ||
        items
            .slice(0, 3)
            .map((item) => item.title)
            .join(', ') ||
        'Detailed itinerary will be confirmed soon.';

    return (
        <div className="flex gap-5">
            <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {day.dayNumber}
                </span>
                <span className="mt-1 h-full w-px bg-slate-100" />
            </div>

            <div className="pb-4">
                <h3 className="text-[15px] font-bold text-slate-900">
                    Day {day.dayNumber} — {day.title}
                </h3>
                <p className="mt-2 text-[14px] leading-6 text-slate-500">
                    {summary}
                </p>
            </div>
        </div>
    );
}

function ProposalCheckItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3 text-[14px] text-slate-600">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-green-500" />
            <span>{text}</span>
        </div>
    );
}

function ProposalExcludedItem({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-3 text-[14px] text-slate-500">
            <X size={15} className="mt-0.5 shrink-0 text-slate-400" />
            <span>{text}</span>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="mb-5 text-[13px] font-bold uppercase tracking-[0.18em] text-slate-400">
            {children}
        </h2>
    );
}

function EmptySectionText({ children }: { children: React.ReactNode }) {
    return <p className="text-sm text-slate-400">{children}</p>;
}
