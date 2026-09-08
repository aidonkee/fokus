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
      schools: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      classes: {
        Row: {
          id: string
          school_id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          class_id: string
          url: string
          type: 'group' | 'single'
          created_at: string
        }
        Insert: {
          id?: string
          class_id: string
          url: string
          type: 'group' | 'single'
          created_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          url?: string
          type?: 'group' | 'single'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
