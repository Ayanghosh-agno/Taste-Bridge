import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TrendChartProps {
  data: Array<{ day: string; value: number }>;
}

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
          <p className="text-white font-semibold">{label}</p>
          <p className="text-purple-400">
            Activity: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="day" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#colorGradient)"
            strokeWidth={3}
            dot={{ fill: '#a855f7', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#a855f7', strokeWidth: 2, fill: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;