import { useMemo, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  TrendingUp,
  Sparkles,
  Activity,
  Bot,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import useFinanceStore from '@/stores/use-finance-store'
import { useAuth } from '@/hooks/use-auth'
import { getAcompanhamentos } from '@/services/db'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const fallbackCashFlowData = [
  { day: '01', in: 4000, out: 2400 },
  { day: '05', in: 3000, out: 1398 },
  { day: '10', in: 2000, out: 9800 },
  { day: '15', in: 2780, out: 3908 },
  { day: '20', in: 1890, out: 4800 },
  { day: '25', in: 2390, out: 3800 },
  { day: '30', in: 3490, out: 4300 },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { transactions } = useFinanceStore()
  const { toast } = useToast()
  const [cashFlowData, setCashFlowData] = useState(fallbackCashFlowData)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiStatus, setAiStatus] = useState<'idle' | 'missing_key' | 'success'>('idle')
  const [stats, setStats] = useState({
    saldo: 24500,
    receitas: 45231.89,
    despesas: 32100.5,
    lucro: 13131.39,
  })

  useEffect(() => {
    if (!user) return
    getAcompanhamentos(user.id)
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((d: any, i: number) => ({
            day: d.mes_referencia || `M${i + 1}`,
            in: d.faturamento_realizado || 0,
            out: (d.faturamento_realizado || 0) - (d.resultado_valor || 0),
          }))
          if (mapped.length > 0) setCashFlowData(mapped)

          const latest = data[data.length - 1]
          setStats({
            saldo: latest.resultado_valor || 24500,
            receitas: latest.faturamento_realizado || 45231.89,
            despesas:
              (latest.faturamento_realizado || 0) - (latest.resultado_valor || 0) || 32100.5,
            lucro: latest.resultado_valor || 13131.39,
          })
        }
      })
      .catch(console.error)
  }, [user])

  const chartConfig = {
    in: { label: 'Receitas', color: 'hsl(var(--primary))' },
    out: { label: 'Despesas', color: 'hsl(var(--destructive))' },
  }

  const handleAiAnalysis = async () => {
    if (!user) return
    setIsAnalyzing(true)
    setAiStatus('idle')
    try {
      const { data, error } = await supabase.functions.invoke('analyze-document', {
        body: { documentText: 'Analisar finanças baseadas no fluxo de caixa recente.' },
      })

      if (error || !data || data?.error === 'AI_KEY_MISSING') {
        setAiStatus('missing_key')
        toast({
          title: 'Configuração Pendente',
          description: 'A chave da IA não está configurada.',
          variant: 'destructive',
        })
        return
      }

      setAiStatus('success')
      toast({
        title: 'Análise Concluída',
        description: 'Sua IA gerou um novo diagnóstico com sucesso!',
      })

      const { data: empData } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
      let empId = empData?.[0]?.id

      if (!empId) {
        const { data: newEmp } = await supabase
          .from('empresas')
          .insert({
            user_id: user.id,
            nome_empresa: 'Minha Empresa (Gerada por IA)',
          })
          .select('id')
          .single()
        empId = newEmp?.id
      }

      if (empId) {
        await supabase.from('diagnosticos').insert({
          user_id: user.id,
          empresa_id: empId,
          dados: data.analysis.extracted_data || {},
          plano_acao: data.analysis.plano_acao || {},
        })
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8 animate-slide-up">
      {aiStatus === 'missing_key' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>IA Indisponível</AlertTitle>
          <AlertDescription>
            A integração com a IA requer uma chave de API válida (ANTHROPIC_API_KEY). Configure suas
            variáveis de ambiente para habilitar os diagnósticos automatizados.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Resultados</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus indicadores, receitas, despesas e fluxo de caixa.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleAiAnalysis}
            disabled={isAnalyzing}
            className="shrink-0 rounded-full shadow-subtle active:scale-95 transition-transform"
          >
            <Bot className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analisando...' : 'Gerar Diagnóstico IA'}
          </Button>
          <Button className="shrink-0 rounded-full shadow-subtle active:scale-95 transition-transform">
            Adicionar Transação
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo Atual (Caixa)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-primary" />
              <span className="text-primary font-medium">+12%</span> em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receitas do Mês
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.receitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              Rumo à meta de R$ 50k
            </p>
            <Progress value={90} className="h-1.5 mt-3" />
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Despesas do Mês
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.despesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1 text-destructive" />
              <span className="text-destructive font-medium">+4%</span> vs. orçado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro / Prejuízo
            </CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Margem de lucro atual: 29%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 shadow-subtle border-none">
          <CardHeader>
            <CardTitle>Fluxo de Caixa (30 dias)</CardTitle>
            <CardDescription>Evolução de entradas e saídas diárias</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[300px] w-full mt-4">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-in)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-in)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-out)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-out)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="in"
                    stroke="var(--color-in)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIn)"
                  />
                  <Area
                    type="monotone"
                    dataKey="out"
                    stroke="var(--color-out)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorOut)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-subtle border-none bg-accent/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Dicas da IA para hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background rounded-xl p-4 shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-secondary" />
                  Alerta de Custos
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sua conta de energia elétrica subiu 15% este mês. Que tal revisar os horários de
                  uso de equipamentos pesados?
                </p>
              </div>
              <div className="bg-background rounded-xl p-4 shadow-sm border border-border/50 hover:border-primary/30 transition-colors">
                <h4 className="font-medium text-sm flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Oportunidade de Caixa
                </h4>
                <p className="text-sm text-muted-foreground">
                  Você tem R$ 8.200 em contas a receber nos próximos 5 dias. Ideal para cobrir as
                  despesas fixas desta semana sem usar capital de giro.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-2 rounded-full shadow-sm" asChild>
                <a href="/plano">Ver todas recomendações</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
