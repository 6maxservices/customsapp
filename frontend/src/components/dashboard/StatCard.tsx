
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    className?: string;
    iconClassName?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconClassName,
}: StatCardProps) {
    return (
        <div className={cn("bg-white overflow-hidden rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all", className)}>
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <Icon className={cn("h-6 w-6 text-gray-400", iconClassName)} aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                            <dd>
                                <div className="text-lg font-bold text-gray-900">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
            {(description || trend) && (
                <div className="bg-gray-50 px-5 py-3">
                    <div className="text-sm">
                        {trend && (
                            <span className={cn("font-medium mr-2", trend.positive ? "text-green-600" : "text-red-600")}>
                                {trend.positive ? '+' : ''}{trend.value}%
                            </span>
                        )}
                        <span className="text-gray-500">{description || trend?.label}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
