import { UiBadge } from '../../../shared/components/UiBadge';
import type { QualityLevel } from '../types/tourPackage.types';

type PackageQualityBadgeProps = {
    level?: QualityLevel | null;
};

const qualityLabels: Record<QualityLevel, string> = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    RISKY: 'Risky',
    POOR: 'Poor',
    CRITICAL: 'Critical',
};

export function PackageQualityBadge({ level }: PackageQualityBadgeProps) {
    if (!level) {
        return (
            <span className="text-xs font-medium text-slate-300">
                —
            </span>
        );
    }

    if (level === 'EXCELLENT' || level === 'GOOD') {
        return <UiBadge variant="green">{qualityLabels[level]}</UiBadge>;
    }

    if (level === 'RISKY') {
        return <UiBadge variant="amber">{qualityLabels[level]}</UiBadge>;
    }

    return <UiBadge variant="red">{qualityLabels[level]}</UiBadge>;
}
