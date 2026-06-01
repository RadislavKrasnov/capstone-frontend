import { useMemo, useState } from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

import { UiButton } from '../../../shared/components/UiButton';
import { UiModal } from '../../../shared/components/UiModal';
import type { TourPackage } from '../../tour-packages/types/tourPackage.types';
import { useGetTourDaysQuery } from '../api/itineraryApi';
import { ItineraryDayCard } from '../components/ItineraryDayCard';
import { TourDayForm } from '../components/TourDayForm';

type PackageItineraryTabProps = {
    tourPackage: TourPackage;
};

export function PackageItineraryTab({ tourPackage }: PackageItineraryTabProps) {
    const [isAddDayOpen, setIsAddDayOpen] = useState(false);

    const {
        data,
        isLoading,
        isFetching,
        isError,
        refetch,
    } = useGetTourDaysQuery({
        page: 1,
        limit: 100,
        packageId: tourPackage.id,
    });

    const days = useMemo(
        () => [...(data?.data ?? [])].sort((a, b) => a.dayNumber - b.dayNumber),
        [data?.data],
    );

    const nextDayNumber = days.length
        ? Math.max(...days.map((day) => day.dayNumber)) + 1
        : 1;

    return (
        <div className="max-w-[980px] space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-slate-900">
                        Itinerary
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-400">
                        {days.length} days
                        {isFetching ? ' · Refreshing...' : ''}
                    </p>
                </div>

                <UiButton
                    icon={<Plus size={15} />}
                    className="h-10 px-5"
                    onClick={() => setIsAddDayOpen(true)}
                >
                    Add Day
                </UiButton>
            </div>

            {isLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-400 shadow-sm">
                    Loading itinerary...
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                    <AlertTriangle size={22} className="text-red-500" />
                    <div>
                        <p className="text-sm font-medium text-slate-800">
                            Unable to load itinerary
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                            Please check backend availability and try again.
                        </p>
                    </div>
                    <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                        Retry
                    </UiButton>
                </div>
            ) : days.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-800">
                        No itinerary days yet
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Add the first day to start building the package schedule.
                    </p>
                    <UiButton
                        className="mt-4"
                        icon={<Plus size={15} />}
                        onClick={() => setIsAddDayOpen(true)}
                    >
                        Add Day
                    </UiButton>
                </div>
            ) : (
                <div className="space-y-4">
                    {days.map((day) => (
                        <ItineraryDayCard key={day.uuid} day={day} />
                    ))}
                </div>
            )}

            {isAddDayOpen && (
                <UiModal
                    title="Add Day"
                    onClose={() => setIsAddDayOpen(false)}
                    widthClassName="max-w-lg"
                >
                    <TourDayForm
                        mode="add"
                        packageId={tourPackage.id}
                        nextDayNumber={nextDayNumber}
                        onCancel={() => setIsAddDayOpen(false)}
                        onSuccess={() => setIsAddDayOpen(false)}
                    />
                </UiModal>
            )}
        </div>
    );
}
