// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
      acompanhamentos: {
        Row: {
          analise_ia: Json | null
          criado_em: string | null
          diagnostico_id: string
          empresa_id: string
          faturamento_realizado: number | null
          id: string
          mes_referencia: string
          observacoes: string | null
          principais_desvios: string | null
          resultado_mes: string | null
          resultado_valor: number | null
          user_id: string
        }
        Insert: {
          analise_ia?: Json | null
          criado_em?: string | null
          diagnostico_id: string
          empresa_id: string
          faturamento_realizado?: number | null
          id?: string
          mes_referencia: string
          observacoes?: string | null
          principais_desvios?: string | null
          resultado_mes?: string | null
          resultado_valor?: number | null
          user_id: string
        }
        Update: {
          analise_ia?: Json | null
          criado_em?: string | null
          diagnostico_id?: string
          empresa_id?: string
          faturamento_realizado?: number | null
          id?: string
          mes_referencia?: string
          observacoes?: string | null
          principais_desvios?: string | null
          resultado_mes?: string | null
          resultado_valor?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "acompanhamentos_diagnostico_id_fkey"
            columns: ["diagnostico_id"]
            isOneToOne: false
            referencedRelation: "diagnosticos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "acompanhamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      assinaturas: {
        Row: {
          criado_em: string | null
          id: string
          plano: string
          status: string
          user_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          plano?: string
          status?: string
          user_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          plano?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      diagnosticos: {
        Row: {
          criado_em: string | null
          dados: Json
          empresa_id: string
          id: string
          plano_acao: Json | null
          user_id: string
        }
        Insert: {
          criado_em?: string | null
          dados: Json
          empresa_id: string
          id?: string
          plano_acao?: Json | null
          user_id: string
        }
        Update: {
          criado_em?: string | null
          dados?: Json
          empresa_id?: string
          id?: string
          plano_acao?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnosticos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          aluguel_mensal: number | null
          anos_operacao: number | null
          comportamento_faturamento: string | null
          criado_em: string | null
          custo_direto_anual: number | null
          despesas_variaveis_mensal: number | null
          dores_principais: string[] | null
          faturamento_anual: number | null
          id: string
          impostos_mensal: number | null
          nome_empresa: string
          num_funcionarios: string | null
          outras_despesas_fixas_mensal: number | null
          regime_tributario: string | null
          resultado_mes_passado: string | null
          resultado_mes_passado_valor: number | null
          salarios_mensal: number | null
          saude_percebida: string | null
          setor: string | null
          tem_controle: string | null
          tipo_clientes: string | null
          user_id: string
        }
        Insert: {
          aluguel_mensal?: number | null
          anos_operacao?: number | null
          comportamento_faturamento?: string | null
          criado_em?: string | null
          custo_direto_anual?: number | null
          despesas_variaveis_mensal?: number | null
          dores_principais?: string[] | null
          faturamento_anual?: number | null
          id?: string
          impostos_mensal?: number | null
          nome_empresa: string
          num_funcionarios?: string | null
          outras_despesas_fixas_mensal?: number | null
          regime_tributario?: string | null
          resultado_mes_passado?: string | null
          resultado_mes_passado_valor?: number | null
          salarios_mensal?: number | null
          saude_percebida?: string | null
          setor?: string | null
          tem_controle?: string | null
          tipo_clientes?: string | null
          user_id: string
        }
        Update: {
          aluguel_mensal?: number | null
          anos_operacao?: number | null
          comportamento_faturamento?: string | null
          criado_em?: string | null
          custo_direto_anual?: number | null
          despesas_variaveis_mensal?: number | null
          dores_principais?: string[] | null
          faturamento_anual?: number | null
          id?: string
          impostos_mensal?: number | null
          nome_empresa?: string
          num_funcionarios?: string | null
          outras_despesas_fixas_mensal?: number | null
          regime_tributario?: string | null
          resultado_mes_passado?: string | null
          resultado_mes_passado_valor?: number | null
          salarios_mensal?: number | null
          saude_percebida?: string | null
          setor?: string | null
          tem_controle?: string | null
          tipo_clientes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      valuations: {
        Row: {
          criado_em: string | null
          diagnostico_id: string | null
          empresa_id: string | null
          id: string
          premissas: Json
          resultado: Json
          user_id: string
        }
        Insert: {
          criado_em?: string | null
          diagnostico_id?: string | null
          empresa_id?: string | null
          id?: string
          premissas: Json
          resultado: Json
          user_id: string
        }
        Update: {
          criado_em?: string | null
          diagnostico_id?: string | null
          empresa_id?: string | null
          id?: string
          premissas?: Json
          resultado?: Json
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const

