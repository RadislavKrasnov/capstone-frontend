import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    Download,
    TrendingUp,
    Zap,
} from 'lucide-react';

import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import {
    useRunPackageAnalysisMutation,
} from '../../tour-packages/api/tourPackagesApi';
import type {
    AnalysisDashboardRecommendation,
    AnalysisDashboardResponse,
    RecommendationCategory,
    RecommendationSeverity,
    TourPackage,
} from '../../tour-packages/types/tourPackage.types';

type PackageRecommendationsTabProps = {
    tourPackage: TourPackage;
    latestAnalysis?: AnalysisDashboardResponse;
    isAnalysisFetching: boolean;
    onAnalysisUpdated: () => void;
};

type RecommendationStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'DISMISSED';

type StatusFilter = 'ALL' | RecommendationStatus;

type CategoryFilter =
    | 'ALL'
    | 'MARGIN'
    | 'RISK'
    | 'PRICING'
    | 'OPERATIONS';

const statusFilters: Array<{
    key: StatusFilter;
    label: string;
}> = [
    { key: 'ALL', label: 'All' },
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'DONE', label: 'Done' },
    { key: 'DISMISSED', label: 'Dismissed' },
];

const categoryFilters: Array<{
    key: CategoryFilter;
    label: string;
}> = [
    { key: 'ALL', label: 'All' },
    { key: 'MARGIN', label: 'Margin' },
    { key: 'RISK', label: 'Risk' },
    { key: 'PRICING', label: 'Pricing' },
    { key: 'OPERATIONS', label: 'Operations' },
];

const severityImpact: Record<RecommendationSeverity, number> = {
    CRITICAL: 100,
    HIGH: 75,
    MEDIUM: 45,
    LOW: 20,
};

const severityEffort: Record<RecommendationSeverity, 'Low' | 'Medium' | 'High'> = {
    CRITICAL: 'Low',
    HIGH: 'Medium',
    MEDIUM: 'Medium',
    LOW: 'Low',
};

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

function getRecommendationId(recommendation: AnalysisDashboardRecommendation) {
    return recommendation.uuid ?? recommendation.ruleCode;
}

function getCategoryLabel(category: RecommendationCategory) {
    const labels: Record<RecommendationCategory, string> = {
        FINANCIAL: 'Margin',
        ITINERARY: 'Operations',
        OPERATIONAL: 'Operations',
        COST_STRUCTURE: 'Pricing',
    };

    return labels[category];
}

function getCategoryFilter(category: RecommendationCategory): CategoryFilter {
    if (category === 'FINANCIAL') {
        return 'MARGIN';
    }

    if (category === 'COST_STRUCTURE') {
        return 'PRICING';
    }

    return 'OPERATIONS';
}

function getSeverityBadgeVariant(
    severity: RecommendationSeverity,
): 'red' | 'amber' | 'blue' | 'gray' {
    if (severity === 'CRITICAL') {
        return 'red';
    }

    if (severity === 'HIGH') {
        return 'amber';
    }

    if (severity === 'MEDIUM') {
        return 'blue';
    }

    return 'gray';
}

function getStatusBadgeVariant(
    status: RecommendationStatus,
): 'blue' | 'green' | 'gray' | 'amber' {
    if (status === 'IN_PROGRESS') {
        return 'blue';
    }

    if (status === 'DONE') {
        return 'green';
    }

    if (status === 'DISMISSED') {
        return 'gray';
    }

    return 'gray';
}

function getStatusLabel(status: RecommendationStatus) {
    const labels: Record<RecommendationStatus, string> = {
        OPEN: 'Open',
        IN_PROGRESS: 'In Progress',
        DONE: 'Done',
        DISMISSED: 'Dismissed',
    };

    return labels[status];
}

function getImpactClass(severity: RecommendationSeverity) {
    if (severity === 'CRITICAL') {
        return 'bg-red-500';
    }

    if (severity === 'HIGH') {
        return 'bg-amber-500';
    }

    if (severity === 'MEDIUM') {
        return 'bg-blue-500';
    }

    return 'bg-slate-400';
}

function getCardBorderClass(severity: RecommendationSeverity) {
    if (severity === 'CRITICAL') {
        return 'border-red-300';
    }

    if (severity === 'HIGH') {
        return 'border-amber-300';
    }

    if (severity === 'MEDIUM') {
        return 'border-blue-300';
    }

    return 'border-slate-200';
}

function getLeftBorderClass(severity: RecommendationSeverity) {
    if (severity === 'CRITICAL') {
        return 'border-l-red-500';
    }

    if (severity === 'HIGH') {
        return 'border-l-amber-500';
    }

    if (severity === 'MEDIUM') {
        return 'border-l-blue-500';
    }

    return 'border-l-slate-300';
}

function getPotentialImpactText(recommendation: AnalysisDashboardRecommendation) {
    if (recommendation.affectedMetric) {
        return recommendation.affectedMetric;
    }

    if (recommendation.category === 'FINANCIAL') {
        return 'Margin improvement';
    }

    if (recommendation.category === 'COST_STRUCTURE') {
        return 'Cost optimization';
    }

    if (recommendation.category === 'ITINERARY') {
        return 'Risk score improvement';
    }

    return 'Operational improvement';
}

function getMatrixImpact(severity: RecommendationSeverity): 'HIGH' | 'LOW' {
    return severity === 'CRITICAL' || severity === 'HIGH' ? 'HIGH' : 'LOW';
}

function getMatrixEffort(severity: RecommendationSeverity): 'LOW' | 'MEDIUM' | 'HIGH' {
    const effort = severityEffort[severity];

    if (effort === 'Low') {
        return 'LOW';
    }

    if (effort === 'High') {
        return 'HIGH';
    }

    return 'MEDIUM';
}

export function PackageRecommendationsTab({
                                              latestAnalysis,
                                              isAnalysisFetching,
                                              onAnalysisUpdated,
                                              tourPackage,
                                          }: PackageRecommendationsTabProps) {
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
    const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
    const [statusById, setStatusById] = useState<Record<string, RecommendationStatus>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [runPackageAnalysis, { isLoading: isRunning }] =
        useRunPackageAnalysisMutation();

    const recommendations = useMemo(
        () => latestAnalysis?.recommendations.topRecommendations ?? [],
        [latestAnalysis?.recommendations.topRecommendations],
    );

    const recommendationStatus = (recommendation: AnalysisDashboardRecommendation) =>
        statusById[getRecommendationId(recommendation)] ?? 'OPEN';

    const visibleRecommendations = useMemo(
        () =>
            recommendations.filter((recommendation) => {
                const status = recommendationStatus(recommendation);
                const category = getCategoryFilter(recommendation.category);

                const matchesStatus =
                    statusFilter === 'ALL' || status === statusFilter;

                const matchesCategory =
                    categoryFilter === 'ALL' ||
                    category === categoryFilter ||
                    (categoryFilter === 'RISK' &&
                        ['ITINERARY', 'OPERATIONAL'].includes(
                            recommendation.category,
                        ));

                return matchesStatus && matchesCategory;
            }),
        [recommendations, statusById, statusFilter, categoryFilter],
    );

    const counts = useMemo(() => {
        return recommendations.reduce(
            (acc, recommendation) => {
                const status = recommendationStatus(recommendation);

                acc[status] += 1;

                return acc;
            },
            {
                OPEN: 0,
                IN_PROGRESS: 0,
                DONE: 0,
                DISMISSED: 0,
            } satisfies Record<RecommendationStatus, number>,
        );
    }, [recommendations, statusById]);

    const potentialImpactScore = recommendations.reduce(
        (sum, recommendation) => sum + severityImpact[recommendation.severity],
        0,
    );

    const matrix = useMemo(() => {
        const result = {
            HIGH_LOW: [] as AnalysisDashboardRecommendation[],
            HIGH_MEDIUM: [] as AnalysisDashboardRecommendation[],
            HIGH_HIGH: [] as AnalysisDashboardRecommendation[],
            LOW_LOW: [] as AnalysisDashboardRecommendation[],
            LOW_MEDIUM: [] as AnalysisDashboardRecommendation[],
            LOW_HIGH: [] as AnalysisDashboardRecommendation[],
        };

        recommendations.forEach((recommendation) => {
            const impact = getMatrixImpact(recommendation.severity);
            const effort = getMatrixEffort(recommendation.severity);

            result[`${impact}_${effort}` as keyof typeof result].push(recommendation);
        });

        return result;
    }, [recommendations]);

    const updateStatus = (
        recommendation: AnalysisDashboardRecommendation,
        status: RecommendationStatus,
    ) => {
        setStatusById((previous) => ({
            ...previous,
            [getRecommendationId(recommendation)]: status,
        }));
    };

    const toggleExpanded = (recommendation: AnalysisDashboardRecommendation) => {
        const id = getRecommendationId(recommendation);

        setExpandedIds((previous) => ({
            ...previous,
            [id]: !previous[id],
        }));
    };

    const handleRunAnalysis = async () => {
        setServerError(null);
        setSuccessMessage(null);

        try {
            await runPackageAnalysis(tourPackage.uuid).unwrap();
            setSuccessMessage('Analysis re-run completed successfully.');
            setStatusById({});
            setExpandedIds({});
            onAnalysisUpdated();
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    if (isAnalysisFetching && !latestAnalysis) {
        return (
            <div className="max-w-[1120px] rounded-lg border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-400 shadow-sm">
                Loading recommendations...
            </div>
        );
    }

    if (!latestAnalysis) {
        return (
            <div className="max-w-[980px] space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-[16px] font-semibold text-slate-900">
                            Action Recommendations
                        </h2>
                        <p className="mt-1 text-[13px] text-slate-400">
                            Run analysis to generate explainable action recommendations.
                        </p>
                    </div>

                    <UiButton
                        icon={<Zap size={15} />}
                        onClick={handleRunAnalysis}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run Analysis'}
                    </UiButton>
                </div>

                {serverError && (
                    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {serverError}
                    </div>
                )}

                <div className="rounded-lg border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Zap size={22} />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                        No recommendations yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                        Run package analysis to create financial, itinerary, operational and cost-structure recommendations.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] space-y-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-slate-900">
                        Action Recommendations
                    </h2>
                    <p className="mt-1 text-[13px] text-slate-400">
                        Generated {formatDate(latestAnalysis.analysisRun.createdAt)} · Algorithm{' '}
                        {latestAnalysis.analysisRun.algorithmVersion} ·{' '}
                        {recommendations.length} items
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <UiButton
                        variant="secondary"
                        icon={<Download size={13} />}
                    >
                        Export
                    </UiButton>

                    <UiButton
                        icon={<Zap size={15} />}
                        onClick={handleRunAnalysis}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Re-run Analysis'}
                    </UiButton>
                </div>
            </div>

            {successMessage && (
                <div className="flex items-start gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {serverError && (
                <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                    <span>{serverError}</span>
                </div>
            )}

            <div className="grid grid-cols-4 gap-4">
                <SummaryCard
                    label="Open"
                    value={String(counts.OPEN)}
                    icon={<AlertTriangle size={16} />}
                />
                <SummaryCard
                    label="In Progress"
                    value={String(counts.IN_PROGRESS)}
                    icon={<Clock3 size={16} />}
                    tint="blue"
                />
                <SummaryCard
                    label="Completed"
                    value={String(counts.DONE)}
                    icon={<CheckCircle2 size={16} />}
                    tint="green"
                />
                <SummaryCard
                    label="Potential Impact Score"
                    value={String(potentialImpactScore)}
                    icon={<TrendingUp size={16} />}
                    tint="violet"
                />
            </div>

            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="text-[13px] font-semibold uppercase tracking-wide text-slate-500">
                        Impact vs. Effort Matrix
                    </h3>
                </div>

                <div className="grid grid-cols-[180px_repeat(3,1fr)] border-b border-slate-100 text-sm">
                    <div className="border-r border-slate-100 bg-slate-50 px-4 py-3" />
                    <MatrixHeader label="Low Effort" />
                    <MatrixHeader label="Medium Effort" />
                    <MatrixHeader label="High Effort" />

                    <MatrixRowLabel label="High Impact" />
                    <MatrixCell items={matrix.HIGH_LOW} />
                    <MatrixCell items={matrix.HIGH_MEDIUM} />
                    <MatrixCell items={matrix.HIGH_HIGH} />

                    <MatrixRowLabel label="Low Impact" />
                    <MatrixCell items={matrix.LOW_LOW} />
                    <MatrixCell items={matrix.LOW_MEDIUM} />
                    <MatrixCell items={matrix.LOW_HIGH} />
                </div>

                <p className="px-5 py-3 text-xs text-slate-400">
                    Recommendations are placed using backend severity and frontend effort estimation.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {statusFilters.map((filter) => (
                        <FilterPill
                            key={filter.key}
                            active={statusFilter === filter.key}
                            onClick={() => setStatusFilter(filter.key)}
                        >
                            {filter.label}
                        </FilterPill>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {categoryFilters.map((filter) => (
                        <FilterPill
                            key={filter.key}
                            active={categoryFilter === filter.key}
                            onClick={() => setCategoryFilter(filter.key)}
                        >
                            {filter.label}
                        </FilterPill>
                    ))}
                </div>
            </div>

            {visibleRecommendations.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                    <p className="text-sm font-medium text-slate-800">
                        No recommendations match the selected filters
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Try changing status or category filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleRecommendations.map((recommendation) => {
                        const status = recommendationStatus(recommendation);
                        const id = getRecommendationId(recommendation);
                        const isExpanded = expandedIds[id];
                        const impact = severityImpact[recommendation.severity];
                        const effort = severityEffort[recommendation.severity];

                        return (
                            <div
                                key={id}
                                className={[
                                    'rounded-lg border border-l-4 bg-white px-5 py-4 shadow-sm',
                                    getCardBorderClass(recommendation.severity),
                                    getLeftBorderClass(recommendation.severity),
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-5">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <UiBadge
                                                variant={getSeverityBadgeVariant(
                                                    recommendation.severity,
                                                )}
                                            >
                                                {recommendation.severity}
                                            </UiBadge>

                                            <UiBadge variant="gray">
                                                {getCategoryLabel(recommendation.category)}
                                            </UiBadge>

                                            <UiBadge variant={getStatusBadgeVariant(status)}>
                                                {getStatusLabel(status)}
                                            </UiBadge>
                                        </div>

                                        <h3 className="mt-3 text-[15px] font-semibold text-slate-900">
                                            {recommendation.title}
                                        </h3>

                                        <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
                                            {recommendation.explanation}
                                        </p>

                                        <div className="mt-4 flex items-center gap-3">
                                            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                Impact
                                            </span>

                                            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                                                <div
                                                    className={[
                                                        'h-1.5 rounded-full',
                                                        getImpactClass(recommendation.severity),
                                                    ].join(' ')}
                                                    style={{ width: `${impact}%` }}
                                                />
                                            </div>

                                            <span className="min-w-[150px] text-right text-xs font-semibold text-slate-700">
                                                {getPotentialImpactText(recommendation)}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                                            <span>
                                                Effort:{' '}
                                                <span
                                                    className={[
                                                        'font-semibold',
                                                        effort === 'High'
                                                            ? 'text-red-500'
                                                            : effort === 'Medium'
                                                                ? 'text-amber-500'
                                                                : 'text-green-600',
                                                    ].join(' ')}
                                                >
                                                    {effort}
                                                </span>
                                            </span>

                                            {recommendation.affectedMetric && (
                                                <span>
                                                    Metric:{' '}
                                                    <span className="font-medium text-slate-600">
                                                        {recommendation.affectedMetric}
                                                    </span>
                                                </span>
                                            )}

                                            {recommendation.affectedDayId && (
                                                <span>
                                                    Day ID:{' '}
                                                    <span className="font-medium text-slate-600">
                                                        {recommendation.affectedDayId}
                                                    </span>
                                                </span>
                                            )}
                                        </div>

                                        {isExpanded && (
                                            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                    Suggested Action
                                                </p>
                                                <p className="mt-2 text-sm leading-relaxed text-blue-800">
                                                    {recommendation.suggestedAction}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        {status === 'OPEN' && (
                                            <UiButton
                                                size="sm"
                                                onClick={() =>
                                                    updateStatus(
                                                        recommendation,
                                                        'IN_PROGRESS',
                                                    )
                                                }
                                            >
                                                Start
                                            </UiButton>
                                        )}

                                        {status === 'IN_PROGRESS' && (
                                            <UiButton
                                                size="sm"
                                                icon={<CheckCircle2 size={13} />}
                                                onClick={() =>
                                                    updateStatus(recommendation, 'DONE')
                                                }
                                            >
                                                Mark Done
                                            </UiButton>
                                        )}

                                        {status === 'DONE' && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                                <CheckCircle2 size={13} />
                                                Completed
                                            </span>
                                        )}

                                        {status !== 'DONE' && status !== 'DISMISSED' && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateStatus(
                                                        recommendation,
                                                        'DISMISSED',
                                                    )
                                                }
                                                className="text-xs font-medium text-slate-500 transition hover:text-red-500"
                                            >
                                                Dismiss
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => toggleExpanded(recommendation)}
                                            className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
                                        >
                                            {isExpanded ? 'Hide steps ↑' : 'View steps ↓'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {counts.DONE > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={15} />
                    {counts.DONE} recommendation completed — package has improved since last analysis run.
                </div>
            )}
        </div>
    );
}

function SummaryCard({
                         label,
                         value,
                         icon,
                         tint = 'slate',
                     }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    tint?: 'slate' | 'blue' | 'green' | 'violet';
}) {
    const tintClass = {
        slate: 'bg-white text-slate-500',
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        violet: 'bg-violet-50 text-violet-600',
    }[tint];

    return (
        <div className={['rounded-lg border border-slate-200 px-5 py-4 shadow-sm', tintClass].join(' ')}>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide">
                    {label}
                </p>
                {icon}
            </div>
            <p className="mt-2 text-[22px] font-bold leading-tight">{value}</p>
        </div>
    );
}

function MatrixHeader({ label }: { label: string }) {
    return (
        <div className="border-r border-slate-100 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-500 last:border-r-0">
            {label}
        </div>
    );
}

function MatrixRowLabel({ label }: { label: string }) {
    return (
        <div className="border-r border-t border-slate-100 bg-slate-50 px-4 py-8 text-sm font-semibold text-slate-700">
            {label}
        </div>
    );
}

function MatrixCell({ items }: { items: AnalysisDashboardRecommendation[] }) {
    return (
        <div className="min-h-[70px] border-r border-t border-slate-100 bg-white px-4 py-3 last:border-r-0">
            <div className="space-y-2">
                {items.slice(0, 3).map((item) => (
                    <p
                        key={getRecommendationId(item)}
                        className="truncate text-xs font-medium text-slate-600"
                    >
                        {item.title}
                    </p>
                ))}
            </div>
        </div>
    );
}

function FilterPill({
                        active,
                        onClick,
                        children,
                    }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'rounded-full border px-4 py-1.5 text-xs font-semibold transition',
                active
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
            ].join(' ')}
        >
            {children}
        </button>
    );
}
