import { useState } from 'react'
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts'
import useFinanceStore from '@/stores/use-finance-store'

const costsData = [
  { name: 'Fixos', value: 15000 },
  { name: 'Variáveis', value: 8500 },
]

const breakEvenData = [
  { month: 'Jul', receita: 30000, custo: 28000 },
  { month: 'Ago', receita: 32000, custo: 29000 },
  { month: 'Set', receita: 45000, custo: 32000 },
]

export default function Diagnostico() {
  const { healthScore } = useFinanceStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showReport, setShowReport] = useState(true)

  const handleUpload = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setShowReport(true)
    }, 2000)
  }

  const chartConfigPie = {
    Fixos: { label: 'Custos Fixos', color: 'hsl(var(--secondary))' },
    Variáveis: { label: 'Custos Variáveis', color: 'hsl(var(--primary))' },
  }

  const chartConfigBar = {
    receita: { label: 'Receitas', color: 'hsl(var(--primary))' },
    custo: { label: 'Custos Totais', color: 'hsl(var(--muted-foreground))' },
  }

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Importe seus dados e deixe a IA revelar a saúde do seu negócio.
        </p>
      </div>

      <Tabs defaultValue={showReport ? 'relatorio' : 'importacao'} className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="importacao" className="rounded-lg">
            1. Importação de Dados
          </TabsTrigger>
          <TabsTrigger value="relatorio" disabled={!showReport} className="rounded-lg">
            2. Relatório IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="importacao">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle>Enviar Extratos ou Planilhas</CardTitle>
              <CardDescription>
                Arraste arquivos OFX, PDF ou CSV para análise automática.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={handleUpload}
              >
                {isProcessing ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <FileText className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-medium">A IA está analisando seus dados...</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Isso leva apenas alguns segundos.
                    </p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-1">
                      Clique para fazer upload ou arraste arquivos aqui
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Formatos suportados: .ofx, .csv, .pdf (extratos bancários)
                    </p>
                    <Button variant="secondary" className="rounded-full shadow-sm">
                      Selecionar Arquivos
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorio" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 shadow-subtle border-none">
              <CardHeader className="bg-primary/5 pb-4 border-b rounded-t-xl">
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Parecer do Consultor IA
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4 text-foreground/90 leading-relaxed">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-background rounded-xl p-4 border border-border/50 shadow-sm mb-4">
                  <div className="relative h-28 w-28 flex items-center justify-center shrink-0">
                    <ChartContainer config={{}} className="h-full w-full absolute inset-0">
                      <PieChart>
                        <Pie
                          data={[{ value: healthScore }, { value: 100 - healthScore }]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={55}
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
                      <span className="text-2xl font-bold">{healthScore}</span>
                      <span className="text-xs text-muted-foreground block -mt-1">/100</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left mt-2 sm:mt-0">
                    <h3 className="font-semibold text-lg text-foreground">Health Score: Bom</h3>
                    <p className="text-sm text-muted-foreground">
                      Sua empresa apresenta uma saúde financeira controlada, mas com oportunidades
                      de otimização nos custos fixos identificadas pela nossa IA.
                    </p>
                  </div>
                </div>

                <p>
                  Olá! Analisei seus últimos 3 meses de movimentação. Sua empresa apresenta uma{' '}
                  <strong>Margem de Lucro de 18%</strong>, o que é ótimo para o seu setor.
                </p>
                <p>
                  No entanto, notei um gargalo: seus <strong>custos fixos representam 63%</strong>{' '}
                  do total de saídas. Isso deixa pouca margem para manobras em meses de baixa
                  sazonalidade. O maior ofensor atual é o custo com{' '}
                  <span className="font-semibold text-destructive">Aluguel e Infraestrutura</span>.
                </p>
                <div className="flex items-start gap-3 bg-accent/50 p-4 rounded-xl mt-4">
                  <AlertTriangle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <strong>Ponto de Atenção:</strong> Seu Ponto de Equilíbrio (quanto você precisa
                    vender para não ter prejuízo) está em R$ 28.500/mês. Recomendo focar em ações
                    para reduzir o custo fixo e baixar esse limite.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="shadow-subtle border-none h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Estrutura de Custos</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                  <div className="h-[200px] w-full">
                    <ChartContainer config={chartConfigPie} className="h-full">
                      <PieChart>
                        <Pie
                          data={costsData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                        >
                          {costsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--primary))'}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-secondary"></div> Fixos (63%)
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-primary"></div> Variáveis (37%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle>Evolução de Receitas x Custos Totais</CardTitle>
              <CardDescription>Análise do distanciamento do Ponto de Equilíbrio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ChartContainer config={chartConfigBar} className="h-full w-full">
                  <BarChart data={breakEvenData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `R$ ${val / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="custo" fill="var(--color-custo)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 border-t flex justify-end p-4">
              <Button
                asChild
                className="rounded-full shadow-subtle hover:scale-95 transition-transform"
              >
                <a href="/plano">
                  Gerar Plano de Ação <TrendingUp className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
