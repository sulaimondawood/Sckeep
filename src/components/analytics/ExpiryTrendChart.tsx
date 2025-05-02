
import React from 'react';
import { Card } from '@/components/ui/card';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from 'next-themes';

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
  const { theme } = useTheme();
  const data = generateMockData(timeframe);

  const getColors = () => {
    return theme === 'dark' 
      ? { 
          expired: '#F97316', // Bright orange for better visibility in dark mode
          expiredFill: 'rgba(249, 115, 22, 0.3)', // Semi-transparent for area fill
          atRisk: '#8B5CF6', // Vivid purple for contrast
          atRiskFill: 'rgba(139, 92, 246, 0.3)', // Semi-transparent for area fill
          gridLines: '#444444',
        }
      : { 
          expired: '#ef4444', 
          expiredFill: '#fee2e2', 
          atRisk: '#8B5CF6',  // Vivid purple
          atRiskFill: '#f5f3ff', 
          gridLines: '#e5e5e5',
        };
  };

  const colors = getColors();

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="expiredFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.expired} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.expired} stopOpacity={0.2}/>
            </linearGradient>
            <linearGradient id="atRiskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.atRisk} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={colors.atRisk} stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme === 'dark' ? '#e5e5e5' : '#333333' }}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            tick={{ fill: theme === 'dark' ? '#e5e5e5' : '#333333' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              borderColor: colors.gridLines,
              color: theme === 'dark' ? '#fff' : '#333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }} 
          />
          <Area
            type="monotone"
            dataKey="expired"
            stackId="1"
            stroke={colors.expired}
            strokeWidth={2}
            fill="url(#expiredFill)"
            name="Expired Items"
          />
          <Area
            type="monotone"
            dataKey="atRisk"
            stackId="1"
            stroke={colors.atRisk}
            strokeWidth={2}
            fill="url(#atRiskFill)"
            name="At Risk Items"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
