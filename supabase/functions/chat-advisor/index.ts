import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
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
    const { messages, companyContext } = await req.json()

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''

    let reply = `Como seu consultor financeiro e legal, analisando sua empresa do setor de ${companyContext?.setor || 'serviços'}, recomendo sempre mantermos os documentos contábeis em dia. Como posso detalhar mais isso para você?`

    if (
      lastMessage.includes('imposto') ||
      lastMessage.includes('tributo') ||
      lastMessage.includes('fiscal')
    ) {
      reply = `Sobre questões fiscais, considerando que seu regime tributário é ${companyContext?.regime_tributario || 'o configurado'}, é essencial revisar as alíquotas aplicadas. Recomendo digitalizar suas últimas guias de impostos na aba "Scanner de Documentos" para uma análise mais profunda.`
    } else if (
      lastMessage.includes('contrato') ||
      lastMessage.includes('jurídico') ||
      lastMessage.includes('lei')
    ) {
      reply = `Em relação a contratos e aspectos jurídicos, é importante garantir que as cláusulas protejam o caixa da empresa. Você possui algum contrato recente de fornecedores ou clientes? Faça o upload na aba de documentos para extrairmos os pontos críticos.`
    } else if (
      lastMessage.includes('caixa') ||
      lastMessage.includes('financeiro') ||
      lastMessage.includes('lucro')
    ) {
      reply = `Para otimizar o financeiro e o fluxo de caixa, as dores que você relatou (${companyContext?.dores_principais?.join(', ') || 'sobre gestão'}) mostram que precisamos cortar despesas invisíveis. Recomendo começar enviando os comprovantes de despesas fixas para análise.`
    }

    // Simulate thinking time for more realistic feeling
    await new Promise((resolve) => setTimeout(resolve, 800))

    return new Response(
      JSON.stringify({
        success: true,
        message: reply,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
