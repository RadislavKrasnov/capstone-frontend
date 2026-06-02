import { useMemo, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    Zap,
} from 'lucide-react';

import { UiBadge } from '../../../shared/components/UiBadge';
import { UiButton } from '../../../shared/components/UiButton';
import type {
    AnalysisDashboardResponse,
    FatigueLevel,
    FinancialRiskLevel,
    QualityLevel,
} from '../../tour-packages/types/tourPackage.types';
import { useRunPackageAnalysisMutation } from '../../tour-packages/api/tourPackagesApi';
import type { TourPackage } from '../../tour-packages/types/tourPackage.types';

type PackageAnalysisTabProps = {
    tourPackage: TourPackage;
    latestAnalysis?: AnalysisDashboardResponse;
    isAnalysisFetching: boolean;
    onAnalysisUpdated: () => void;
};

function formatMoney(value: number, currencyCode: string) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode || 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

function formatDateTime(value?: string) {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

function formatPercent(value: number) {
    return `${value.toFixed(0)}%`;
}

function getScoreClass(score: number) {
    if (score >= 70) {
        return 'text-green-600';
    }

    if (score >= 50) {
        return 'text-amber-600';
    }

    return 'text-red-600';
}

function getScoreBarClass(score: number) {
    if (score >= 70) {
        return 'bg-green-500';
    }

    if (score >= 50) {
        return 'bg-amber-500';
    }

    return 'bg-red-500';
}

function getQualityBadgeVariant(level: QualityLevel) {
    if (level === 'EXCELLENT' || level === 'GOOD') {
        return 'green';
    }

    if (level === 'RISKY') {
        return 'amber';
    }

    return 'red';
}

function getRiskBadgeVariant(risk: FinancialRiskLevel) {
    if (risk === 'LOW') {
        return 'green';
    }

    if (risk === 'MEDIUM') {
        return 'amber';
    }

    return 'red';
}

function getFatigueLabel(level: FatigueLevel) {
    if (level === 'LOW') {
        return 'Easy';
    }

    if (level === 'MODERATE') {
        return 'Moderate';
    }

    if (level === 'HIGH') {
        return 'Demanding';
    }

    return 'Critical';
}

function getFatigueBadgeVariant(level: FatigueLevel) {
    if (level === 'LOW') {
        return 'green';
    }

    if (level === 'MODERATE') {
        return 'amber';
    }

    return 'red';
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

export function PackageAnalysisTab({
                                       tourPackage,
                                       latestAnalysis,
                                       isAnalysisFetching,
                                       onAnalysisUpdated,
                                   }: PackageAnalysisTabProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [runPackageAnalysis, { isLoading: isRunning }] =
        useRunPackageAnalysisMutation();

    const criticalCount =
        latestAnalysis?.recommendations.countsBySeverity.critical ?? 0;
    const highCount = latestAnalysis?.recommendations.countsBySeverity.high ?? 0;

    const businessConclusion = useMemo(() => {
        const recommendations = latestAnalysis?.recommendations.topRecommendations ?? [];

        const criticalOrHigh = recommendations.find((recommendation) =>
            ['CRITICAL', 'HIGH'].includes(recommendation.severity),
        );

        return criticalOrHigh;
    }, [latestAnalysis]);

    const qualityRows = latestAnalysis
        ? [
            {
                metric: 'Profitability',
                category: 'Finance',
                weight: '30%',
                score: latestAnalysis.quality.profitabilityScore,
                description: `Gross margin is ${formatPercent(
                    latestAnalysis.financial.grossMarginPercent,
                )}. Financial risk is ${latestAnalysis.financial.financialRiskLevel}.`,
            },
            {
                metric: 'Itinerary Balance',
                category: 'Operations',
                weight: '25%',
                score: latestAnalysis.quality.itineraryBalanceScore,
                description: `${latestAnalysis.itinerary.criticalDaysCount} critical days and ${latestAnalysis.itinerary.overloadedDaysCount} overloaded days detected.`,
            },
            {
                metric: 'Operational Feasibility',
                category: 'Operations',
                weight: '25%',
                score: latestAnalysis.quality.operationalFeasibilityScore,
                description: 'Checks feasibility using itinerary load, timing, supplier and operational risk signals.',
            },
            {
                metric: 'Cost Structure',
                category: 'Finance',
                weight: '20%',
                score: latestAnalysis.quality.costStructureScore,
                description: 'Evaluates cost concentration, supplier dependency and cost distribution.',
            },
        ]
        : [];

    const handleRunAnalysis = async () => {
        setServerError(null);
        setSuccessMessage(null);

        try {
            await runPackageAnalysis(tourPackage.uuid).unwrap();
            setSuccessMessage('Analysis completed successfully.');
            onAnalysisUpdated();
        } catch (error) {
            setServerError(getErrorMessage(error));
        }
    };

    if (isAnalysisFetching && !latestAnalysis) {
        return (
            <div className="max-w-[1120px] rounded-lg border border-slate-200 bg-white px-5 py-16 text-center text-sm text-slate-400 shadow-sm">
                Loading analysis...
            </div>
        );
    }

    if (!latestAnalysis) {
        return (
            <div className="max-w-[980px] space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-[16px] font-semibold text-slate-900">
                            Analysis Dashboard
                        </h2>
                        <p className="mt-1 text-[13px] text-slate-400">
                            Run analysis to calculate quality score, profitability, itinerary balance and recommendations.
                        </p>
                    </div>

                    <UiButton
                        icon={<Zap size={15} />}
                        onClick={handleRunAnalysis}
                        disabled={isRunning}
                        className="h-10 px-5"
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
                        No analysis results yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                        Start the package analysis to generate financial metrics, itinerary fatigue results, quality score and explainable recommendations.
                    </p>
                    <UiButton
                        className="mt-5"
                        icon={<Zap size={15} />}
                        onClick={handleRunAnalysis}
                        disabled={isRunning}
                    >
                        {isRunning ? 'Running...' : 'Run Analysis'}
                    </UiButton>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1120px] space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-[16px] font-semibold text-slate-900">
                        Analysis Dashboard
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-500">
                        <span>
                            Last run:{' '}
                            <span className="font-medium text-slate-600">
                                {formatDateTime(latestAnalysis.analysisRun.createdAt)}
                            </span>
                        </span>
                        <span>
                            Algorithm:{' '}
                            <span className="font-medium text-slate-600">
                                {latestAnalysis.analysisRun.algorithmVersion}
                            </span>
                        </span>
                        <UiBadge variant="green">
                            {latestAnalysis.analysisRun.status}
                        </UiBadge>
                    </div>
                </div>

                <UiButton
                    icon={<Zap size={15} />}
                    onClick={handleRunAnalysis}
                    disabled={isRunning}
                    className="h-10 px-5"
                >
                    {isRunning ? 'Running...' : 'Run Analysis'}
                </UiButton>
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

            <section className="space-y-3">
                <SectionTitle>Executive Summary</SectionTitle>

                <div className="grid grid-cols-6 gap-3">
                    <ExecutiveCard
                        label="Quality Score"
                        value={String(latestAnalysis.quality.overallScore)}
                        hint="out of 100"
                        valueClassName={getScoreClass(latestAnalysis.quality.overallScore)}
                    />
                    <ExecutiveCard
                        label="Quality Level"
                        value={latestAnalysis.quality.qualityLevel}
                        hint="overall status"
                        badgeVariant={getQualityBadgeVariant(latestAnalysis.quality.qualityLevel)}
                    />
                    <ExecutiveCard
                        label="Financial Risk"
                        value={latestAnalysis.financial.financialRiskLevel}
                        hint="risk level"
                        badgeVariant={getRiskBadgeVariant(latestAnalysis.financial.financialRiskLevel)}
                    />
                    <ExecutiveCard
                        label="Gross Margin"
                        value={formatPercent(latestAnalysis.financial.grossMarginPercent)}
                        hint={
                            latestAnalysis.financial.grossMarginPercent >= 25
                                ? 'above 25% target'
                                : 'below 25% target'
                        }
                        valueClassName={
                            latestAnalysis.financial.grossMarginPercent >= 25
                                ? 'text-green-600'
                                : 'text-red-600'
                        }
                    />
                    <ExecutiveCard
                        label="Recommendations"
                        value={String(
                            latestAnalysis.recommendations.topRecommendations.length,
                        )}
                        hint={
                            highCount || criticalCount
                                ? `${criticalCount} critical · ${highCount} high`
                                : 'No high priority'
                        }
                        valueClassName="text-blue-600"
                    />
                    <ExecutiveCard
                        label="Warnings"
                        value={String(criticalCount + highCount)}
                        hint={`${criticalCount} critical · ${highCount} high`}
                        valueClassName={
                            criticalCount + highCount > 0
                                ? 'text-red-600'
                                : 'text-green-600'
                        }
                        danger={criticalCount + highCount > 0}
                    />
                </div>

                {businessConclusion && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">Business conclusion:</span>{' '}
                            {businessConclusion.explanation}
                        </p>
                    </div>
                )}
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div>
                        <SectionTitle>Quality Score Breakdown</SectionTitle>
                        <p className="mt-1 text-[12px] text-slate-400">
                            Weighted composite of 4 metrics · weights sum to 100%
                        </p>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-right">
                        <p className="text-[22px] font-bold leading-none text-green-700">
                            {latestAnalysis.quality.overallScore}
                            <span className="text-sm text-slate-400">/100</span>
                        </p>
                        <div className="mt-2 flex items-center justify-end gap-2">
                            <span className="text-xs text-slate-400">Overall Score</span>
                            <UiBadge variant={getQualityBadgeVariant(latestAnalysis.quality.qualityLevel)}>
                                {latestAnalysis.quality.qualityLevel}
                            </UiBadge>
                        </div>
                    </div>
                </div>

                <table className="w-full">
                    <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                        {['Metric', 'Category', 'Weight', 'Score Bar', 'Score'].map(
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
                    {qualityRows.map((row) => (
                        <tr key={row.metric}>
                            <td className="px-5 py-4">
                                <p className="text-sm font-semibold text-slate-900">
                                    {row.metric}
                                </p>
                                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-400">
                                    {row.description}
                                </p>
                            </td>

                            <td className="px-5 py-4">
                                <UiBadge variant={row.category === 'Finance' ? 'blue' : 'gray'}>
                                    {row.category}
                                </UiBadge>
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-500">
                                {row.weight}
                            </td>

                            <td className="px-5 py-4">
                                <div className="h-2 w-[170px] rounded-full bg-slate-100">
                                    <div
                                        className={[
                                            'h-2 rounded-full',
                                            getScoreBarClass(row.score),
                                        ].join(' ')}
                                        style={{
                                            width: `${Math.max(0, Math.min(row.score, 100))}%`,
                                        }}
                                    />
                                </div>
                            </td>

                            <td className="px-5 py-4">
                                <span
                                    className={[
                                        'inline-flex min-w-[46px] justify-center rounded-lg border px-2.5 py-1 text-sm font-bold',
                                        row.score >= 70
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : row.score >= 50
                                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                : 'border-red-200 bg-red-50 text-red-700',
                                    ].join(' ')}
                                >
                                    {row.score}
                                </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="border-t border-slate-100 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
                        <LegendDot className="bg-green-500" label="70–100 · Good" />
                        <LegendDot className="bg-amber-500" label="50–69 · Needs work" />
                        <LegendDot className="bg-red-500" label="0–49 · Poor" />
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            Applied Caps
                        </p>

                        {latestAnalysis.quality.appliedCaps.length === 0 ? (
                            <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                <CheckCircle2 size={14} className="text-green-500" />
                                No score caps were applied.
                            </p>
                        ) : (
                            <div className="mt-3 space-y-2">
                                {latestAnalysis.quality.appliedCaps.map((cap) => (
                                    <div
                                        key={cap.code}
                                        className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700"
                                    >
                                        <span className="font-semibold">{cap.code}:</span>{' '}
                                        {cap.description} · capped at {cap.cappedAt}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <SectionTitle>Financial Analysis</SectionTitle>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Financial Summary
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            {tourPackage.expectedGroupSize} travellers ·{' '}
                            {formatMoney(tourPackage.sellingPricePerPerson, tourPackage.currencyCode)} / person
                        </p>
                    </div>

                    <div className="grid grid-cols-6 divide-x divide-slate-100">
                        <FinancialMetric
                            label="Total Revenue"
                            value={formatMoney(latestAnalysis.financial.totalRevenue, tourPackage.currencyCode)}
                        />
                        <FinancialMetric
                            label="Total Cost"
                            value={formatMoney(latestAnalysis.financial.totalCost, tourPackage.currencyCode)}
                        />
                        <FinancialMetric
                            label="Gross Profit"
                            value={formatMoney(latestAnalysis.financial.grossProfit, tourPackage.currencyCode)}
                            positive={latestAnalysis.financial.grossProfit >= 0}
                        />
                        <FinancialMetric
                            label="Gross Margin"
                            value={formatPercent(latestAnalysis.financial.grossMarginPercent)}
                            positive={latestAnalysis.financial.grossMarginPercent >= 25}
                        />
                        <FinancialMetric
                            label="Cost / Person"
                            value={formatMoney(latestAnalysis.financial.costPerPerson, tourPackage.currencyCode)}
                        />
                        <FinancialMetric
                            label="Profit / Person"
                            value={formatMoney(latestAnalysis.financial.profitPerPerson, tourPackage.currencyCode)}
                            positive={latestAnalysis.financial.profitPerPerson >= 0}
                        />
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-slate-400">Margin</span>
                            <div className="h-2 flex-1 rounded-full bg-slate-100">
                                <div
                                    className={[
                                        'h-2 rounded-full',
                                        latestAnalysis.financial.grossMarginPercent >= 25
                                            ? 'bg-green-500'
                                            : 'bg-red-500',
                                    ].join(' ')}
                                    style={{
                                        width: `${Math.max(
                                            0,
                                            Math.min(latestAnalysis.financial.grossMarginPercent, 100),
                                        )}%`,
                                    }}
                                />
                            </div>
                            <span className="text-xs text-slate-400">Target 25%</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">
                                Break-even Analysis
                            </h3>
                            <p className="mt-1 text-xs text-slate-400">
                                At what group size does this package become profitable?
                            </p>
                        </div>

                        <UiBadge variant={getRiskBadgeVariant(latestAnalysis.financial.financialRiskLevel)}>
                            {latestAnalysis.financial.financialRiskLevel} RISK
                        </UiBadge>
                    </div>

                    <MetricRows
                        rows={[
                            {
                                label: 'Contribution / Person',
                                value: formatMoney(latestAnalysis.financial.contributionPerPerson, tourPackage.currencyCode),
                                hint: 'price minus variable cost per head',
                            },
                            {
                                label: 'Break-even Group Size',
                                value: String(latestAnalysis.financial.breakEvenGroupSizeRounded),
                            },
                            {
                                label: 'Break-even Safety Travellers',
                                value: String(latestAnalysis.financial.breakEvenSafetyTravelers),
                                hint: 'travellers above break-even',
                            },
                            {
                                label: 'Break-even Utilization',
                                value: formatPercent(latestAnalysis.financial.breakEvenUtilizationPercent),
                            },
                            {
                                label: 'Financial Risk',
                                value: latestAnalysis.financial.financialRiskLevel,
                            },
                        ]}
                    />

                    <div className="border-t border-slate-100 px-5 py-4">
                        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-xs text-blue-700">
                            <Info size={14} className="mt-0.5 shrink-0" />
                            <span>
                                Break-even group size is calculated from fixed costs, variable costs and contribution per traveller.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Target Margin Support
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            What would be needed to achieve a 25% gross margin?
                        </p>
                    </div>

                    <MetricRows
                        rows={[
                            {
                                label: 'Required Price for Target Margin',
                                value: formatMoney(latestAnalysis.financial.requiredPriceForTargetMargin, tourPackage.currencyCode),
                                hint: 'to achieve 25% gross margin',
                            },
                            {
                                label: 'Current Price Gap / Person',
                                value: formatMoney(latestAnalysis.financial.priceGapPerPerson, tourPackage.currencyCode),
                                hint:
                                    latestAnalysis.financial.priceGapPerPerson >= 0
                                        ? 'current price exceeds target requirement'
                                        : 'current price is below target requirement',
                                positive: latestAnalysis.financial.priceGapPerPerson >= 0,
                            },
                            {
                                label: 'Required Cost Reduction',
                                value: formatMoney(latestAnalysis.financial.requiredCostReductionForTargetMargin, tourPackage.currencyCode),
                                hint:
                                    latestAnalysis.financial.requiredCostReductionForTargetMargin <= 0
                                        ? 'no cost reduction needed'
                                        : 'needed to reach target margin',
                            },
                            {
                                label: 'Markup on Cost',
                                value: `${latestAnalysis.financial.markupPercent.toFixed(2)}%`,
                                hint: '(price − cost) / cost',
                            },
                        ]}
                    />
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Cost Totals
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                            Breakdown by cost structure type
                        </p>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                        <CostTotalCard
                            label="Fixed Cost Total"
                            value={formatMoney(latestAnalysis.financial.fixedCostTotal, tourPackage.currencyCode)}
                            hint="not affected by group size"
                        />
                        <CostTotalCard
                            label="Variable Cost Total"
                            value={formatMoney(latestAnalysis.financial.variableCostTotal, tourPackage.currencyCode)}
                            hint={`${tourPackage.expectedGroupSize} × ${formatMoney(
                                latestAnalysis.financial.variableCostPerPerson,
                                tourPackage.currencyCode,
                            )}`}
                        />
                        <CostTotalCard
                            label="Variable Cost / Person"
                            value={formatMoney(latestAnalysis.financial.variableCostPerPerson, tourPackage.currencyCode)}
                            hint="per traveller"
                        />
                    </div>

                    <div className="border-t border-slate-100 px-5 py-4">
                        <p className="flex items-center gap-2 text-xs text-slate-500">
                            <CheckCircle2 size={14} className="text-green-500" />
                            Cost structure is based on the latest backend financial analysis.
                        </p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <SectionTitle>Itinerary Analysis</SectionTitle>

                <div className="grid grid-cols-6 gap-3">
                    <ItineraryMetricCard
                        label="Itinerary Balance"
                        value={`${latestAnalysis.itinerary.itineraryBalanceScore} / 100`}
                    />
                    <ItineraryMetricCard
                        label="Average Fatigue"
                        value={`${latestAnalysis.itinerary.averageFatigueScore} / 100`}
                    />
                    <ItineraryMetricCard
                        label="Average Balance"
                        value={`${latestAnalysis.itinerary.averageBalanceScore} / 100`}
                    />
                    <ItineraryMetricCard
                        label="Overloaded Days"
                        value={String(latestAnalysis.itinerary.overloadedDaysCount)}
                    />
                    <ItineraryMetricCard
                        label="Critical Days"
                        value={String(latestAnalysis.itinerary.criticalDaysCount)}
                        danger={latestAnalysis.itinerary.criticalDaysCount > 0}
                    />
                    <ItineraryMetricCard
                        label="High Fatigue Sequences"
                        value={String(latestAnalysis.itinerary.consecutiveHighFatigueSequences)}
                        warning={latestAnalysis.itinerary.consecutiveHighFatigueSequences > 0}
                    />
                </div>

                {latestAnalysis.itinerary.validationWarnings.length > 0 && (
                    <div className="overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-5 py-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                                <AlertTriangle size={15} />
                                Validation Warnings
                            </div>
                            <span className="text-sm text-amber-600">
                                {latestAnalysis.itinerary.validationWarnings.length} issues — analysis may be incomplete
                            </span>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {latestAnalysis.itinerary.validationWarnings.map((warning) => (
                                <div
                                    key={warning}
                                    className="flex items-start gap-2 px-5 py-3 text-sm text-slate-700"
                                >
                                    <AlertTriangle
                                        size={14}
                                        className="mt-0.5 shrink-0 text-amber-500"
                                    />
                                    {warning}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {latestAnalysis.itinerary.dailyResults.map((day) => (
                        <div
                            key={day.dayId}
                            className={[
                                'rounded-lg border bg-white px-5 py-4 shadow-sm',
                                day.fatigueLevel === 'CRITICAL'
                                    ? 'border-red-100 bg-red-50/40'
                                    : day.fatigueLevel === 'HIGH'
                                        ? 'border-amber-100 bg-amber-50/30'
                                        : 'border-slate-200',
                            ].join(' ')}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-sm font-bold text-white">
                                        {day.dayNumber}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Day {day.dayNumber} — {day.title || 'Untitled day'}
                                            </h3>
                                            {day.activityCount === 0 && (
                                                <UiBadge variant="gray">Underfilled</UiBadge>
                                            )}
                                        </div>

                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            <UiBadge variant={getFatigueBadgeVariant(day.fatigueLevel)}>
                                                {day.fatigueLevel}
                                            </UiBadge>

                                            <div className="h-1.5 w-[190px] rounded-full bg-slate-100">
                                                <div
                                                    className={[
                                                        'h-1.5 rounded-full',
                                                        getScoreBarClass(100 - day.fatigueScore),
                                                    ].join(' ')}
                                                    style={{
                                                        width: `${Math.max(
                                                            0,
                                                            Math.min(day.fatigueScore, 100),
                                                        )}%`,
                                                    }}
                                                />
                                            </div>

                                            <span
                                                className={[
                                                    'text-xs font-semibold',
                                                    getScoreClass(100 - day.fatigueScore),
                                                ].join(' ')}
                                            >
                                                {day.fatigueScore}
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                Balance{' '}
                                                <span className={getScoreClass(day.balanceScore)}>
                                                    {day.balanceScore}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <UiBadge variant={getFatigueBadgeVariant(day.fatigueLevel)}>
                                    {getFatigueLabel(day.fatigueLevel)}
                                </UiBadge>
                            </div>

                            {day.reasons.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
                                    {day.reasons.map((reason) => (
                                        <span
                                            key={reason}
                                            className="rounded-full bg-white px-2.5 py-1 text-xs text-slate-500 ring-1 ring-slate-200"
                                        >
                                            {reason}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400">
                    <LegendDot className="bg-green-500" label="LOW 0–29" />
                    <LegendDot className="bg-blue-500" label="MODERATE 30–59" />
                    <LegendDot className="bg-amber-500" label="HIGH 60–84" />
                    <LegendDot className="bg-red-500" label="CRITICAL 85–100" />
                </div>
            </section>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {children}
        </h3>
    );
}

function ExecutiveCard({
                           label,
                           value,
                           hint,
                           valueClassName,
                           badgeVariant,
                           danger = false,
                       }: {
    label: string;
    value: string;
    hint: string;
    valueClassName?: string;
    badgeVariant?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
    danger?: boolean;
}) {
    return (
        <div
            className={[
                'rounded-lg border bg-white px-4 py-5 text-center shadow-sm',
                danger ? 'border-red-200 bg-red-50' : 'border-slate-200',
            ].join(' ')}
        >
            {badgeVariant ? (
                <div className="flex justify-center">
                    <UiBadge variant={badgeVariant}>{value}</UiBadge>
                </div>
            ) : (
                <p
                    className={[
                        'text-[28px] font-bold leading-tight text-slate-900',
                        valueClassName ?? '',
                    ].join(' ')}
                >
                    {value}
                </p>
            )}

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p
                className={[
                    'mt-2 text-xs',
                    danger ? 'text-red-500' : 'text-slate-400',
                ].join(' ')}
            >
                {hint}
            </p>
        </div>
    );
}

function FinancialMetric({
                             label,
                             value,
                             positive,
                         }: {
    label: string;
    value: string;
    positive?: boolean;
}) {
    return (
        <div className="px-4 py-4 text-center">
            <p
                className={[
                    'text-[18px] font-bold text-slate-900',
                    positive === true ? 'text-green-600' : '',
                    positive === false ? 'text-red-600' : '',
                ].join(' ')}
            >
                {value}
            </p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
        </div>
    );
}

function MetricRows({
                        rows,
                    }: {
    rows: Array<{
        label: string;
        value: string;
        hint?: string;
        positive?: boolean;
    }>;
}) {
    return (
        <div className="divide-y divide-slate-50 px-5">
            {rows.map((row) => (
                <div
                    key={row.label}
                    className="flex items-center justify-between gap-6 py-4"
                >
                    <span className="text-sm text-slate-500">{row.label}</span>
                    <div className="text-right">
                        <p
                            className={[
                                'text-sm font-bold text-slate-800',
                                row.positive === true ? 'text-green-600' : '',
                                row.positive === false ? 'text-red-600' : '',
                            ].join(' ')}
                        >
                            {row.value}
                        </p>
                        {row.hint && (
                            <p className="mt-1 text-xs text-slate-400">{row.hint}</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function CostTotalCard({
                           label,
                           value,
                           hint,
                       }: {
    label: string;
    value: string;
    hint: string;
}) {
    return (
        <div className="px-5 py-4">
            <p className="text-[18px] font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
        </div>
    );
}

function ItineraryMetricCard({
                                 label,
                                 value,
                                 danger = false,
                                 warning = false,
                             }: {
    label: string;
    value: string;
    danger?: boolean;
    warning?: boolean;
}) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
            <p
                className={[
                    'text-[20px] font-bold leading-tight',
                    danger ? 'text-red-600' : warning ? 'text-amber-600' : 'text-blue-600',
                ].join(' ')}
            >
                {value}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>
        </div>
    );
}

function LegendDot({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className={['h-2 w-2 rounded-full', className].join(' ')} />
            {label}
        </span>
    );
}
