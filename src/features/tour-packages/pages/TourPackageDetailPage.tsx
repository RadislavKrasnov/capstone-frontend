import { useState } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    ChevronRight,
    Clock3,
    Download,
    Edit2,
    MapPin,
    Send,
    Users,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import {
    useGetLatestPackageAnalysisQuery,
    useGetTourPackageQuery,
} from '../api/tourPackagesApi';
import { PackageMarginText } from '../components/PackageMarginText';
import { PackageRiskBadge } from '../components/PackageRiskBadge';
import { PackageStatusBadge } from '../components/PackageStatusBadge';
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

function formatDate(value?: string) {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
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

    const {
        data: latestAnalysis,
        isFetching: isAnalysisFetching,
    } = useGetLatestPackageAnalysisQuery(uuid ?? '', {
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

    const grossMarginPercent = latestAnalysis?.financial.grossMarginPercent ?? null;
    const financialRiskLevel = latestAnalysis?.financial.financialRiskLevel ?? null;
    const destination = getDestination(tourPackage);

    return (
        <div className="space-y-6">
            <div className="-mx-6 -mt-6 border-b border-slate-200 bg-white px-6 pt-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400">
                            <button
                                type="button"
                                onClick={() => navigate('/packages')}
                                className="transition hover:text-blue-600"
                            >
                                Tour Packages
                            </button>
                            <ChevronRight size={13} />
                            <span className="text-slate-700">
                                {tourPackage.title}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <h1 className="text-[18px] font-semibold leading-tight text-slate-900">
                                {tourPackage.title}
                            </h1>

                            <PackageStatusBadge status={tourPackage.status} />

                            {isAnalysisFetching ? (
                                <UiBadge variant="gray">Loading</UiBadge>
                            ) : financialRiskLevel ? (
                                <PackageRiskBadge risk={financialRiskLevel} />
                            ) : (
                                <UiBadge variant="gray">Not analyzed</UiBadge>
                            )}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-[12px] text-slate-400">
                            <span className="inline-flex items-center gap-1">
                                <MapPin size={13} />
                                {destination}
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <Clock3 size={13} />
                                {tourPackage.durationDays} days
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <Users size={13} />
                                Max {tourPackage.expectedGroupSize} pax
                            </span>

                            <span className="inline-flex items-center gap-1">
                                <CalendarDays size={13} />
                                Modified {formatDate(tourPackage.updatedAt)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-8">
                        <UiButton
                            variant="secondary"
                            size="sm"
                            icon={<Edit2 size={13} />}
                        >
                            Edit
                        </UiButton>

                        <UiButton
                            size="sm"
                            icon={<Send size={13} />}
                        >
                            Publish
                        </UiButton>
                    </div>
                </div>

                <div className="mt-5">
                    <PackageWorkspaceTabs
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </div>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <TourPackageOverviewForm tourPackage={tourPackage} />

                    <div className="grid max-w-[980px] grid-cols-4 gap-3">
                        <SummaryCard label="Package ID" value={getPackageCode(tourPackage)} />

                        <SummaryCard label="Destination" value={destination} />

                        <SummaryCard
                            label="Gross Margin"
                            value={
                                isAnalysisFetching ? (
                                    <span className="text-xs font-medium text-slate-300">
                                        Loading...
                                    </span>
                                ) : grossMarginPercent !== null ? (
                                    <PackageMarginText marginPercent={grossMarginPercent} />
                                ) : (
                                    <span className="text-xs font-medium text-slate-300">
                                        Not analyzed
                                    </span>
                                )
                            }
                        />

                        <SummaryCard
                            label="Risk Level"
                            value={
                                isAnalysisFetching ? (
                                    <UiBadge variant="gray">Loading</UiBadge>
                                ) : financialRiskLevel ? (
                                    <PackageRiskBadge risk={financialRiskLevel} />
                                ) : (
                                    <UiBadge variant="gray">Not analyzed</UiBadge>
                                )
                            }
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
                     }: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[54px] items-center justify-between rounded-lg border border-slate-200 bg-white px-4 shadow-sm">
            <span className="text-xs text-slate-400">{label}</span>
            <span className="text-sm font-semibold text-slate-800">{value}</span>
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