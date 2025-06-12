
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/types/food';

export interface AnalyticsData {
  totalItems: number;
  expiringItems: number;
  categoryCounts: { [key: string]: number };
  expiryTrend: { date: string; count: number }[];
  wasteReduction: {
    itemsSaved: number;
    percentageImprovement: number;
  };
}

export const getAnalyticsData = async (userId: string): Promise<AnalyticsData> => {
  try {
    // Get all food items for the user
    const { data: foodItems, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const items: FoodItem[] = foodItems?.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      expiryDate: item.expiry_date,
      addedDate: item.added_date,
      barcode: item.barcode || undefined,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || undefined,
      imageUrl: item.image_url || undefined,
      userId: item.user_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    })) || [];

    // Calculate analytics
    const totalItems = items.length;
    
    // Items expiring in the next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const expiringItems = items.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate >= today && expiryDate <= nextWeek;
    }).length;

    // Category counts
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Expiry trend for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const expiryTrend = last30Days.map(date => ({
      date,
      count: items.filter(item => item.expiryDate === date).length
    }));

    // Simple waste reduction calculation (items that haven't expired yet)
    const nonExpiredItems = items.filter(item => new Date(item.expiryDate) >= today);
    const itemsSaved = nonExpiredItems.length;
    const percentageImprovement = totalItems > 0 ? Math.round((itemsSaved / totalItems) * 100) : 0;

    return {
      totalItems,
      expiringItems,
      categoryCounts,
      expiryTrend,
      wasteReduction: {
        itemsSaved,
        percentageImprovement
      }
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Return default data on error
    return {
      totalItems: 0,
      expiringItems: 0,
      categoryCounts: {},
      expiryTrend: [],
      wasteReduction: {
        itemsSaved: 0,
        percentageImprovement: 0
      }
    };
  }
};
