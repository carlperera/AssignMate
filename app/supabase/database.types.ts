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
          team_id: string
        }
        Insert: {
          created_at?: string | null
          proj_desc?: string | null
          proj_id?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          proj_desc?: string | null
          proj_id?: string
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
      sprint: {
        Row: {
          created_at: string
          proj_id: string | null
          sprint_id: string
        }
        Insert: {
          created_at?: string
          proj_id?: string | null
          sprint_id?: string
        }
        Update: {
          created_at?: string
          proj_id?: string | null
          sprint_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sprint_proj_id_fkey"
            columns: ["proj_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["proj_id"]
          },
        ]
      }
      task: {
        Row: {
          blocker_task_ids: string[] | null
          created_at: string
          parent_task_id: string | null
          proj_id: string | null
          sprint_id: string | null
          taks_assignees_list: string[] | null
          task_assignees: Json | null
          task_deadline: string | null
          task_desc: string | null
          task_id: string
          task_status: Database["public"]["Enums"]["task_status"] | null
        }
        Insert: {
          blocker_task_ids?: string[] | null
          created_at?: string
          parent_task_id?: string | null
          proj_id?: string | null
          sprint_id?: string | null
          taks_assignees_list?: string[] | null
          task_assignees?: Json | null
          task_deadline?: string | null
          task_desc?: string | null
          task_id?: string
          task_status?: Database["public"]["Enums"]["task_status"] | null
        }
        Update: {
          blocker_task_ids?: string[] | null
          created_at?: string
          parent_task_id?: string | null
          proj_id?: string | null
          sprint_id?: string | null
          taks_assignees_list?: string[] | null
          task_assignees?: Json | null
          task_deadline?: string | null
          task_desc?: string | null
          task_id?: string
          task_status?: Database["public"]["Enums"]["task_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "task_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "task"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_proj_id_fkey"
            columns: ["proj_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["proj_id"]
          },
          {
            foreignKeyName: "task_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprint"
            referencedColumns: ["sprint_id"]
          },
        ]
      }
      team: {
        Row: {
          created_at: string
          team_id: string
        }
        Insert: {
          created_at?: string
          team_id?: string
        }
        Update: {
          created_at?: string
          team_id?: string
        }
        Relationships: []
      }
      user: {
        Row: {
          created_at: string | null
          user_fname: string
          user_id: string
          user_lname: string | null
        }
        Insert: {
          created_at?: string | null
          user_fname: string
          user_id?: string
          user_lname?: string | null
        }
        Update: {
          created_at?: string | null
          user_fname?: string
          user_id?: string
          user_lname?: string | null
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
          team_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          team_id?: string | null
          user_id?: string
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
            isOneToOne: true
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
      [_ in never]: never
    }
    Enums: {
      "task_priority ": "low" | "normal" | "high" | "critical"
      task_status: "doing" | "blocked" | "done"
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
