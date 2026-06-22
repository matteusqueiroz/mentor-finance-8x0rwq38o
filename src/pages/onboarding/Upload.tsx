import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { cn } from '@/lib/utils'

type FileStatus = 'pending' | 'uploading' | 'processing' | 'done' | 'error'
type FileItem = {
  id: string
  file: File
  status: FileStatus
  progress: number
  analysis?: any
  error?: string
}

export default function Upload() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState<'upload' | 'processing' | 'validation'>('upload')
  const [isSaving, setIsSaving] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])

  const [empresaData, setEmpresaData] = useState<{
    faturamento_anual: number | null
    impostos_mensal: number | null
    salarios_mensal: number | null
    aluguel_mensal: number | null
    outras_despesas_fixas_mensal: number | null
    despesas_variaveis_mensal: number | null
    fleuriet_cdg: number | null
    fleuriet_nig: number | null
    fleuriet_st: number | null
  }>({
    faturamento_anual: null,
    impostos_mensal: null,
    salarios_mensal: null,
    aluguel_mensal: null,
    outras_despesas_fixas_mensal: null,
    despesas_variaveis_mensal: null,
    fleuriet_cdg: null,
    fleuriet_nig: null,
    fleuriet_st: null,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerFileInput = () => fileInputRef.current?.click()

  const processFile = async (item: FileItem) => {
    try {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'uploading', progress: 20 } : f)),
      )

      const fileExt = item.file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user!.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, item.file)
      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath)

      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'processing', progress: 60 } : f)),
      )

      const { data: docRecord, error: dbError } = await supabase
        .from('documentos_contabeis')
        .insert({
          user_id: user!.id,
          nome_arquivo: item.file.name,
          url_arquivo: publicUrlData.publicUrl,
          tipo_documento: item.file.type,
          status: 'enviado',
        })
        .select()
        .single()

      if (dbError) throw dbError

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: {
            documentUrl: publicUrlData.publicUrl,
            fileName: item.file.name,
            documentId: docRecord.id,
          },
        },
      )

      if (analysisError) throw analysisError

      await supabase
        .from('documentos_contabeis')
        .update({ status: 'processado', analise_ia: analysisData?.analysis })
        .eq('id', docRecord.id)

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'done', progress: 100, analysis: analysisData?.analysis }
            : f,
        ),
      )
    } catch (err: any) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'error', progress: 0, error: err.message } : f,
        ),
      )
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || [])
    if (!selected.length || !user) return

    const newFiles: FileItem[] = selected.map((file) => ({
      id: Math.random().toString(36).substring(2),
      file,
      status: 'pending',
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
    setStep('processing')

    for (const item of newFiles) {
      await processFile(item)
    }
  }

  useEffect(() => {
    if (step === 'processing' && files.length > 0) {
      const allTerminal = files.every((f) => f.status === 'done' || f.status === 'error')
      if (allTerminal) {
        mergeExtractedData()
        setStep('validation')
      }
    }
  }, [files, step])

  const mergeExtractedData = () => {
    let merged: any = {}
    files.forEach((f) => {
      if (f.status === 'done' && f.analysis?.extracted_data) {
        Object.entries(f.analysis.extracted_data).forEach(([k, v]) => {
          if (v !== null && v !== undefined) merged[k] = v
        })
      }
    })

    const ativo_circulante = merged.ativo_circulante || 0
    const passivo_circulante = merged.passivo_circulante || 0
    const ativo_circulante_op =
      merged.ativo_circulante_operacional ||
      (merged.contas_a_receber || 0) + (merged.estoques || 0) ||
      0
    const passivo_circulante_op =
      merged.passivo_circulante_operacional || merged.fornecedores || 0 || 0

    const CDG = ativo_circulante - passivo_circulante
    const NIG = ativo_circulante_op - passivo_circulante_op
    const ST = CDG - NIG

    setEmpresaData({
      faturamento_anual: merged.receita_bruta || merged.faturamento_anual || null,
      impostos_mensal: merged.impostos_mensal || null,
      salarios_mensal: merged.salarios_mensal || null,
      aluguel_mensal: merged.aluguel_mensal || null,
      outras_despesas_fixas_mensal: merged.outras_despesas_fixas_mensal || null,
      despesas_variaveis_mensal: merged.despesas_variaveis_mensal || null,
      fleuriet_cdg: CDG !== 0 ? CDG : null,
      fleuriet_nig: NIG !== 0 ? NIG : null,
      fleuriet_st: ST !== 0 ? ST : null,
    })

    onboardingActions.preencherDeExtracao({
      dre: {
        receitaBruta: merged.receita_bruta || null,
        receitaLiquida: merged.receita_liquida || null,
        cmv: merged.cmv || null,
        despesasOperacionais: merged.despesas_operacionais || null,
        depreciacaoAmortizacao: merged.depreciacao_amortizacao || null,
        lucroOperacional: merged.lucro_operacional || null,
        lucroLiquido: merged.lucro_liquido || null,
      },
      balanco: {
        ativoCirculante: merged.ativo_circulante || null,
        ativoNaoCirculante: merged.ativo_nao_circulante || null,
        ativoTotal: merged.ativo_total || null,
        passivoCirculante: merged.passivo_circulante || null,
        passivoNaoCirculante: merged.passivo_nao_circulante || null,
        passivoTotal: merged.passivo_total || null,
        patrimonioLiquido: merged.patrimonio_liquido || null,
        estoques: merged.estoques || null,
        contasAReceber: merged.contas_a_receber || null,
        fornecedores: merged.fornecedores || null,
      },
      dfc: {
        fluxoOperacional: merged.fluxo_operacional || null,
        fluxoInvestimento: merged.fluxo_investimento || null,
        fluxoFinanciamento: merged.fluxo_financiamento || null,
        saldoInicial: merged.saldo_inicial || null,
        saldoFinal: merged.saldo_final || null,
      },
    } as Demonstrativos)
  }

  const handleConfirm = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      const diagData = {
        ...demonstrativos,
        fleuriet: {
          cdg: empresaData.fleuriet_cdg,
          nig: empresaData.fleuriet_nig,
          st: empresaData.fleuriet_st,
        },
      }
      await saveDiagnostico(user.id, 'Empresa (Upload)', diagData)

      const { data: existingEmpresas } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(1)

      const updateData = { ...empresaData }
      delete (updateData as any).fleuriet_cdg
      delete (updateData as any).fleuriet_nig
      delete (updateData as any).fleuriet_st

      if (existingEmpresas && existingEmpresas.length > 0) {
        await supabase.from('empresas').update(updateData).eq('id', existingEmpresas[0].id)
      } else {
        await supabase.from('empresas').insert({
          user_id: user.id,
          nome_empresa: 'Empresa (Upload)',
          ...updateData,
        })
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
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Upload de Documentos Contábeis
        </h1>
        <p className="text-slate-700 dark:text-slate-300 font-medium">
          Envie DRE, Balanço Patrimonial e DFC. A IA fará a análise avançada baseada no modelo
          Fleuriet.
        </p>
      </div>

      {step === 'upload' && (
        <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div
              className="w-full max-w-xl border-2 border-dashed border-primary/50 rounded-2xl p-12 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={triggerFileInput}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.xlsx,.xls,.csv"
                multiple
              />
              <UploadCloud className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Clique para selecionar múltiplos arquivos
              </h3>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Formatos: PDF, Excel, CSV (Máx. 25MB)
              </p>
              <Button className="mt-6 font-semibold" onClick={triggerFileInput}>
                Procurar Arquivos
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md">
          <CardContent className="p-8 space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Processando Documentos
              </h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">
                A IA está extraindo os indicadores de cada arquivo.
              </p>
            </div>

            <div className="space-y-4">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4"
                >
                  <FileText className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <p className="font-semibold text-sm truncate text-slate-900 dark:text-slate-100">
                        {f.file.name}
                      </p>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {f.status === 'done'
                          ? 'Concluído'
                          : f.status === 'error'
                            ? 'Erro'
                            : `${f.progress}%`}
                      </span>
                    </div>
                    <Progress
                      value={f.progress}
                      className={cn(
                        'h-2',
                        f.status === 'error' && '[&>div]:bg-red-500',
                        f.status === 'done' && '[&>div]:bg-green-500',
                      )}
                    />
                  </div>
                  <div className="shrink-0">
                    {f.status === 'processing' || f.status === 'uploading' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : null}
                    {f.status === 'done' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : null}
                    {f.status === 'error' ? <XCircle className="h-5 w-5 text-red-500" /> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'validation' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-amber-100 dark:bg-amber-500/20 border-2 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-100 p-5 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="h-6 w-6 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <h4 className="font-bold text-base mb-1">Validação Humana Obrigatória</h4>
              <p className="text-sm font-medium">
                Verifique os dados compilados dos {files.length} arquivos. Corrija o que for
                necessário para a precisão do diagnóstico de capital de giro.
              </p>
            </div>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-md">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <CardTitle className="text-slate-900 dark:text-slate-100">
                Dados Consolidados
              </CardTitle>
              <CardDescription className="text-slate-700 dark:text-slate-300 font-medium">
                Revise os principais dados encontrados nos documentos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <MoneyField
                  label="Despesas Variáveis (Mensal)"
                  value={empresaData.despesas_variaveis_mensal}
                  onChange={(v: number | null) =>
                    setEmpresaData((p) => ({ ...p, despesas_variaveis_mensal: v }))
                  }
                />
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">
                  Indicadores Fleuriet Extraídos (Opcional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MoneyField
                    label="Capital de Giro Líquido (CDG)"
                    value={empresaData.fleuriet_cdg}
                    onChange={(v: number | null) =>
                      setEmpresaData((p) => ({ ...p, fleuriet_cdg: v }))
                    }
                  />
                  <MoneyField
                    label="Necessidade de Giro (NIG)"
                    value={empresaData.fleuriet_nig}
                    onChange={(v: number | null) =>
                      setEmpresaData((p) => ({ ...p, fleuriet_nig: v }))
                    }
                  />
                  <MoneyField
                    label="Saldo de Tesouraria (ST)"
                    value={empresaData.fleuriet_st}
                    onChange={(v: number | null) =>
                      setEmpresaData((p) => ({ ...p, fleuriet_st: v }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              className="border-slate-400 dark:border-slate-600 text-slate-800 dark:text-slate-200 font-semibold"
              onClick={() => {
                setStep('upload')
                setFiles([])
              }}
            >
              Refazer Upload
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              size="lg"
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Confirmar e Gerar Diagnóstico'}
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
