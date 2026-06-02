import type { TourPackage } from '../types/tourPackage.types';
import {
    useGetPackageExclusionsQuery,
    useGetPackageHighlightsQuery,
    useGetPackageInclusionsQuery,
} from '../api/packageContentApi';
import { PackageContentSection } from '../components/PackageContentSection';

type PackageContentTabProps = {
    tourPackage: TourPackage;
};

export function PackageContentTab({ tourPackage }: PackageContentTabProps) {
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

    return (
        <div className="max-w-[840px] space-y-5">
            <div>
                <h2 className="text-[16px] font-semibold text-slate-900">
                    Package Content
                </h2>
                <p className="mt-1 text-[13px] text-slate-400">
                    Customer-facing content shown in proposals and booking confirmations.
                </p>
            </div>

            <PackageContentSection
                type="highlight"
                packageId={tourPackage.id}
                title="Highlights"
                addButtonLabel="Add Highlight"
                items={highlightsQuery.data?.data ?? []}
                isLoading={highlightsQuery.isLoading}
                isError={highlightsQuery.isError}
                onRetry={highlightsQuery.refetch}
                onChanged={highlightsQuery.refetch}
            />

            <PackageContentSection
                type="inclusion"
                packageId={tourPackage.id}
                title="Inclusions"
                addButtonLabel="Add Inclusion"
                items={inclusionsQuery.data?.data ?? []}
                isLoading={inclusionsQuery.isLoading}
                isError={inclusionsQuery.isError}
                onRetry={inclusionsQuery.refetch}
                onChanged={inclusionsQuery.refetch}
            />

            <PackageContentSection
                type="exclusion"
                packageId={tourPackage.id}
                title="Exclusions"
                addButtonLabel="Add Exclusion"
                items={exclusionsQuery.data?.data ?? []}
                isLoading={exclusionsQuery.isLoading}
                isError={exclusionsQuery.isError}
                onRetry={exclusionsQuery.refetch}
                onChanged={exclusionsQuery.refetch}
            />
        </div>
    );
}
