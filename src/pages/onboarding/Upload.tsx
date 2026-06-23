import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UploadCloud, FileText, X, CheckCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

type FileStatus = 'pending' | 'uploading' | 'analyzing' | 'completed' | 'error'
interface FileWithStatus {
  file: File
  status: FileStatus
  id?: string
  error?: string
}

export default function UploadFlow() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [files, setFiles] = useState<FileWithStatus[]>([])
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed'>('idle')
  const [docIds, setDocIds] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    nomeEmpresa: '',
    setor: '',
    regimeTributario: '',
    numFuncionarios: '',
    anosOperacao: '',
    faturamentoAnual: '',
    custoDiretoAnual: '',
    salariosMensal: '',
    aluguelMensal: '',
    impostosMensal: '',
    despesasVariaveisMensal: '',
    outrasDespesasFixasMensal: '',
    tipoClientes: '',
    temControle: '',
    saudePercebida: '',
    doresPrincipais: '',
    comportamentoFaturamento: '',
    resultadoMesPassado: '',
    resultadoMesPassadoValor: '',
  })

  const updateForm = (key: keyof typeof form, val: string) => setForm((p) => ({ ...p, [key]: val }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFiles((p) => [
        ...p,
        ...Array.from(e.target.files!).map((f) => ({ file: f, status: 'pending' as FileStatus })),
      ])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setFiles((p) => p.filter((_, i) => i !== index))
  }

  const processFiles = async () => {
    if (!files.length || !user) return
    setStatus('processing')

    let combinedData: any = {}
    let hasErrors = false
    const updatedFiles = [...files]

    for (let i = 0; i < updatedFiles.length; i++) {
      if (updatedFiles[i].status !== 'pending' && updatedFiles[i].status !== 'error') continue

      const updateStatus = (st: FileStatus, err?: string) => {
        updatedFiles[i] = { ...updatedFiles[i], status: st, error: err }
        setFiles([...updatedFiles])
      }

      updateStatus('uploading')
      const ext = updatedFiles[i].file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

      const { error: upErr } = await supabase.storage
        .from('documentos')
        .upload(path, updatedFiles[i].file)

      if (upErr) {
        updateStatus('error', 'Upload falhou')
        hasErrors = true
        toast({
          title: 'Erro de Upload',
          description: `Não foi possível fazer upload de ${updatedFiles[i].file.name}. Erro: ${upErr.message}`,
          variant: 'destructive',
        })
        continue
      }

      updateStatus('analyzing')
      const { data: doc, error: dbErr } = await supabase
        .from('documentos_contabeis')
        .insert({
          user_id: user.id,
          nome_arquivo: updatedFiles[i].file.name,
          url_arquivo: path,
          status: 'processando',
        })
        .select()
        .single()

      if (dbErr || !doc) {
        updateStatus('error', 'Erro DB')
        hasErrors = true
        continue
      }

      setDocIds((p) => [...p, doc.id])

      const { data: res, error: fnErr } = await supabase.functions.invoke('analyze-document', {
        body: { documentId: doc.id, filePath: path },
      })

      if (fnErr || !res?.data) {
        updateStatus('error', 'Falha na extração de dados')
        await supabase.from('documentos_contabeis').update({ status: 'error' }).eq('id', doc.id)

        hasErrors = true
        toast({
          title: 'Erro na análise',
          description: `Falha na extração de dados de ${updatedFiles[i].file.name}. ${fnErr?.message || ''}`,
          variant: 'destructive',
        })
        continue
      }

      await supabase
        .from('documentos_contabeis')
        .update({ status: 'processed', analise_ia: res.data })
        .eq('id', doc.id)

      updateStatus('completed')
      combinedData = { ...combinedData, ...res.data }
    }

    if (Object.keys(combinedData).length > 0) {
      setForm((prev) => ({
        ...prev,
        nomeEmpresa: combinedData.nome_empresa || combinedData.nomeEmpresa || prev.nomeEmpresa,
        setor: combinedData.setor || prev.setor,
        regimeTributario:
          combinedData.regime_tributario || combinedData.regimeTributario || prev.regimeTributario,
        numFuncionarios:
          combinedData.num_funcionarios || combinedData.numFuncionarios || prev.numFuncionarios,
        anosOperacao:
          combinedData.anos_operacao?.toString() ||
          combinedData.anosOperacao?.toString() ||
          prev.anosOperacao,
        faturamentoAnual:
          combinedData.faturamento_anual?.toString() ||
          combinedData.faturamentoAnual?.toString() ||
          prev.faturamentoAnual,
        custoDiretoAnual:
          combinedData.custo_direto_anual?.toString() ||
          combinedData.custoDiretoAnual?.toString() ||
          prev.custoDiretoAnual,
        salariosMensal:
          combinedData.salarios_mensal?.toString() ||
          combinedData.salariosMensal?.toString() ||
          prev.salariosMensal,
        aluguelMensal:
          combinedData.aluguel_mensal?.toString() ||
          combinedData.aluguelMensal?.toString() ||
          prev.aluguelMensal,
        impostosMensal:
          combinedData.impostos_mensal?.toString() ||
          combinedData.impostosMensal?.toString() ||
          prev.impostosMensal,
        despesasVariaveisMensal:
          combinedData.despesas_variaveis_mensal?.toString() ||
          combinedData.despesasVariaveisMensal?.toString() ||
          prev.despesasVariaveisMensal,
        outrasDespesasFixasMensal:
          combinedData.outras_despesas_fixas_mensal?.toString() ||
          combinedData.outrasDespesasFixasMensal?.toString() ||
          prev.outrasDespesasFixasMensal,
        tipoClientes: combinedData.tipo_clientes || combinedData.tipoClientes || prev.tipoClientes,
        comportamentoFaturamento:
          combinedData.comportamento_faturamento ||
          combinedData.comportamentoFaturamento ||
          prev.comportamentoFaturamento,
        resultadoMesPassado:
          combinedData.resultado_mes_passado ||
          combinedData.resultadoMesPassado ||
          prev.resultadoMesPassado,
        resultadoMesPassadoValor:
          combinedData.resultado_mes_passado_valor?.toString() ||
          combinedData.resultadoMesPassadoValor?.toString() ||
          prev.resultadoMesPassadoValor,
      }))

      toast({
        title: 'Análise Concluída',
        description: 'Os dados foram extraídos e preenchidos no formulário.',
      })
    }

    setStatus(hasErrors ? 'idle' : 'completed')
  }

  const handleSave = async () => {
    if (!user) return
    try {
      const empresaData = {
        nome_empresa: form.nomeEmpresa || 'Minha Empresa',
        setor: form.setor,
        regime_tributario: form.regimeTributario,
        num_funcionarios: form.numFuncionarios,
        anos_operacao: form.anosOperacao ? parseInt(form.anosOperacao) : null,
        faturamento_anual: form.faturamentoAnual ? parseFloat(form.faturamentoAnual) : null,
        custo_direto_anual: form.custoDiretoAnual ? parseFloat(form.custoDiretoAnual) : null,
        salarios_mensal: form.salariosMensal ? parseFloat(form.salariosMensal) : null,
        aluguel_mensal: form.aluguelMensal ? parseFloat(form.aluguelMensal) : null,
        impostos_mensal: form.impostosMensal ? parseFloat(form.impostosMensal) : null,
        despesas_variaveis_mensal: form.despesasVariaveisMensal
          ? parseFloat(form.despesasVariaveisMensal)
          : null,
        outras_despesas_fixas_mensal: form.outrasDespesasFixasMensal
          ? parseFloat(form.outrasDespesasFixasMensal)
          : null,
        tipo_clientes: form.tipoClientes,
        tem_controle: form.temControle,
        saude_percebida: form.saudePercebida,
        comportamento_faturamento: form.comportamentoFaturamento,
        resultado_mes_passado: form.resultadoMesPassado,
        resultado_mes_passado_valor: form.resultadoMesPassadoValor
          ? parseFloat(form.resultadoMesPassadoValor)
          : null,
        dores_principais: form.doresPrincipais
          ? form.doresPrincipais.split(',').map((s) => s.trim())
          : [],
      }

      // Check if user already has an empresa
      const { data: existingEmpresas } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(1)

      let empresaId

      if (existingEmpresas && existingEmpresas.length > 0) {
        empresaId = existingEmpresas[0].id
        const { error: updateErr } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', empresaId)

        if (updateErr) throw updateErr
      } else {
        const { data: newEmpresa, error: insertErr } = await supabase
          .from('empresas')
          .insert({
            user_id: user.id,
            ...empresaData,
          })
          .select()
          .single()

        if (insertErr) throw insertErr
        empresaId = newEmpresa.id
      }

      if (docIds.length > 0) {
        await supabase
          .from('documentos_contabeis')
          .update({ empresa_id: empresaId })
          .in('id', docIds)
      }

      const dummyDemonstrativos = {
        dre: {
          receitaBruta: form.faturamentoAnual ? parseFloat(form.faturamentoAnual) / 12 : null,
          receitaLiquida: form.faturamentoAnual
            ? (parseFloat(form.faturamentoAnual) / 12) * 0.9
            : null,
          cmv: form.custoDiretoAnual ? parseFloat(form.custoDiretoAnual) / 12 : null,
          despesasOperacionais:
            (form.salariosMensal ? parseFloat(form.salariosMensal) : 0) +
            (form.aluguelMensal ? parseFloat(form.aluguelMensal) : 0),
          depreciacaoAmortizacao: null,
          lucroOperacional: null,
          lucroLiquido: form.resultadoMesPassadoValor
            ? parseFloat(form.resultadoMesPassadoValor)
            : null,
        },
        balanco: {
          ativoCirculante: null,
          ativoNaoCirculante: null,
          ativoTotal: null,
          passivoCirculante: null,
          passivoNaoCirculante: null,
          passivoTotal: null,
          patrimonioLiquido: null,
          estoques: null,
          contasAReceber: null,
          fornecedores: null,
        },
        dfc: {
          fluxoOperacional: null,
          fluxoInvestimento: null,
          fluxoFinanciamento: null,
          saldoInicial: null,
          saldoFinal: null,
        },
      }

      await supabase.from('diagnosticos').insert({
        user_id: user.id,
        empresa_id: empresaId,
        dados: dummyDemonstrativos,
        plano_acao: null,
      })

      toast({
        title: 'Sucesso!',
        description: 'Dados salvos com sucesso.',
      })
      navigate('/dashboard')
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e.message || 'Houve um problema ao salvar os dados da empresa.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container max-w-4xl py-10 space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Onboarding: Análise de Documentos</h1>
        <p className="text-muted-foreground">
          Faça o upload dos seus demonstrativos (DRE, Balanço, etc.) ou insira os dados manualmente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Upload de Documentos</CardTitle>
          <CardDescription>Formatos suportados: PDF, Excel, Imagens.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Clique para selecionar os arquivos</p>
            <p className="text-xs text-muted-foreground">PDF, Excel ou Imagens</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2 mt-6">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">{f.file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status === 'pending' && (
                      <span className="text-xs text-muted-foreground">Aguardando</span>
                    )}
                    {f.status === 'uploading' && (
                      <span className="text-xs text-blue-500 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Uploading
                      </span>
                    )}
                    {f.status === 'analyzing' && (
                      <span className="text-xs text-amber-500 flex items-center">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Analisando
                      </span>
                    )}
                    {f.status === 'completed' && (
                      <span className="text-xs text-emerald-500 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Concluído
                      </span>
                    )}
                    {f.status === 'error' && (
                      <span className="text-xs text-red-500">{f.error}</span>
                    )}

                    {f.status !== 'uploading' &&
                      f.status !== 'analyzing' &&
                      f.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                          onClick={() => removeFile(i)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {files.length > 0 && status !== 'completed' && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={processFiles}
              disabled={
                status === 'processing' ||
                !files.some((f) => f.status === 'pending' || f.status === 'error')
              }
            >
              {status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Processar Documentos com IA'
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Dados da Empresa</CardTitle>
          <CardDescription>Revise e complete as informações do seu negócio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa *</Label>
              <Input
                value={form.nomeEmpresa}
                onChange={(e) => updateForm('nomeEmpresa', e.target.value)}
                placeholder="Ex: Padaria do João"
              />
            </div>
            <div className="space-y-2">
              <Label>Setor *</Label>
              <Input
                value={form.setor}
                onChange={(e) => updateForm('setor', e.target.value)}
                placeholder="Ex: Varejo"
              />
            </div>

            <div className="space-y-2">
              <Label>Regime Tributário</Label>
              <Select
                value={form.regimeTributario}
                onValueChange={(v) => updateForm('regimeTributario', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simples">Simples Nacional</SelectItem>
                  <SelectItem value="presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="real">Lucro Real</SelectItem>
                  <SelectItem value="mei">MEI</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de Funcionários</Label>
              <Select
                value={form.numFuncionarios}
                onValueChange={(v) => updateForm('numFuncionarios', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-5">1 a 5</SelectItem>
                  <SelectItem value="6-20">6 a 20</SelectItem>
                  <SelectItem value="21-50">21 a 50</SelectItem>
                  <SelectItem value="50+">Mais de 50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Anos de Operação</Label>
              <Input
                type="number"
                value={form.anosOperacao}
                onChange={(e) => updateForm('anosOperacao', e.target.value)}
                placeholder="Ex: 5"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo de Clientes</Label>
              <Select
                value={form.tipoClientes}
                onValueChange={(v) => updateForm('tipoClientes', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B (Empresas)</SelectItem>
                  <SelectItem value="B2C">B2C (Consumidor Final)</SelectItem>
                  <SelectItem value="B2B2C">B2B2C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Faturamento Anual Bruto (R$)</Label>
              <Input
                type="number"
                value={form.faturamentoAnual}
                onChange={(e) => updateForm('faturamentoAnual', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Custos Diretos Anuais (R$)</Label>
              <Input
                type="number"
                value={form.custoDiretoAnual}
                onChange={(e) => updateForm('custoDiretoAnual', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Salários Mensal (R$)</Label>
              <Input
                type="number"
                value={form.salariosMensal}
                onChange={(e) => updateForm('salariosMensal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Aluguel Mensal (R$)</Label>
              <Input
                type="number"
                value={form.aluguelMensal}
                onChange={(e) => updateForm('aluguelMensal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Impostos Mensais (R$)</Label>
              <Input
                type="number"
                value={form.impostosMensal}
                onChange={(e) => updateForm('impostosMensal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Despesas Variáveis (Mensal - R$)</Label>
              <Input
                type="number"
                value={form.despesasVariaveisMensal}
                onChange={(e) => updateForm('despesasVariaveisMensal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Outras Despesas Fixas (Mensal - R$)</Label>
              <Input
                type="number"
                value={form.outrasDespesasFixasMensal}
                onChange={(e) => updateForm('outrasDespesasFixasMensal', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Nível de Controle Financeiro</Label>
              <Select value={form.temControle} onValueChange={(v) => updateForm('temControle', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  <SelectItem value="basico">Básico (Planilhas)</SelectItem>
                  <SelectItem value="sistema">Sistema de Gestão (ERP)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Saúde Financeira Percebida</Label>
              <Select
                value={form.saudePercebida}
                onValueChange={(v) => updateForm('saudePercebida', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessima">Péssima (No vermelho)</SelectItem>
                  <SelectItem value="ruim">Ruim (Dificuldades)</SelectItem>
                  <SelectItem value="estavel">Estável</SelectItem>
                  <SelectItem value="boa">Boa (Crescendo)</SelectItem>
                  <SelectItem value="excelente">Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Comportamento do Faturamento</Label>
              <Select
                value={form.comportamentoFaturamento}
                onValueChange={(v) => updateForm('comportamentoFaturamento', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crescente">Crescente</SelectItem>
                  <SelectItem value="estavel">Estável</SelectItem>
                  <SelectItem value="decrescente">Decrescente</SelectItem>
                  <SelectItem value="sazonal">Sazonal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resultado Mês Passado</Label>
              <Select
                value={form.resultadoMesPassado}
                onValueChange={(v) => updateForm('resultadoMesPassado', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lucro">Lucro</SelectItem>
                  <SelectItem value="prejuizo">Prejuízo</SelectItem>
                  <SelectItem value="zero">Zero (Empate)</SelectItem>
                  <SelectItem value="nao_sei">Não sei</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor do Resultado Mês Passado (R$)</Label>
              <Input
                type="number"
                value={form.resultadoMesPassadoValor}
                onChange={(e) => updateForm('resultadoMesPassadoValor', e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Dores Principais (Separe por vírgula)</Label>
              <Input
                value={form.doresPrincipais}
                onChange={(e) => updateForm('doresPrincipais', e.target.value)}
                placeholder="Ex: fluxo de caixa, inadimplência, precificação"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!form.nomeEmpresa || !form.setor}>
            Salvar e Concluir
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
