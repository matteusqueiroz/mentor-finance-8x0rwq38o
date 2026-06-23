import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentId, filePath } = await req.json()

    // Simulate AI extraction and network latency
    await new Promise((r) => setTimeout(r, 2000))

    if (filePath?.includes('error')) {
      throw new Error('Falha ao analisar o documento.')
    }

    // Mock response for immediate populating in the UI
    const extractedData = {
      nome_empresa: 'Empresa Analisada IA Ltda',
      setor: 'Tecnologia',
      regime_tributario: 'simples',
      num_funcionarios: '6-20',
      anos_operacao: 3,
      tipo_clientes: 'B2B',
      faturamento_anual: 1500000,
      custo_direto_anual: 300000,
      salarios_mensal: 45000,
      impostos_mensal: 12500,
      aluguel_mensal: 8000,
      despesas_variaveis_mensal: 5000,
      outras_despesas_fixas_mensal: 3000,
      comportamento_faturamento: 'crescente',
      resultado_mes_passado: 'lucro',
      resultado_mes_passado_valor: 15000,
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
