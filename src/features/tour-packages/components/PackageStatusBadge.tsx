import { UiBadge } from '../../../shared/components/UiBadge';
import type { PackageStatus } from '../types/tourPackage.types';

const statusMeta: Record<
    PackageStatus,
    {
        label: string;
        variant: 'blue' | 'green' | 'gray';
    }
> = {
    DRAFT: {
        label: 'Draft',
        variant: 'gray',
    },
    ANALYZED: {
        label: 'Analyzed',
        variant: 'blue',
    },
    PUBLISHED: {
        label: 'Published',
        variant: 'green',
    },
    ARCHIVED: {
        label: 'Archived',
        variant: 'gray',
    },
};

export function PackageStatusBadge({ status }: { status: PackageStatus }) {
    const meta = statusMeta[status];

    return <UiBadge variant={meta.variant}>{meta.label}</UiBadge>;
}
