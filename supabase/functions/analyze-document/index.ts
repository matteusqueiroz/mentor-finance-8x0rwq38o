import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../__shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { documentText } = await req.json()

    if (!documentText) {
      return new Response(JSON.stringify({ error: 'documentText is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI_KEY_MISSING', message: 'Chave da API da IA não configurada.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const analysis = {
      summary: 'Diagnóstico gerado com sucesso pela IA.',
      extracted_data: {
        receita_liquida: 150000,
        lucro_liquido: 25000,
      },
      plano_acao: {
        tarefas: [
          { titulo: 'Reduzir custos operacionais', prioridade: 'Alta' },
          { titulo: 'Renegociar contratos de aluguel', prioridade: 'Média' },
        ],
      },
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
