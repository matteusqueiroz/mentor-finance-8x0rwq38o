import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoneyField } from '@/components/MoneyField'
import {
  useOnboardingStore,
  onboardingActions,
  Demonstrativos,
} from '@/stores/use-onboarding-store'
import { useAuth } from '@/hooks/use-auth'
import { saveDiagnostico } from '@/services/db'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Upload() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState<'upload' | 'processing' | 'validation'>('upload')
  const [isSaving, setIsSaving] = useState(false)
  const [docId, setDocId] = useState<string | null>(null)
  const [rawAnalysis, setRawAnalysis] = useState<any>(null)
  const [empresaData, setEmpresaData] = useState<{
    faturamento_anual: number | null
    impostos_mensal: number | null
    salarios_mensal: number | null
    aluguel_mensal: number | null
    outras_despesas_fixas_mensal: number | null
    despesas_variaveis_mensal: number | null
  }>({
    faturamento_anual: null,
    impostos_mensal: null,
    salarios_mensal: null,
    aluguel_mensal: null,
    outras_despesas_fixas_mensal: null,
    despesas_variaveis_mensal: null,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setStep('processing')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath)

      // 2. Insert DB record
      const { data: docRecord, error: dbError } = await supabase
        .from('documentos_contabeis')
        .insert({
          user_id: user.id,
          nome_arquivo: file.name,
          url_arquivo: publicUrlData.publicUrl,
          tipo_documento: file.type,
          status: 'pendente',
        })
        .select()
        .single()

      if (dbError) throw dbError

      // 3. Analyze document via Edge Function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: {
            documentUrl: publicUrlData.publicUrl,
            fileName: file.name,
            documentId: docRecord.id,
          },
        },
      )

      if (analysisError) {
        await supabase
          .from('documentos_contabeis')
          .update({ status: 'erro' })
          .eq('id', docRecord.id)
        throw analysisError
      }

      setDocId(docRecord.id)
      setRawAnalysis(analysisData?.analysis)

      const extracted = analysisData?.analysis?.extracted_data || {}

      setEmpresaData({
        faturamento_anual: extracted.faturamento_anual || extracted.receita_bruta || null,
        impostos_mensal: extracted.impostos_mensal || null,
        salarios_mensal: extracted.salarios_mensal || null,
        aluguel_mensal: extracted.aluguel_mensal || null,
        outras_despesas_fixas_mensal: extracted.outras_despesas_fixas_mensal || null,
        despesas_variaveis_mensal: extracted.despesas_variaveis_mensal || null,
      })

      onboardingActions.preencherDeExtracao({
        dre: {
          receitaBruta: extracted.receita_bruta || null,
          receitaLiquida: extracted.receita_liquida || null,
          cmv: extracted.cmv || null,
          despesasOperacionais: extracted.despesas_operacionais || null,
          depreciacaoAmortizacao: extracted.depreciacao_amortizacao || null,
          lucroOperacional: extracted.lucro_operacional || null,
          lucroLiquido: extracted.lucro_liquido || null,
        },
        balanco: {
          ativoCirculante: extracted.ativo_circulante || null,
          ativoNaoCirculante: extracted.ativo_nao_circulante || null,
          ativoTotal: extracted.ativo_total || null,
          passivoCirculante: extracted.passivo_circulante || null,
          passivoNaoCirculante: extracted.passivo_nao_circulante || null,
          passivoTotal: extracted.passivo_total || null,
          patrimonioLiquido: extracted.patrimonio_liquido || null,
          estoques: extracted.estoques || null,
          contasAReceber: extracted.contas_a_receber || null,
          fornecedores: extracted.fornecedores || null,
        },
        dfc: {
          fluxoOperacional: extracted.fluxo_operacional || null,
          fluxoInvestimento: extracted.fluxo_investimento || null,
          fluxoFinanciamento: extracted.fluxo_financiamento || null,
          saldoInicial: extracted.saldo_inicial || null,
          saldoFinal: extracted.saldo_final || null,
        },
      } as Demonstrativos)

      setStep('validation')
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao processar o arquivo.',
        variant: 'destructive',
      })
      setStep('upload')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirm = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await saveDiagnostico(user.id, 'Empresa (Upload)', demonstrativos)

      const { data: existingEmpresas } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(1)

      if (existingEmpresas && existingEmpresas.length > 0) {
        await supabase.from('empresas').update(empresaData).eq('id', existingEmpresas[0].id)
      } else {
        await supabase.from('empresas').insert({
          user_id: user.id,
          nome_empresa: 'Empresa (Upload)',
          ...empresaData,
        })
      }

      if (docId) {
        await supabase
          .from('documentos_contabeis')
          .update({
            status: 'processado',
            analise_ia: { ...rawAnalysis, verified_data: empresaData },
          })
          .eq('id', docId)
      }

      onboardingActions.setOrigemConfiabilidade('extraido')
      navigate('/diagnostico')
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Upload de Documento
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Deixe a IA extrair os números para você.
        </p>
      </div>

      {step === 'upload' && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div
              className="w-full max-w-lg border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.xlsx,.xls,.csv"
              />
              <UploadCloud className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
                Clique para fazer upload ou arraste arquivos aqui
              </h3>
              <p className="text-sm text-slate-500">
                Formatos suportados: PDF, Excel, CSV (Máx. 25MB)
              </p>
              <Button
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={triggerFileInput}
              >
                Buscar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-20 flex flex-col items-center text-center animate-pulse">
            <FileText className="h-16 w-16 text-blue-500 mb-6" />
            <h3 className="text-xl font-medium text-slate-800 dark:text-slate-200 mb-2">
              A IA está processando seu documento...
            </h3>
            <p className="text-slate-500">
              Isolando e interpretando os dados. Isso leva apenas alguns segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'validation' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Validação Humana Obrigatória</h4>
              <p className="text-sm mt-1">
                Por favor, revise os dados extraídos pela IA. Corrija os valores incorretos e
                preencha os campos faltantes antes de prosseguir.
              </p>
            </div>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Campos Extraídos</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Revise os principais dados encontrados no documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Faturamento Anual"
                value={empresaData.faturamento_anual}
                onChange={(v: number | null) =>
                  setEmpresaData((p) => ({ ...p, faturamento_anual: v }))
                }
              />
              <MoneyField
                label="Impostos (Mensal)"
                value={empresaData.impostos_mensal}
                onChange={(v: number | null) =>
                  setEmpresaData((p) => ({ ...p, impostos_mensal: v }))
                }
              />
              <MoneyField
                label="Salários (Mensal)"
                value={empresaData.salarios_mensal}
                onChange={(v: number | null) =>
                  setEmpresaData((p) => ({ ...p, salarios_mensal: v }))
                }
              />
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Detalhes Operacionais
                </h4>
                <MoneyField
                  label="Aluguel (Mensal)"
                  value={empresaData.aluguel_mensal}
                  onChange={(v: number | null) =>
                    setEmpresaData((p) => ({ ...p, aluguel_mensal: v }))
                  }
                />
                <MoneyField
                  label="Despesas Variáveis (Mensal)"
                  value={empresaData.despesas_variaveis_mensal}
                  onChange={(v: number | null) =>
                    setEmpresaData((p) => ({ ...p, despesas_variaveis_mensal: v }))
                  }
                />
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Demonstrativos (Opcional)
                </h4>
                <MoneyField
                  label="Receita Líquida (DRE)"
                  value={demonstrativos.dre.receitaLiquida}
                  onChange={(v: number | null) =>
                    onboardingActions.atualizarDRE({ receitaLiquida: v })
                  }
                />
                <MoneyField
                  label="Lucro Líquido (DRE)"
                  value={demonstrativos.dre.lucroLiquido}
                  onChange={(v: number | null) =>
                    onboardingActions.atualizarDRE({ lucroLiquido: v })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setStep('upload')}
            >
              Refazer Upload
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Confirmar Dados'}{' '}
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
