import { UiBadge } from '../../../shared/components/UiBadge';

type PackageRiskBadgeProps = {
    risk?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
};

export function PackageRiskBadge({ risk }: PackageRiskBadgeProps) {
    if (!risk) {
        return (
            <span className="text-xs font-medium text-slate-300">
                —
            </span>
        );
    }

    if (risk === 'LOW') {
        return <UiBadge variant="green">Low Risk</UiBadge>;
    }

    if (risk === 'MEDIUM') {
        return <UiBadge variant="amber">Medium Risk</UiBadge>;
    }

    return <UiBadge variant="red">{risk === 'CRITICAL' ? 'Critical' : 'High Risk'}</UiBadge>;
}
