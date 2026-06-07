export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      exchange_rates: {
        Row: {
          aud: number | null
          base_currency: string
          eur: number | null
          fetched_at: string | null
          jpy: number | null
          usd: number | null
        }
        Insert: {
          aud?: number | null
          base_currency?: string
          eur?: number | null
          fetched_at?: string | null
          jpy?: number | null
          usd?: number | null
        }
        Update: {
          aud?: number | null
          base_currency?: string
          eur?: number | null
          fetched_at?: string | null
          jpy?: number | null
          usd?: number | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          contact: string | null
          description: string | null
          email: string | null
          google_search: string | null
          id: number
          industry: string | null
          kakaoid: string | null
          location: string[] | null
          Promoted: boolean | null
          Source: string | null
          title: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          contact?: string | null
          description?: string | null
          email?: string | null
          google_search?: string | null
          id?: never
          industry?: string | null
          kakaoid?: string | null
          location?: string[] | null
          Promoted?: boolean | null
          Source?: string | null
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact?: string | null
          description?: string | null
          email?: string | null
          google_search?: string | null
          id?: never
          industry?: string | null
          kakaoid?: string | null
          location?: string[] | null
          Promoted?: boolean | null
          Source?: string | null
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      jobs_archive: {
        Row: {
          contact: string | null
          description: string | null
          email: string | null
          google_search: string | null
          id: number
          industry: string | null
          kakaoid: string | null
          location: string[] | null
          Promoted: boolean | null
          Source: string | null
          title: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          contact?: string | null
          description?: string | null
          email?: string | null
          google_search?: string | null
          id?: never
          industry?: string | null
          kakaoid?: string | null
          location?: string[] | null
          Promoted?: boolean | null
          Source?: string | null
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          contact?: string | null
          description?: string | null
          email?: string | null
          google_search?: string | null
          id?: never
          industry?: string | null
          kakaoid?: string | null
          location?: string[] | null
          Promoted?: boolean | null
          Source?: string | null
          title?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      hojunara_realestate_share: {
        Row: {
          category: string | null
          contact_number: string | null
          description: string | null
          enquiry_email: string | null
          gender_restriction: string | null
          image_url: string | null
          notice_id: string
          post_photo: string[] | null
          price: number | null
          private_bathroom: boolean | null
          private_room: boolean | null
          state_location: string | null
          sub_category: string | null
          suburb: string | null
          time_posted: string | null
          title: string | null
          uploaded_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          contact_number?: string | null
          description?: string | null
          enquiry_email?: string | null
          gender_restriction?: string | null
          image_url?: string | null
          notice_id: string
          post_photo?: string[] | null
          price?: number | null
          private_bathroom?: boolean | null
          private_room?: boolean | null
          state_location?: string | null
          sub_category?: string | null
          suburb?: string | null
          time_posted?: string | null
          title?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          contact_number?: string | null
          description?: string | null
          enquiry_email?: string | null
          gender_restriction?: string | null
          image_url?: string | null
          notice_id?: string
          post_photo?: string[] | null
          price?: number | null
          private_bathroom?: boolean | null
          private_room?: boolean | null
          state_location?: string | null
          sub_category?: string | null
          suburb?: string | null
          time_posted?: string | null
          title?: string | null
          uploaded_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      ozbargain_deals: {
        Row: {
          category: string
          description: string | null
          external_url: string | null
          id: number
          image_url: string | null
          promoted: boolean
          promo_codes: Json
          rank: number
          teaser_description: string | null
          title: string
          uploaded_at: string
        }
        Insert: {
          category: string
          description?: string | null
          external_url?: string | null
          id?: number
          image_url?: string | null
          promoted?: boolean
          promo_codes?: Json
          rank: number
          teaser_description?: string | null
          title: string
          uploaded_at: string
        }
        Update: {
          category?: string
          description?: string | null
          external_url?: string | null
          id?: number
          image_url?: string | null
          promoted?: boolean
          promo_codes?: Json
          rank?: number
          teaser_description?: string | null
          title?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      sales_deals: {
        Row: {
          comments_count: number
          created_at: string
          deal_url: string
          delivery_ko: string | null
          description_ko: string[]
          id: string
          image_url: string | null
          is_active: boolean
          original_price: string | null
          posted_at: string | null
          posted_by: string | null
          price: string
          promo_code: string | null
          product_type_ko: string
          retailer: string
          retailer_domain: string
          retailer_url: string | null
          score: number
          source_node_id: number | null
          source_url: string
          title_ko: string
          updated_at: string
        }
        Insert: {
          comments_count?: number
          created_at?: string
          deal_url: string
          delivery_ko?: string | null
          description_ko?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          original_price?: string | null
          posted_at?: string | null
          posted_by?: string | null
          price: string
          promo_code?: string | null
          product_type_ko?: string
          retailer: string
          retailer_domain: string
          retailer_url?: string | null
          score?: number
          source_node_id?: number | null
          source_url: string
          title_ko: string
          updated_at?: string
        }
        Update: {
          comments_count?: number
          created_at?: string
          deal_url?: string
          delivery_ko?: string | null
          description_ko?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          original_price?: string | null
          posted_at?: string | null
          posted_by?: string | null
          price?: string
          promo_code?: string | null
          product_type_ko?: string
          retailer?: string
          retailer_domain?: string
          retailer_url?: string | null
          score?: number
          source_node_id?: number | null
          source_url?: string
          title_ko?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      view_counts: {
        Row: {
          count: number
          id: string
          job_id: number
          updated_at: string
        }
        Insert: {
          count?: number
          id?: string
          job_id: number
          updated_at?: string
        }
        Update: {
          count?: number
          id?: string
          job_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_view_counts_job_id"
            columns: ["job_id"]
            isOneToOne: true
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["app_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment_view_count:
        | {
            Args: { p_job_id: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.increment_view_count(p_job_id => int8), public.increment_view_count(p_job_id => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { p_job_id: number }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.increment_view_count(p_job_id => int8), public.increment_view_count(p_job_id => int4). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      map_location_to_region: { Args: { suburbs: string[] }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
