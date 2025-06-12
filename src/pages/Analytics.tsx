
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAnalyticsData, AnalyticsData } from '@/services/analyticsService';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import ExpiryTrendChart from '@/components/analytics/ExpiryTrendChart';
import WasteReductionTips from '@/components/analytics/WasteReductionTips';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const data = await getAnalyticsData(user.id);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyticsData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your food management patterns and reduce waste
        </p>
      </div>

      <AnalyticsSummary 
        totalItems={analyticsData.totalItems}
        expiringItems={analyticsData.expiringItems}
        categoryCounts={analyticsData.categoryCounts}
      />

      <ExpiryTrendChart expiryTrend={analyticsData.expiryTrend} />

      <WasteReductionTips 
        itemsSaved={analyticsData.wasteReduction.itemsSaved}
        percentageImprovement={analyticsData.wasteReduction.percentageImprovement}
      />
    </div>
  );
};

export default Analytics;
