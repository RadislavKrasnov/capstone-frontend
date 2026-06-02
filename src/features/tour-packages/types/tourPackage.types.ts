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
    quality: {
        overallScore: number;
        qualityLevel: 'EXCELLENT' | 'GOOD' | 'RISKY' | 'POOR' | 'CRITICAL';
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
};

export type PackageProposalItem = {
    id: number;
    uuid: string;
    packageId: number;
    text: string;
    displayOrder: number;
};
