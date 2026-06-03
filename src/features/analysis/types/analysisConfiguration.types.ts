import type { PaginatedResponse } from '../../../shared/types/pagination.types';

export type AnalysisConfiguration = {
    id: number;
    uuid: string;
    agencyId?: number | null;
    agency?: {
        id: number;
        uuid: string;
        name: string;
        slug: string;
    };
    name: string;
    minTargetMarginPercent: number | string;
    goodMarginPercent: number | string;
    maxDailyFatigueScore: number;
    maxTransferMinutesPerDay: number;
    minBufferMinutes: number;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
};

export type GetAnalysisConfigurationsRequest = {
    page?: number;
    limit?: number;
    agencyId?: number;
    isDefault?: boolean;
};

export type GetAnalysisConfigurationsResponse =
    PaginatedResponse<AnalysisConfiguration>;

export type CreateAnalysisConfigurationRequest = {
    agencyId?: number | null;
    name: string;
    minTargetMarginPercent: number;
    goodMarginPercent: number;
    maxDailyFatigueScore: number;
    maxTransferMinutesPerDay: number;
    minBufferMinutes: number;
    isDefault?: boolean;
};

export type UpdateAnalysisConfigurationRequest =
    Partial<CreateAnalysisConfigurationRequest>;

export type UpdateAnalysisConfigurationArgs = {
    uuid: string;
    body: UpdateAnalysisConfigurationRequest;
};

export type DeleteAnalysisConfigurationArgs = {
    uuid: string;
};
