import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { encodeBase64 } from 'jsr:@std/encoding/base64'

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
    const { documentUrl, fileName, documentText } = await req.json()

    if (!documentUrl && !documentText) {
      return new Response(JSON.stringify({ error: 'documentUrl or documentText is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

    if (!apiKey) {
      console.warn(
        'ANTHROPIC_API_KEY não configurada. Retornando dados extraídos vazios ou simulados para evitar quebrar a UI de erro.',
      )
      const analysis = {
        summary: 'Atenção: Chave de IA não configurada. Não foi possível extrair dados.',
        extracted_data: {},
      }
      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let fileContentBase64 = ''
    let mediaType = 'application/pdf'
    let isText = false
    let textContent = documentText || ''

    if (documentUrl) {
      const response = await fetch(documentUrl)
      if (!response.ok) throw new Error('Falha ao baixar documento do Storage')
      const arrayBuffer = await response.arrayBuffer()

      const ext = fileName?.split('.').pop()?.toLowerCase()
      if (ext === 'csv' || ext === 'txt') {
        isText = true
        textContent = new TextDecoder().decode(arrayBuffer)
      } else if (ext === 'png' || ext === 'jpeg' || ext === 'jpg') {
        const uint8Array = new Uint8Array(arrayBuffer)
        fileContentBase64 = encodeBase64(uint8Array)
        mediaType = ext === 'png' ? 'image/png' : 'image/jpeg'
      } else {
        const uint8Array = new Uint8Array(arrayBuffer)
        fileContentBase64 = encodeBase64(uint8Array)
        mediaType = 'application/pdf'
      }
    }

    const content: any[] = []

    if (fileContentBase64) {
      if (mediaType.startsWith('image/')) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: fileContentBase64 },
        })
      } else if (mediaType === 'application/pdf') {
        content.push({
          type: 'document',
          source: { type: 'base64', media_type: mediaType, data: fileContentBase64 },
        })
      }
    }

    if (textContent) {
      content.push({
        type: 'text',
        text: `Conteúdo extraído:\n${textContent.slice(0, 50000)}`,
      })
    }

    content.push({
      type: 'text',
      text: `Você é um analista financeiro sênior. Analise este documento contábil/financeiro (DRE, Balanço ou DFC) e extraia os dados solicitados abaixo em formato JSON estrito, sem nenhum texto adicional antes ou depois.
Importante para o Modelo Fleuriet: Identifique com precisão o "ativo_circulante_operacional" (ex: Contas a Receber, Estoques) e o "passivo_circulante_operacional" (ex: Fornecedores, Impostos/Salários a Pagar).
Escreva também um "summary" em linguagem de negócios amigável ao empreendedor (sem jargão contábil complexo), resumindo o que o documento representa e se parece saudável.
Use chaves nulas (null) para campos numéricos não encontrados.

Formato esperado do JSON:
{
  "summary": "string",
  "extracted_data": {
    "receita_bruta": number | null,
    "receita_liquida": number | null,
    "cmv": number | null,
    "despesas_operacionais": number | null,
    "depreciacao_amortizacao": number | null,
    "lucro_operacional": number | null,
    "lucro_liquido": number | null,
    "ativo_circulante": number | null,
    "ativo_nao_circulante": number | null,
    "ativo_total": number | null,
    "passivo_circulante": number | null,
    "passivo_nao_circulante": number | null,
    "passivo_total": number | null,
    "patrimonio_liquido": number | null,
    "estoques": number | null,
    "contas_a_receber": number | null,
    "fornecedores": number | null,
    "ativo_circulante_operacional": number | null,
    "passivo_circulante_operacional": number | null,
    "fluxo_operacional": number | null,
    "fluxo_investimento": number | null,
    "fluxo_financiamento": number | null,
    "saldo_inicial": number | null,
    "saldo_final": number | null,
    "impostos_mensal": number | null,
    "salarios_mensal": number | null,
    "aluguel_mensal": number | null,
    "outras_despesas_fixas_mensal": number | null,
    "despesas_variaveis_mensal": number | null
  }
}`,
    })

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content }],
      }),
    })

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text()
      throw new Error(`Anthropic API error: ${errText}`)
    }

    const result = await anthropicResponse.json()
    const textOutput = result.content[0].text

    let parsed: any = {}
    try {
      const jsonMatch = textOutput.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(textOutput)
      }
    } catch (e) {
      console.error('Falha ao parsear JSON:', textOutput)
    }

    const analysis = {
      summary:
        parsed.summary ||
        'Dados extraídos do documento com sucesso. O documento está em processo de classificação.',
      extracted_data: parsed.extracted_data || parsed,
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
