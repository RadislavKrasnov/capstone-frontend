import { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import { useGetTourPackageQuery } from '../api/tourPackagesApi';
import { TourPackageOverviewForm } from '../components/TourPackageOverviewForm';
import {
    PackageWorkspaceTabs,
    type PackageWorkspaceTab,
} from '../components/PackageWorkspaceTabs';
import type { TourPackage } from '../types/tourPackage.types';

function getDestination(tourPackage: TourPackage) {
    const parts = [
        tourPackage.destinationCity,
        tourPackage.destinationCountry,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : '—';
}

function getPackageCode(tourPackage: TourPackage) {
    return `PKG-${String(tourPackage.id).padStart(3, '0')}`;
}

export function TourPackageDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<PackageWorkspaceTab>('overview');

    const {
        data: tourPackage,
        isLoading,
        isError,
        refetch,
    } = useGetTourPackageQuery(uuid ?? '', {
        skip: !uuid,
    });

    if (!uuid) {
        return (
            <div className="rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
                Package UUID is missing.
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-400 shadow-sm">
                Loading package...
            </div>
        );
    }

    if (isError || !tourPackage) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                <AlertTriangle size={22} className="text-red-500" />
                <div>
                    <p className="text-sm font-medium text-slate-800">
                        Unable to load package
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Please check backend availability and try again.
                    </p>
                </div>
                <div className="flex gap-2">
                    <UiButton
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate('/packages')}
                    >
                        Back to Packages
                    </UiButton>
                    <UiButton size="sm" variant="secondary" onClick={() => refetch()}>
                        Retry
                    </UiButton>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PackageWorkspaceTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => navigate('/packages')}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-slate-600"
                >
                    <ArrowLeft size={13} />
                    Back to packages
                </button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <TourPackageOverviewForm tourPackage={tourPackage} />

                    <div className="grid max-w-[980px] grid-cols-4 gap-3">
                        <SummaryCard label="Package ID" value={getPackageCode(tourPackage)} />
                        <SummaryCard label="Destination" value={getDestination(tourPackage)} />
                        <SummaryCard
                            label="Gross Margin"
                            value="—"
                            mutedValue="Run analysis"
                        />
                        <SummaryCard
                            label="Risk Level"
                            value={<UiBadge variant="gray">Not analyzed</UiBadge>}
                        />
                    </div>
                </>
            ) : (
                <PlaceholderTab activeTab={activeTab} />
            )}
        </div>
    );
}

function SummaryCard({
                         label,
                         value,
                         mutedValue,
                     }: {
    label: string;
    value: React.ReactNode;
    mutedValue?: string;
}) {
    return (
        <div className="flex min-h-[54px] items-center justify-between rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-sm font-semibold text-slate-800">
                {value}
                {mutedValue && (
                    <span className="font-medium text-slate-300">{mutedValue}</span>
                )}
            </span>
        </div>
    );
}

function PlaceholderTab({ activeTab }: { activeTab: PackageWorkspaceTab }) {
    const titleByTab: Record<PackageWorkspaceTab, string> = {
        overview: 'Overview',
        itinerary: 'Itinerary',
        costs: 'Cost Module',
        content: 'Content',
        analysis: 'Analysis',
        recommendations: 'Recommendations',
        proposal: 'Proposal Preview',
    };

    return (
        <div className="max-w-[980px] rounded-lg border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
                {titleByTab[activeTab]}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
                This workspace tab will be connected in the next implementation step.
            </p>
        </div>
    );
}
