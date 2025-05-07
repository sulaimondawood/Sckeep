
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
}

export type ExpiryStatus = 'safe' | 'warning' | 'danger' | 'expired';

export interface Notification {
  id: string;
  type: 'expiry' | 'system';
  message: string;
  itemId?: string;
  read: boolean;
  date: string;
}
