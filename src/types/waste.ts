export interface WasteLogEntry {
  id: string;
  userId: string;
  foodItemId?: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  disposalType: 'wasted' | 'consumed' | 'donated' | 'composted';
  disposalDate: string;
  expiryDate: string;
  reason?: string;
  estimatedCost: number;
  carbonFootprintKg: number;
  createdAt: string;
  updatedAt?: string;
}

export interface WasteGoal {
  id: string;
  userId: string;
  goalType: 'monthly_waste_reduction' | 'carbon_footprint_reduction' | 'cost_savings';
  targetValue: number;
  currentValue: number;
  targetPeriod: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CarbonFootprintData {
  id: string;
  category: string;
  carbonPerKg: number;
  createdAt: string;
}

export interface WasteAnalytics {
  totalWasted: number;
  totalConsumed: number;
  totalDonated: number;
  totalComposted: number;
  wasteReduction: number;
  carbonFootprint: number;
  costSavings: number;
  wastedByCategory: { [key: string]: number };
  wasteOverTime: { date: string; wasted: number; consumed: number }[];
  goalProgress: { 
    type: string; 
    current: number; 
    target: number; 
    percentage: number 
  }[];
}