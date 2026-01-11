import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ComplianceChartProps {
    data: {
        compliant: number;
        nonCompliant: number;
    };
    onFilterChange?: (status: 'ALL' | 'COMPLIANT' | 'NON_COMPLIANT') => void;
    activeFilter?: string | null;
}

const COLORS = {
    COMPLIANT: '#22c55e', // green-500
    NON_COMPLIANT: '#ef4444', // red-500
};

export default function ComplianceChart({ data, onFilterChange, activeFilter }: ComplianceChartProps) {
    const chartData = useMemo(() => [
        { name: 'Compliant', value: data.compliant, color: COLORS.COMPLIANT, key: 'COMPLIANT' },
        { name: 'Non-Compliant', value: data.nonCompliant, color: COLORS.NON_COMPLIANT, key: 'NON_COMPLIANT' },
    ], [data]);

    const onPieClick = (data: any) => {
        if (onFilterChange) {
            // Toggle filter off if clicking same slice
            if (activeFilter === data.key) {
                onFilterChange('ALL');
            } else {
                onFilterChange(data.key);
            }
        }
    };

    if (!data.compliant && !data.nonCompliant) {
        return <div className="h-full flex items-center justify-center text-gray-400">No data available</div>;
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={onPieClick}
                        className="cursor-pointer"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                opacity={activeFilter && activeFilter !== entry.key ? 0.3 : 1}
                                stroke={activeFilter === entry.key ? '#000' : 'none'}
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry: any) => (
                            <span className={`text-sm font-medium ${activeFilter === entry.payload.key ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                                {value}
                            </span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
