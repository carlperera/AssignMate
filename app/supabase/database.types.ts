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
      project: {
        Row: {
          created_at: string | null
          proj_desc: string | null
          proj_id: string
          proj_name: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          proj_desc?: string | null
          proj_id?: string
          proj_name: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          proj_desc?: string | null
          proj_id?: string
          proj_name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },
        ]
      }
      project_task_status: {
        Row: {
          created_at: string
          proj_id: string | null
          proj_status_desc: string | null
          proj_status_name: string
          proj_status_order: number
          project_task_status_id: string
        }
        Insert: {
          created_at?: string
          proj_id?: string | null
          proj_status_desc?: string | null
          proj_status_name: string
          proj_status_order: number
          project_task_status_id?: string
        }
        Update: {
          created_at?: string
          proj_id?: string | null
          proj_status_desc?: string | null
          proj_status_name?: string
          proj_status_order?: number
          project_task_status_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_status_proj_id_fkey"
            columns: ["proj_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["proj_id"]
          },
        ]
      }
      task: {
        Row: {
          created_at: string
          proj_id: string | null
          task_assignee_id: string | null
          task_deadline: string | null
          task_desc: string
          task_id: string
          task_name: string
          task_priority: Database["public"]["Enums"]["task_priority "] | null
          task_status: string | null
          task_team_id: string | null
        }
        Insert: {
          created_at?: string
          proj_id?: string | null
          task_assignee_id?: string | null
          task_deadline?: string | null
          task_desc: string
          task_id?: string
          task_name: string
          task_priority?: Database["public"]["Enums"]["task_priority "] | null
          task_status?: string | null
          task_team_id?: string | null
        }
        Update: {
          created_at?: string
          proj_id?: string | null
          task_assignee_id?: string | null
          task_deadline?: string | null
          task_desc?: string
          task_id?: string
          task_name?: string
          task_priority?: Database["public"]["Enums"]["task_priority "] | null
          task_status?: string | null
          task_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_proj_id_fkey"
            columns: ["proj_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["proj_id"]
          },
          {
            foreignKeyName: "task_task_assignee_id_task_team_id_fkey"
            columns: ["task_assignee_id", "task_team_id"]
            isOneToOne: false
            referencedRelation: "user_team"
            referencedColumns: ["user_id", "team_id"]
          },
          {
            foreignKeyName: "task_task_status_fkey"
            columns: ["task_status"]
            isOneToOne: false
            referencedRelation: "project_task_status"
            referencedColumns: ["project_task_status_id"]
          },
        ]
      }
      task_log: {
        Row: {
          created_at: string
          task_id: string | null
          task_log_end: string | null
          task_log_id: string
          task_log_start: string | null
          task_log_team: string | null
          task_log_user: string | null
        }
        Insert: {
          created_at?: string
          task_id?: string | null
          task_log_end?: string | null
          task_log_id?: string
          task_log_start?: string | null
          task_log_team?: string | null
          task_log_user?: string | null
        }
        Update: {
          created_at?: string
          task_id?: string | null
          task_log_end?: string | null
          task_log_id?: string
          task_log_start?: string | null
          task_log_team?: string | null
          task_log_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_log_task_log_user_task_log_team_fkey"
            columns: ["task_log_user", "task_log_team"]
            isOneToOne: false
            referencedRelation: "user_team"
            referencedColumns: ["user_id", "team_id"]
          },
        ]
      }
      team: {
        Row: {
          created_at: string
          team_desc: string | null
          team_id: string
          team_name: string
        }
        Insert: {
          created_at?: string
          team_desc?: string | null
          team_id?: string
          team_name: string
        }
        Update: {
          created_at?: string
          team_desc?: string | null
          team_id?: string
          team_name?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string | null
          user_fname: string
          user_id: string
          user_lname: string | null
          user_username: string
        }
        Insert: {
          created_at?: string | null
          user_fname: string
          user_id?: string
          user_lname?: string | null
          user_username: string
        }
        Update: {
          created_at?: string | null
          user_fname?: string
          user_id?: string
          user_lname?: string | null
          user_username?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_team: {
        Row: {
          created_at: string
          team_id: string
          user_id: string
          user_team_role: Database["public"]["Enums"]["user_team_role"]
        }
        Insert: {
          created_at?: string
          team_id: string
          user_id: string
          user_team_role?: Database["public"]["Enums"]["user_team_role"]
        }
        Update: {
          created_at?: string
          team_id?: string
          user_id?: string
          user_team_role?: Database["public"]["Enums"]["user_team_role"]
        }
        Relationships: [
          {
            foreignKeyName: "user_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["team_id"]
          },
          {
            foreignKeyName: "user_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_team_and_add_user: {
        Args: {
          p_team_name: string
          p_user_id: string
          p_user_role: string
        }
        Returns: {
          team_id: string
        }[]
      }
    }
    Enums: {
      "task_priority ": "low" | "normal" | "high" | "critical"
      user_team_role: "admin" | "member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
