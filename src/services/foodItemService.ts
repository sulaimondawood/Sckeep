
import { supabase } from '@/lib/supabase';
import { FoodItem } from '@/types/food';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from './authService';

// Convert from Supabase format to our app format
const mapFromSupabase = (item: any): FoodItem => ({
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
});

// Convert from our app format to Supabase format
const mapToSupabase = (item: FoodItem, userId: string) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  expiry_date: item.expiryDate,
  added_date: item.addedDate,
  barcode: item.barcode || null,
  quantity: item.quantity,
  unit: item.unit,
  notes: item.notes || null,
  image_url: item.imageUrl || null,
  user_id: userId,
  updated_at: new Date().toISOString()
});

// Get all food items for current user
export const getAllFoodItems = async (): Promise<FoodItem[]> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(mapFromSupabase);
  } catch (error) {
    console.error('Error getting food items:', error);
    return [];
  }
};

// Get a single food item by ID
export const getFoodItemById = async (id: string): Promise<FoodItem | null> => {
  try {
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error(`Error getting food item with ID ${id}:`, error);
    return null;
  }
};

// Create a new food item
export const createFoodItem = async (item: Omit<FoodItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<FoodItem | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newItem = {
      id: uuidv4(),
      ...item,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: null,
      expiry_date: item.expiryDate,
      added_date: item.addedDate,
      image_url: item.imageUrl || null,
      barcode: item.barcode || null,
      notes: item.notes || null
    };

    const { data, error } = await supabase
      .from('food_items')
      .insert([newItem])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error creating food item:', error);
    return null;
  }
};

// Update an existing food item
export const updateFoodItem = async (item: FoodItem): Promise<FoodItem | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('food_items')
      .update(mapToSupabase(item, user.id))
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapFromSupabase(data);
  } catch (error) {
    console.error(`Error updating food item with ID ${item.id}:`, error);
    return null;
  }
};

// Delete a food item
export const deleteFoodItem = async (id: string): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error(`Error deleting food item with ID ${id}:`, error);
    return false;
  }
};

// Migration utility: Move localStorage data to Supabase
export const migrateLocalStorageToSupabase = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get food items from localStorage
    const localItems = localStorage.getItem('foodItems');
    if (!localItems) {
      return true; // Nothing to migrate
    }

    const foodItems: FoodItem[] = JSON.parse(localItems);
    
    // Map items to Supabase format with user_id
    const supabaseItems = foodItems.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      expiry_date: item.expiryDate,
      added_date: item.addedDate,
      barcode: item.barcode || null,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || null,
      image_url: item.imageUrl || null,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: null
    }));
    
    // Insert items into Supabase
    const { error } = await supabase
      .from('food_items')
      .upsert(supabaseItems, { onConflict: 'id' });
    
    if (error) {
      throw error;
    }
    
    // Migration successful, clear localStorage
    localStorage.removeItem('foodItems');
    localStorage.removeItem('deletedItems');
    
    return true;
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
    return false;
  }
};
