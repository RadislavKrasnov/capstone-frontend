type PackageMarginTextProps = {
    marginPercent?: number | null;
};

export function PackageMarginText({ marginPercent }: PackageMarginTextProps) {
    if (marginPercent === undefined || marginPercent === null) {
        return (
            <span className="text-sm font-semibold text-slate-300">
                —
            </span>
        );
    }

    const className =
        marginPercent >= 25
            ? 'text-green-600'
            : marginPercent >= 18
                ? 'text-amber-600'
                : 'text-red-600';

    return (
        <span className={`text-sm font-semibold ${className}`}>
            {marginPercent.toFixed(0)}%
        </span>
    );
}
