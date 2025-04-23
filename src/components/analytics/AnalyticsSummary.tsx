
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

export const AnalyticsSummary = () => {
  // Mock data for demonstration
  const summary = {
    totalWaste: 45,
    wasteReduction: 15,
    topExpiredCategories: ['Dairy', 'Produce', 'Leftovers'],
    averageShelfLife: 8.5
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <p className="text-sm font-medium">Total Waste This Month</p>
              <p className="text-2xl font-bold">{summary.totalWaste} items</p>
            </div>
            <div className="flex items-center text-green-500">
              <ArrowDownIcon className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">{summary.wasteReduction}%</span>
            </div>
          </div>
          
          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium mb-2">Top Expired Categories</p>
            <div className="space-y-2">
              {summary.topExpiredCategories.map((category, index) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="text-sm text-muted-foreground">
                    {30 - index * 5}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <p className="text-sm font-medium">Average Shelf Life</p>
            <p className="text-2xl font-bold">{summary.averageShelfLife} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
