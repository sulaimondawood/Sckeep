
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './authService';

// Upload an image to Supabase Storage
export const uploadImage = async (file: File, itemId: string): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${itemId}-${Date.now()}.${fileExt}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('food_images')
      .upload(filePath, file);
      
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data } = supabase.storage
      .from('food_images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Delete an image from Supabase Storage
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucket = pathParts[1]; // e.g., 'food_images'
    const filePath = pathParts.slice(2).join('/');
    
    if (bucket !== 'food_images') {
      return false; // Not our storage bucket
    }
    
    // Delete the file
    const { error } = await supabase.storage
      .from('food_images')
      .remove([filePath]);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
