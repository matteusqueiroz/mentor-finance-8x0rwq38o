import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../__shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record // Payload provided by Supabase Webhook

    if (!record || !record.empresa_id || !record.url_arquivo) {
      return new Response(JSON.stringify({ error: 'Payload inválido ou incompleto' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Recuperar e-mail da contabilidade
    const { data: empresa } = await supabase
      .from('empresas')
      .select('email_contabilidade')
      .eq('id', record.empresa_id)
      .single()

    if (empresa?.email_contabilidade) {
      console.log(
        `Enviando email para ${empresa.email_contabilidade} com o documento ${record.nome_arquivo} (${record.url_arquivo})`,
      )

      // Aqui integraria a API de e-mail (ex: SendGrid, Resend)
      // Usaremos o log como representação do sucesso

      // Criar notificação para o usuário informando sobre o e-mail
      await supabase.from('notificacoes').insert({
        user_id: record.user_id,
        titulo: 'Documento Encaminhado',
        mensagem: `O documento ${record.nome_arquivo} foi enviado automaticamente para a contabilidade (${empresa.email_contabilidade}).`,
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
