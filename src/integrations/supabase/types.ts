export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      carbon_footprint_data: {
        Row: {
          carbon_per_kg: number
          category: string
          created_at: string
          id: string
        }
        Insert: {
          carbon_per_kg: number
          category: string
          created_at?: string
          id?: string
        }
        Update: {
          carbon_per_kg?: number
          category?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      food_items: {
        Row: {
          added_date: string
          barcode: string | null
          category: string
          created_at: string
          expiry_date: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          quantity: number
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          added_date: string
          barcode?: string | null
          category: string
          created_at?: string
          expiry_date: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          quantity: number
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          added_date?: string
          barcode?: string | null
          category?: string
          created_at?: string
          expiry_date?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          quantity?: number
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          date: string
          id: string
          item_id: string | null
          message: string
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          item_id?: string | null
          message: string
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          item_id?: string | null
          message?: string
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          expiry_warning_days: number
          id: string
          notification_enabled: boolean
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expiry_warning_days?: number
          id?: string
          notification_enabled?: boolean
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expiry_warning_days?: number
          id?: string
          notification_enabled?: boolean
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waste_goals: {
        Row: {
          created_at: string
          current_value: number | null
          end_date: string | null
          goal_type: string
          id: string
          is_active: boolean
          start_date: string
          target_period: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_period?: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          end_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_period?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waste_log: {
        Row: {
          carbon_footprint_kg: number | null
          category: string
          created_at: string
          disposal_date: string
          disposal_type: string
          estimated_cost: number | null
          expiry_date: string
          food_item_id: string | null
          id: string
          item_name: string
          quantity: number
          reason: string | null
          unit: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          carbon_footprint_kg?: number | null
          category: string
          created_at?: string
          disposal_date?: string
          disposal_type: string
          estimated_cost?: number | null
          expiry_date: string
          food_item_id?: string | null
          id?: string
          item_name: string
          quantity: number
          reason?: string | null
          unit: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          carbon_footprint_kg?: number | null
          category?: string
          created_at?: string
          disposal_date?: string
          disposal_type?: string
          estimated_cost?: number | null
          expiry_date?: string
          food_item_id?: string | null
          id?: string
          item_name?: string
          quantity?: number
          reason?: string | null
          unit?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waste_log_food_item_id_fkey"
            columns: ["food_item_id"]
            isOneToOne: false
            referencedRelation: "food_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clean_old_deleted_items: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
