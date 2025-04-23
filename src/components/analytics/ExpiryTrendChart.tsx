
import React from 'react';
import { Card } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ExpiryTrendChartProps {
  timeframe: 'day' | 'month' | 'year';
}

const generateMockData = (timeframe: 'day' | 'month' | 'year') => {
  const data = [];
  const now = new Date();
  const points = timeframe === 'day' ? 24 : timeframe === 'month' ? 30 : 12;
  
  for (let i = 0; i < points; i++) {
    const date = new Date(now);
    if (timeframe === 'day') {
      date.setHours(date.getHours() - i);
    } else if (timeframe === 'month') {
      date.setDate(date.getDate() - i);
    } else {
      date.setMonth(date.getMonth() - i);
    }
    
    data.unshift({
      date: date.toLocaleString('default', 
        timeframe === 'day' ? { hour: 'numeric' } :
        timeframe === 'month' ? { month: 'short', day: 'numeric' } :
        { month: 'short' }
      ),
      expired: Math.floor(Math.random() * 10),
      atRisk: Math.floor(Math.random() * 15)
    });
  }
  
  return data;
};

export const ExpiryTrendChart: React.FC<ExpiryTrendChartProps> = ({ timeframe }) => {
  const data = generateMockData(timeframe);

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="expired"
            stackId="1"
            stroke="#ef4444"
            fill="#fee2e2"
          />
          <Area
            type="monotone"
            dataKey="atRisk"
            stackId="1"
            stroke="#f59e0b"
            fill="#fef3c7"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
