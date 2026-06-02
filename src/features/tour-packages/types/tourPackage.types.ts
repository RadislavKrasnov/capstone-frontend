import type { AuthAgency } from '../../auth/types/auth.types';
import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type PackageStatus = 'DRAFT' | 'ANALYZED' | 'PUBLISHED' | 'ARCHIVED';

export type TourPackage = {
    id: number;
    uuid: string;
    agencyId: number;
    title: string;
    slug: string;
    description?: string | null;
    destinationCountry?: string | null;
    destinationCity?: string | null;
    durationDays: number;
    expectedGroupSize: number;
    sellingPricePerPerson: number;
    currencyCode: string;
    status: PackageStatus;
    internalNotes?: string | null;
    highlights?: PackageProposalItem[];
    inclusions?: PackageProposalItem[];
    exclusions?: PackageProposalItem[];
    agency?: Pick<AuthAgency, 'id' | 'uuid' | 'name' | 'slug'>;
    createdAt: string;
    updatedAt: string;
};

export type GetTourPackagesRequest = {
    page?: number;
    limit?: number;
    agencyId?: number;
};

export type GetTourPackagesResponse = PaginatedResponse<TourPackage>;

export type CreateTourPackageRequest = {
    agencyId: number;
    title: string;
    slug: string;
    description?: string;
    destinationCountry?: string;
    destinationCity?: string;
    durationDays: number;
    expectedGroupSize: number;
    sellingPricePerPerson: number;
    currencyCode?: string;
    status?: PackageStatus;
    internalNotes?: string;
};

export type UpdateTourPackageRequest = Partial<CreateTourPackageRequest>;

export type UpdateTourPackageArgs = {
    uuid: string;
    body: UpdateTourPackageRequest;
};

export type DeleteTourPackageArgs = {
    uuid: string;
};

export type FinancialRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type QualityLevel = 'EXCELLENT' | 'GOOD' | 'RISKY' | 'POOR' | 'CRITICAL';

export type FatigueLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type RecommendationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type RecommendationCategory =
    | 'FINANCIAL'
    | 'ITINERARY'
    | 'OPERATIONAL'
    | 'COST_STRUCTURE';

export type AnalysisDashboardRecommendation = {
    uuid?: string;
    ruleCode: string;
    category: RecommendationCategory;
    severity: RecommendationSeverity;
    title: string;
    explanation: string;
    suggestedAction: string;
    affectedMetric?: string | null;
    affectedDayId?: number | null;
    affectedItemId?: number | null;
};

export type AnalysisDashboardResponse = {
    analysisRun: {
        uuid: string;
        status: 'COMPLETED' | 'FAILED';
        algorithmVersion: string;
        createdAt: string;
    };

    financial: {
        totalRevenue: number;
        totalCost: number;
        grossProfit: number;
        grossMarginPercent: number;

        fixedCostTotal: number;
        variableCostTotal: number;
        variableCostPerPerson: number;

        costPerPerson: number;
        profitPerPerson: number;
        contributionPerPerson: number;

        breakEvenGroupSize: number;
        breakEvenGroupSizeRounded: number;
        breakEvenSafetyTravelers: number;
        breakEvenUtilizationPercent: number;

        requiredPriceForTargetMargin: number;
        priceGapPerPerson: number;
        requiredCostReductionForTargetMargin: number;

        markupPercent: number;
        financialRiskLevel: FinancialRiskLevel;

        categoryCostBreakdown: Array<{
            category: string;
            totalCost: number;
            sharePercent: number;
        }>;

        supplierCostBreakdown: Array<{
            supplierId: number | null;
            supplierName: string;
            totalCost: number;
            sharePercent: number;
        }>;
    };

    itinerary: {
        itineraryBalanceScore: number;
        averageFatigueScore: number;
        averageBalanceScore: number;

        overloadedDaysCount: number;
        criticalDaysCount: number;
        consecutiveHighFatigueSequences: number;

        validationWarnings: string[];

        dailyResults: Array<{
            dayId: number;
            dayNumber: number;
            title?: string;
            isRestDay: boolean;

            activityCount: number;
            transferMinutes: number;
            flightMinutes: number;
            freeTimeMinutes: number;
            mealMinutes: number;
            dayDurationMinutes: number;

            activityLoad: number;
            transferLoad: number;
            intensityLoad: number;
            compressionPenalty: number;
            restCredit: number;

            fatigueScore: number;
            balanceScore: number;
            fatigueLevel: FatigueLevel;

            transferSharePercent: number;
            activityDensity: number;
            restRatioPercent: number;

            reasons: string[];
        }>;
    };

    quality: {
        overallScore: number;
        qualityLevel: QualityLevel;
        profitabilityScore: number;
        itineraryBalanceScore: number;
        operationalFeasibilityScore: number;
        costStructureScore: number;
        appliedCaps: Array<{
            code: string;
            description: string;
            cappedAt: number;
        }>;
    };

    recommendations: {
        countsBySeverity: Record<'critical' | 'high' | 'medium' | 'low', number>;
        topRecommendations: AnalysisDashboardRecommendation[];
        groups: {
            financial: AnalysisDashboardRecommendation[];
            itinerary: AnalysisDashboardRecommendation[];
            operational: AnalysisDashboardRecommendation[];
            costStructure: AnalysisDashboardRecommendation[];
        };
    };
};

export type PackageProposalItem = {
    id: number;
    uuid: string;
    packageId: number;
    text: string;
    displayOrder: number;
};
