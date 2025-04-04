
import { FoodItem, Notification } from "@/types/food";

export const mockFoodItems: FoodItem[] = [
  {
    id: "1",
    name: "Milk",
    category: "Dairy",
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode: "8901234567890",
    quantity: 1,
    unit: "bottle",
    notes: "Organic whole milk"
  },
  {
    id: "2",
    name: "Apples",
    category: "Fruits",
    expiryDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 6,
    unit: "pieces"
  },
  {
    id: "3",
    name: "Bread",
    category: "Bakery",
    expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode: "5901234567891",
    quantity: 1,
    unit: "loaf"
  },
  {
    id: "4",
    name: "Chicken Breast",
    category: "Meat",
    expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 500,
    unit: "grams"
  },
  {
    id: "5",
    name: "Yogurt",
    category: "Dairy",
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode: "7501234567892",
    quantity: 6,
    unit: "cups"
  },
  {
    id: "6",
    name: "Lettuce",
    category: "Vegetables",
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 1,
    unit: "head"
  },
  {
    id: "7",
    name: "Orange Juice",
    category: "Beverages",
    expiryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    barcode: "6401234567893",
    quantity: 1,
    unit: "carton"
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "expiry",
    message: "Milk is expiring in 2 days",
    itemId: "1",
    read: false,
    date: new Date().toISOString()
  },
  {
    id: "2",
    type: "expiry",
    message: "Chicken Breast is expiring tomorrow",
    itemId: "4",
    read: false,
    date: new Date().toISOString()
  },
  {
    id: "3",
    type: "expiry",
    message: "Lettuce has expired",
    itemId: "6",
    read: true,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "4",
    type: "system",
    message: "System synchronized with IoT sensors",
    read: true,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
