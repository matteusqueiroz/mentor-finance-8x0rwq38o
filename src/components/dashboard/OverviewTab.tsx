import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { DollarSign, BarChart3, Landmark, TrendingUp } from 'lucide-react'

interface OverviewTabProps {
  stats: {
    ytdRevenue: number
    avgResult: number
    latestValuation: number
    latestFaturamento: number
  }
  data: any[]
}

export function OverviewTab({ stats, data }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento YTD
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
              Resultado Médio
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
              Último Valuation
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
