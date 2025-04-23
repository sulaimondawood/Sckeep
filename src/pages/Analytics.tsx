
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpiryTrendChart } from '@/components/analytics/ExpiryTrendChart';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { WasteReductionTips } from '@/components/analytics/WasteReductionTips';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartLine } from 'lucide-react';

const Analytics = () => {
  const [timeframe, setTimeframe] = useState<'day' | 'month' | 'year'>('month');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ChartLine className="h-6 w-6" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your food waste patterns and get insights
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Expiry Trends</CardTitle>
              <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as typeof timeframe)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ExpiryTrendChart timeframe={timeframe} />
          </CardContent>
        </Card>
        <AnalyticsSummary />
      </div>

      <WasteReductionTips />
    </div>
  );
};

export default Analytics;
