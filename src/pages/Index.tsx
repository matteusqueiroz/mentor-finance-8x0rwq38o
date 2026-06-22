import { useMemo } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Target,
  TrendingUp,
  Sparkles,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import useFinanceStore from '@/stores/use-finance-store'

const cashFlowData = [
  { day: '01', in: 4000, out: 2400 },
  { day: '05', in: 3000, out: 1398 },
  { day: '10', in: 2000, out: 9800 },
  { day: '15', in: 2780, out: 3908 },
  { day: '20', in: 1890, out: 4800 },
  { day: '25', in: 2390, out: 3800 },
  { day: '30', in: 3490, out: 4300 },
]

export default function Index() {
  const { transactions, healthScore } = useFinanceStore()

  const recentTransactions = useMemo(() => transactions.slice(0, 5), [transactions])

  const chartConfig = {
    in: { label: 'Receitas', color: 'hsl(var(--primary))' },
    out: { label: 'Despesas', color: 'hsl(var(--destructive))' },
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta! Aqui está o resumo da sua empresa hoje.
          </p>
        </div>
        <Button className="shrink-0 rounded-full shadow-subtle active:scale-95 transition-transform">
          Adicionar Transação
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 24.500,00</div>
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
            <div className="text-2xl font-bold">R$ 45.231,89</div>
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
            <div className="text-2xl font-bold">R$ 32.100,50</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1 text-destructive" />
              <span className="text-destructive font-medium">+4%</span> vs. orçado
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-subtle border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projeção Fechamento
            </CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">R$ 38.500,00</div>
            <p className="text-xs text-muted-foreground mt-1">Margem de lucro estimada: 18%</p>
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
          <Card className="shadow-subtle border-none bg-accent/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Dicas da IA para hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-background rounded-xl p-4 shadow-sm">
                <p className="text-sm text-foreground">
                  Sua conta de energia elétrica subiu 15% este mês. Que tal revisar os horários de
                  uso de fornos?
                </p>
              </div>
              <div className="bg-background rounded-xl p-4 shadow-sm">
                <p className="text-sm text-foreground">
                  Você tem R$ 8.200 em contas a receber nos próximos 5 dias. Ideal para cobrir as
                  despesas fixas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-subtle border-none">
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-base">Saúde Financeira</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <ChartContainer config={{}} className="h-full w-full absolute inset-0">
                  <PieChart>
                    <Pie
                      data={[{ value: healthScore }, { value: 100 - healthScore }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="hsl(var(--primary))" />
                      <Cell fill="hsl(var(--muted))" />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="text-center z-10">
                  <span className="text-3xl font-bold">{healthScore}</span>
                  <span className="text-sm text-muted-foreground block -mt-1">/100</span>
                </div>
              </div>
              <p className="text-sm text-center mt-4 text-muted-foreground">
                Sua empresa está com uma saúde financeira "Boa". Continue mantendo os custos
                controlados.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
