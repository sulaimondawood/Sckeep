
import { supabase } from '@/integrations/supabase/client';
import { FoodItem } from '@/types/food';
import { v4 as uuidv4 } from 'uuid';

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

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

// Get all food items for a specific user
export const getAllFoodItems = async (userId: string): Promise<FoodItem[]> => {
  try {
    console.log('Fetching food items for user:', userId);
    const { data, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching food items:', error);
      throw error;
    }

    console.log('Successfully fetched food items:', data?.length || 0);
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
export const createFoodItem = async (item: Omit<FoodItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, userId: string): Promise<FoodItem | null> => {
  try {
    console.log('Creating food item for user:', userId);
    console.log('Item data to create:', item);

    // Validate required fields
    if (!item.name || !item.category || !item.expiryDate || !item.addedDate) {
      const missingFields = [];
      if (!item.name) missingFields.push('name');
      if (!item.category) missingFields.push('category');
      if (!item.expiryDate) missingFields.push('expiryDate');
      if (!item.addedDate) missingFields.push('addedDate');
      
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const newItem = {
      id: uuidv4(),
      name: item.name,
      category: item.category,
      expiry_date: item.expiryDate,
      added_date: item.addedDate,
      quantity: item.quantity || 1,
      unit: item.unit || 'pcs',
      barcode: item.barcode || null,
      notes: item.notes || null,
      image_url: item.imageUrl || null,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: null
    };

    console.log('Prepared item for insertion:', newItem);

    const { data, error } = await supabase
      .from('food_items')
      .insert([newItem])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating food item:', error);
      
      // Provide more specific error messages
      if (error.code === 'PGRST116') {
        throw new Error('Unable to save item. Please check your internet connection and try again.');
      } else if (error.message?.includes('violates row-level security')) {
        throw new Error('Authentication issue. Please log out and log back in.');
      } else {
        throw new Error(`Failed to save item: ${error.message}`);
      }
    }

    if (!data) {
      console.error('No data returned from insert operation');
      throw new Error('Failed to save item - no data returned');
    }

    console.log('Successfully created food item:', data);
    return mapFromSupabase(data);
  } catch (error) {
    console.error('Error creating food item:', error);
    
    // Re-throw with better context
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Unknown error occurred while creating food item');
    }
  }
};

// Update an existing food item
export const updateFoodItem = async (item: FoodItem, userId: string): Promise<FoodItem | null> => {
  try {
    console.log('Updating food item:', item.id);
    
    const { data, error } = await supabase
      .from('food_items')
      .update(mapToSupabase(item, userId))
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating food item:', error);
      throw error;
    }

    console.log('Successfully updated food item:', data);
    return mapFromSupabase(data);
  } catch (error) {
    console.error(`Error updating food item with ID ${item.id}:`, error);
    return null;
  }
};

// Delete a food item
export const deleteFoodItem = async (id: string, userId: string): Promise<boolean> => {
  try {
    console.log('Deleting food item:', id);
    
    const { error } = await supabase
      .from('food_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase error deleting food item:', error);
      throw error;
    }

    console.log('Successfully deleted food item:', id);
    return true;
  } catch (error) {
    console.error(`Error deleting food item with ID ${id}:`, error);
    return false;
  }
};

// Migration utility: Move localStorage data to Supabase
export const migrateLocalStorageToSupabase = async (userId: string): Promise<boolean> => {
  try {
    // Get food items from localStorage
    const localItems = localStorage.getItem('foodItems');
    if (!localItems) {
      return true; // Nothing to migrate
    }

    const foodItems: FoodItem[] = JSON.parse(localItems);
    
    // Filter out items with invalid UUIDs and regenerate IDs if needed
    const validItems = foodItems.filter(item => {
      if (!isValidUUID(item.id)) {
        console.warn(`Skipping item with invalid UUID: ${item.id} - ${item.name}`);
        return false;
      }
      return true;
    });

    if (validItems.length === 0) {
      console.log('No valid items to migrate, clearing localStorage');
      localStorage.removeItem('foodItems');
      localStorage.removeItem('deletedItems');
      return true;
    }
    
    // Map items to Supabase format with user_id
    const supabaseItems = validItems.map(item => ({
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
    
    console.log(`Successfully migrated ${validItems.length} items to Supabase`);
    return true;
  } catch (error) {
    console.error('Error migrating data to Supabase:', error);
    return false;
  }
};
