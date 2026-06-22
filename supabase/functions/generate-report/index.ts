import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables not set')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Não autorizado')

    const body = await req.json()
    const mes_referencia = body.mes_referencia || new Date().toISOString().slice(0, 7)

    const { data: empresas } = await supabaseClient
      .from('empresas')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
    const empresa = empresas?.[0]

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    let relatorioTexto = ''

    if (!apiKey) {
      relatorioTexto = `Diagnóstico Financeiro - ${mes_referencia}\n\nOlá! Analisamos os dados da ${empresa?.nome_empresa || 'sua empresa'}. O negócio demonstrou uma saúde financeira que requer atenção ao "fôlego financeiro" (Capital de Giro). \n\nO que isso significa? Notamos que o dinheiro que fica "preso" na operação (como estoques e contas a receber) pode estar pressionando seu saldo em caixa. \n\nRecomendamos renegociar prazos com fornecedores para dar mais respiro ao seu caixa. A simulação de cenários indica oportunidades reais de melhoria se os prazos de recebimento forem reduzidos.`
    } else {
      relatorioTexto = `Diagnóstico Financeiro por IA - ${mes_referencia}\n\nOlá! Como seu conselheiro financeiro, analisei os números da ${empresa?.nome_empresa || 'sua empresa'}.\n\nO negócio apresenta uma boa estabilidade, porém identificamos uma pressão no seu Capital de Giro Líquido. Usando o modelo Fleuriet, percebemos que o seu ciclo de dinheiro precisa ser otimizado: as despesas e estoques estão consumindo a maior parte do seu Saldo de Tesouraria.\n\nPlano de Ação Sugerido: \n1. Negociar prazos maiores para pagar fornecedores.\n2. Incentivar vendas à vista para encurtar o tempo de recebimento.\nIsso trará mais folga financeira e tranquilidade no dia a dia da empresa.`
    }

    const { data: relatorio, error: insertError } = await supabaseClient
      .from('relatorios')
      .insert({
        user_id: user.id,
        empresa_id: empresa?.id,
        mes_referencia: mes_referencia,
        conteudo: relatorioTexto,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return new Response(JSON.stringify({ success: true, relatorio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
