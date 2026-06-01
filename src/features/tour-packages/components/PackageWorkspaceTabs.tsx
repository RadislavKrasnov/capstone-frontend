import {
    BarChart3,
    ClipboardList,
    DollarSign,
    Eye,
    FileText,
    LayoutGrid,
    Target,
} from 'lucide-react';

export type PackageWorkspaceTab =
    | 'overview'
    | 'itinerary'
    | 'costs'
    | 'content'
    | 'analysis'
    | 'recommendations'
    | 'proposal';

type PackageWorkspaceTabsProps = {
    activeTab: PackageWorkspaceTab;
    onTabChange: (tab: PackageWorkspaceTab) => void;
};

const tabs: Array<{
    key: PackageWorkspaceTab;
    label: string;
    icon: React.ReactNode;
}> = [
    {
        key: 'overview',
        label: 'Overview',
        icon: <LayoutGrid size={14} />,
    },
    {
        key: 'itinerary',
        label: 'Itinerary',
        icon: <ClipboardList size={14} />,
    },
    {
        key: 'costs',
        label: 'Cost Module',
        icon: <DollarSign size={14} />,
    },
    {
        key: 'content',
        label: 'Content',
        icon: <FileText size={14} />,
    },
    {
        key: 'analysis',
        label: 'Analysis',
        icon: <BarChart3 size={14} />,
    },
    {
        key: 'recommendations',
        label: 'Recommendations',
        icon: <Target size={14} />,
    },
    {
        key: 'proposal',
        label: 'Proposal Preview',
        icon: <Eye size={14} />,
    },
];

export function PackageWorkspaceTabs({
                                         activeTab,
                                         onTabChange,
                                     }: PackageWorkspaceTabsProps) {
    return (
        <div className="border-t border-slate-100 bg-white">
            <div className="flex h-[44px] items-center gap-6">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => onTabChange(tab.key)}
                            className={[
                                'relative flex h-full items-center gap-1.5 text-[13px] font-medium transition-colors',
                                isActive
                                    ? 'text-blue-600'
                                    : 'text-slate-500 hover:text-slate-700',
                            ].join(' ')}
                        >
                            {tab.icon}
                            {tab.label}

                            {isActive && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue-600" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
