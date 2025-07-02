import { supabase } from '@/integrations/supabase/client';
import { WasteLogEntry, WasteGoal, CarbonFootprintData, WasteAnalytics } from '@/types/waste';
import { FoodItem } from '@/types/food';

// Convert from Supabase format to app format for waste log
const mapWasteLogFromSupabase = (item: any): WasteLogEntry => ({
  id: item.id,
  userId: item.user_id,
  foodItemId: item.food_item_id || undefined,
  itemName: item.item_name,
  category: item.category,
  quantity: item.quantity,
  unit: item.unit,
  disposalType: item.disposal_type,
  disposalDate: item.disposal_date,
  expiryDate: item.expiry_date,
  reason: item.reason || undefined,
  estimatedCost: item.estimated_cost || 0,
  carbonFootprintKg: item.carbon_footprint_kg || 0,
  createdAt: item.created_at,
  updatedAt: item.updated_at
});

// Convert from app format to Supabase format for waste log
const mapWasteLogToSupabase = (item: Omit<WasteLogEntry, 'id' | 'createdAt' | 'updatedAt'>) => ({
  user_id: item.userId,
  food_item_id: item.foodItemId || null,
  item_name: item.itemName,
  category: item.category,
  quantity: item.quantity,
  unit: item.unit,
  disposal_type: item.disposalType,
  disposal_date: item.disposalDate,
  expiry_date: item.expiryDate,
  reason: item.reason || null,
  estimated_cost: item.estimatedCost,
  carbon_footprint_kg: item.carbonFootprintKg
});

// Convert from Supabase format to app format for waste goals
const mapWasteGoalFromSupabase = (item: any): WasteGoal => ({
  id: item.id,
  userId: item.user_id,
  goalType: item.goal_type,
  targetValue: item.target_value,
  currentValue: item.current_value,
  targetPeriod: item.target_period,
  startDate: item.start_date,
  endDate: item.end_date || undefined,
  isActive: item.is_active,
  createdAt: item.created_at,
  updatedAt: item.updated_at
});

// Log when an item is disposed (wasted, consumed, etc.)
export const logItemDisposal = async (
  item: FoodItem,
  disposalType: 'wasted' | 'consumed' | 'donated' | 'composted',
  reason?: string,
  estimatedCost?: number
): Promise<WasteLogEntry | null> => {
  try {
    // Get carbon footprint for the category
    const carbonData = await getCarbonFootprintForCategory(item.category);
    const carbonFootprint = carbonData ? (carbonData.carbonPerKg * item.quantity) : 0;

    const wasteEntry = {
      userId: item.userId,
      foodItemId: item.id,
      itemName: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      disposalType,
      disposalDate: new Date().toISOString().split('T')[0],
      expiryDate: item.expiryDate,
      reason,
      estimatedCost: estimatedCost || 0,
      carbonFootprintKg: carbonFootprint
    };

    const { data, error } = await supabase
      .from('waste_log')
      .insert([mapWasteLogToSupabase(wasteEntry)])
      .select()
      .single();

    if (error) {
      console.error('Error logging waste:', error);
      throw error;
    }

    // Update waste goals progress
    await updateGoalProgress(item.userId, disposalType, item.quantity, carbonFootprint, estimatedCost || 0);

    return mapWasteLogFromSupabase(data);
  } catch (error) {
    console.error('Error logging item disposal:', error);
    return null;
  }
};

// Get carbon footprint data for a category
export const getCarbonFootprintForCategory = async (category: string): Promise<CarbonFootprintData | null> => {
  try {
    const { data, error } = await supabase
      .from('carbon_footprint_data')
      .select('*')
      .eq('category', category)
      .single();

    if (error) {
      console.error('Error fetching carbon footprint data:', error);
      return null;
    }

    return {
      id: data.id,
      category: data.category,
      carbonPerKg: data.carbon_per_kg,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error getting carbon footprint data:', error);
    return null;
  }
};

// Get all waste log entries for a user
export const getWasteLog = async (userId: string, limit?: number): Promise<WasteLogEntry[]> => {
  try {
    let query = supabase
      .from('waste_log')
      .select('*')
      .eq('user_id', userId)
      .order('disposal_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching waste log:', error);
      throw error;
    }

    return data.map(mapWasteLogFromSupabase);
  } catch (error) {
    console.error('Error getting waste log:', error);
    return [];
  }
};

// Create a new waste goal
export const createWasteGoal = async (
  userId: string,
  goalType: 'monthly_waste_reduction' | 'carbon_footprint_reduction' | 'cost_savings',
  targetValue: number,
  targetPeriod: string = 'monthly'
): Promise<WasteGoal | null> => {
  try {
    const { data, error } = await supabase
      .from('waste_goals')
      .insert([{
        user_id: userId,
        goal_type: goalType,
        target_value: targetValue,
        target_period: targetPeriod
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating waste goal:', error);
      throw error;
    }

    return mapWasteGoalFromSupabase(data);
  } catch (error) {
    console.error('Error creating waste goal:', error);
    return null;
  }
};

// Get active waste goals for a user
export const getWasteGoals = async (userId: string): Promise<WasteGoal[]> => {
  try {
    const { data, error } = await supabase
      .from('waste_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waste goals:', error);
      throw error;
    }

    return data.map(mapWasteGoalFromSupabase);
  } catch (error) {
    console.error('Error getting waste goals:', error);
    return [];
  }
};

// Update goal progress when items are disposed
const updateGoalProgress = async (
  userId: string, 
  disposalType: string, 
  quantity: number, 
  carbonFootprint: number, 
  cost: number
): Promise<void> => {
  try {
    const goals = await getWasteGoals(userId);
    
    for (const goal of goals) {
      let progressValue = 0;
      
      switch (goal.goalType) {
        case 'monthly_waste_reduction':
          if (disposalType === 'consumed' || disposalType === 'donated') {
            progressValue = quantity;
          }
          break;
        case 'carbon_footprint_reduction':
          if (disposalType === 'consumed' || disposalType === 'donated') {
            progressValue = carbonFootprint;
          }
          break;
        case 'cost_savings':
          if (disposalType === 'consumed' || disposalType === 'donated') {
            progressValue = cost;
          }
          break;
      }

      if (progressValue > 0) {
        await supabase
          .from('waste_goals')
          .update({ current_value: goal.currentValue + progressValue })
          .eq('id', goal.id);
      }
    }
  } catch (error) {
    console.error('Error updating goal progress:', error);
  }
};

// Get comprehensive waste analytics
export const getWasteAnalytics = async (userId: string, days: number = 30): Promise<WasteAnalytics> => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data: wasteData, error } = await supabase
      .from('waste_log')
      .select('*')
      .eq('user_id', userId)
      .gte('disposal_date', startDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching waste analytics:', error);
      throw error;
    }

    const wasteEntries = wasteData.map(mapWasteLogFromSupabase);
    
    // Calculate totals by disposal type
    const totals = wasteEntries.reduce((acc, entry) => {
      switch (entry.disposalType) {
        case 'wasted':
          acc.totalWasted += entry.quantity;
          break;
        case 'consumed':
          acc.totalConsumed += entry.quantity;
          break;
        case 'donated':
          acc.totalDonated += entry.quantity;
          break;
        case 'composted':
          acc.totalComposted += entry.quantity;
          break;
      }
      return acc;
    }, {
      totalWasted: 0,
      totalConsumed: 0,
      totalDonated: 0,
      totalComposted: 0
    });

    // Calculate waste by category
    const wastedByCategory = wasteEntries
      .filter(entry => entry.disposalType === 'wasted')
      .reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + entry.quantity;
        return acc;
      }, {} as { [key: string]: number });

    // Calculate waste over time (daily)
    const wasteOverTime = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = wasteEntries.filter(entry => entry.disposalDate === dateStr);
      
      return {
        date: dateStr,
        wasted: dayEntries.filter(e => e.disposalType === 'wasted').reduce((sum, e) => sum + e.quantity, 0),
        consumed: dayEntries.filter(e => e.disposalType === 'consumed').reduce((sum, e) => sum + e.quantity, 0)
      };
    });

    // Calculate totals
    const totalCarbonFootprint = wasteEntries.reduce((sum, entry) => sum + entry.carbonFootprintKg, 0);
    const totalCostSavings = wasteEntries
      .filter(entry => entry.disposalType === 'consumed' || entry.disposalType === 'donated')
      .reduce((sum, entry) => sum + entry.estimatedCost, 0);
    
    const wasteReduction = totals.totalConsumed + totals.totalDonated + totals.totalComposted;

    // Get goal progress
    const goals = await getWasteGoals(userId);
    const goalProgress = goals.map(goal => ({
      type: goal.goalType,
      current: goal.currentValue,
      target: goal.targetValue,
      percentage: Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    }));

    return {
      ...totals,
      wasteReduction,
      carbonFootprint: totalCarbonFootprint,
      costSavings: totalCostSavings,
      wastedByCategory,
      wasteOverTime,
      goalProgress
    };
  } catch (error) {
    console.error('Error getting waste analytics:', error);
    return {
      totalWasted: 0,
      totalConsumed: 0,
      totalDonated: 0,
      totalComposted: 0,
      wasteReduction: 0,
      carbonFootprint: 0,
      costSavings: 0,
      wastedByCategory: {},
      wasteOverTime: [],
      goalProgress: []
    };
  }
};