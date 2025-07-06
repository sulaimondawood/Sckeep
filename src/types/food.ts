
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  expiryDate: string;
  addedDate: string;
  barcode?: string;
  quantity: number;
  unit: string;
  notes?: string;
  imageUrl?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpiryStatus = 'safe' | 'warning' | 'danger' | 'expired';

export interface Notification {
  id: string;
  type: 'expiry' | 'system';
  message: string;
  itemId?: string;
  read: boolean;
  date: string;
  userId?: string;
  createdAt?: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme?: string;
  notificationEnabled: boolean;
  expiryWarningDays: number;
  createdAt: string;
  updatedAt?: string;
}
