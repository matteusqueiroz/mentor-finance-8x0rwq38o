import { useEffect, useState } from 'react'
import { Download, FileText, DollarSign, BarChart3, Landmark, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Dashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState({
    ytdRevenue: 0,
    avgResult: 0,
    latestValuation: 0,
    latestFaturamento: 0,
  })

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const [{ data: acomp }, { data: vals }] = await Promise.all([
        supabase
          .from('acompanhamentos')
          .select('*')
          .eq('user_id', user.id)
          .order('mes_referencia', { ascending: true }),
        supabase
          .from('valuations')
          .select('*')
          .eq('user_id', user.id)
          .order('criado_em', { ascending: false })
          .limit(1),
      ])

      let ytdRev = 0,
        totalResult = 0,
        count = 0,
        lastFatur = 0
      const mapped = (acomp || []).map((d: any, i: number) => {
        const fatur = Number(d.faturamento_realizado) || 0
        const result = Number(d.resultado_valor) || 0
        ytdRev += fatur
        totalResult += result
        count++
        lastFatur = fatur
        return { mes: d.mes_referencia || `M${i + 1}`, faturamento: fatur, resultado: result }
      })
      if (mapped.length) setData(mapped)

      setStats({
        ytdRevenue: ytdRev,
        avgResult: count > 0 ? totalResult / count : 0,
        latestValuation: vals?.[0]?.resultado
          ? Number((vals[0].resultado as any).valor_empresa) || 0
          : 0,
        latestFaturamento: lastFatur,
      })
    }
    fetchData()
  }, [user])

  const handleExportCSV = async () => {
    if (!user) return
    try {
      const [{ data: diags }, { data: vals }] = await Promise.all([
        supabase.from('diagnosticos').select('*').eq('user_id', user.id),
        supabase.from('valuations').select('*').eq('user_id', user.id),
      ])
      let csv = 'Tipo,Data,Detalhes\n'
      diags?.forEach(
        (d) =>
          (csv += `Diagnostico,${d.criado_em},"${JSON.stringify(d.dados).replace(/"/g, '""')}"\n`),
      )
      vals?.forEach(
        (v) =>
          (csv += `Valuation,${v.criado_em},"${JSON.stringify(v.resultado).replace(/"/g, '""')}"\n`),
      )

      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      link.download = 'relatorio_financeiro.csv'
      link.click()
      toast({ title: 'Sucesso', description: 'Download CSV iniciado.' })
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao exportar CSV.', variant: 'destructive' })
    }
  }

  const handleExportPDF = async () => {
    if (!user) return
    const { data: vals } = await supabase
      .from('valuations')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(1)
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<html><head><title>Relatório PDF</title></head>
    <body style="font-family:sans-serif;padding:40px;color:#333;">
      <h1 style="color:#0f172a;">MentorFinance - Relatório Estratégico</h1>
      <hr style="border:1px solid #e2e8f0;margin-bottom:20px;" />
      <p><strong>Data da Exportação:</strong> ${new Date().toLocaleDateString()}</p>
      <h2 style="margin-top:30px;color:#334155;">Último Valuation</h2>
      <div style="background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
        <pre style="margin:0;font-size:14px;white-space:pre-wrap;">${JSON.stringify(vals?.[0]?.resultado || { status: 'Nenhum valuation encontrado' }, null, 2)}</pre>
      </div>
    </body></html>`)
    win.document.close()
    setTimeout(() => {
      win.print()
      win.close()
    }, 500)
    toast({ title: 'Sucesso', description: 'Preparando impressão PDF.' })
  }

  return (
    <div className="space-y-8 p-4 md:p-8 animate-slide-up max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Resultados</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seus indicadores e exporte seus relatórios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="shadow-sm">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="shadow-sm">
            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue (YTD)
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.ytdRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Monthly Result
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgResult.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Valuation
            </CardTitle>
            <Landmark className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.latestValuation.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Último Faturamento
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.latestFaturamento.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
          <CardDescription>Faturamento Realizado e Resultado ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ChartContainer
              config={{
                faturamento: { label: 'Faturamento', color: 'hsl(var(--primary))' },
                resultado: { label: 'Resultado', color: 'hsl(var(--secondary))' },
              }}
              className="h-full w-full"
            >
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border))"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickFormatter={(v) => `R$ ${v / 1000}k`}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  stroke="var(--color-faturamento)"
                  fill="var(--color-faturamento)"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="resultado"
                  stroke="var(--color-resultado)"
                  fill="var(--color-resultado)"
                  fillOpacity={0.15}
                  strokeWidth={3}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
