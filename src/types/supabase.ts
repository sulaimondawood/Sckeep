
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      food_items: {
        Row: {
          id: string
          name: string
          category: string
          expiry_date: string
          added_date: string
          barcode: string | null
          quantity: number
          unit: string
          notes: string | null
          image_url: string | null
          user_id: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          expiry_date: string
          added_date: string
          barcode?: string | null
          quantity: number
          unit: string
          notes?: string | null
          image_url?: string | null
          user_id: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          expiry_date?: string
          added_date?: string
          barcode?: string | null
          quantity?: number
          unit?: string
          notes?: string | null
          image_url?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          type: string
          message: string
          item_id: string | null
          user_id: string
          read: boolean
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          message: string
          item_id?: string | null
          user_id: string
          read?: boolean
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          message?: string
          item_id?: string | null
          user_id?: string
          read?: boolean
          date?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          notification_enabled: boolean
          expiry_warning_days: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          notification_enabled?: boolean
          expiry_warning_days?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          notification_enabled?: boolean
          expiry_warning_days?: number
          created_at?: string
          updated_at?: string | null
        }
      }
    }
  }
}
