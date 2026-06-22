import { useMemo, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useFinanceStore from '@/stores/use-finance-store'
import { TarefaCard } from '@/components/TarefaCard'
import { useAuth } from '@/hooks/use-auth'
import { getLatestDiagnostico } from '@/services/db'
import { useSubscription } from '@/hooks/use-subscription'
import { SubscriptionLock } from '@/components/SubscriptionLock'
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export default function PlanoAcao() {
  const { tasks: fallbackTasks, registrarValorRealizado } = useFinanceStore()
  const { user } = useAuth()
  const { isActive, isLoading } = useSubscription()
  const [tasks, setTasks] = useState<any[]>(fallbackTasks)

  useEffect(() => {
    if (!user) return
    getLatestDiagnostico(user.id)
      .then((diag) => {
        if (diag && diag.plano_acao && Array.isArray(diag.plano_acao)) {
          setTasks(diag.plano_acao)
        }
      })
      .catch(console.error)
  }, [user])

  const completedTasks = tasks.filter(
    (t) => t.status === 'concluida' || t.status === 'concluida_com_atraso',
  ).length
  const progressPercent = Math.round((completedTasks / (tasks.length || 1)) * 100) || 0

  const evolutionData = [
    { mes: 'Mês Atual', valor: 0 },
    { mes: 'Mês +1', valor: tasks.length > 0 ? 15 : 0 },
    { mes: 'Mês +2', valor: tasks.length > 0 ? 30 : 0 },
    { mes: 'Mês +3', valor: tasks.length > 0 ? 55 : 0 },
    { mes: 'Mês +4', valor: tasks.length > 0 ? 80 : 0 },
    { mes: 'Mês +5', valor: tasks.length > 0 ? 95 : 0 },
    { mes: 'Mês +6', valor: tasks.length > 0 ? 100 : 0 },
  ]

  return (
    <SubscriptionLock isActive={isActive} isLoading={isLoading}>
      <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-6 px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Plano de Ação Dinâmico
          </h1>
          <p className="text-slate-400 mt-1">
            Acompanhe as recomendações da IA baseadas no seu diagnóstico financeiro. O progresso é
            calculado automaticamente.
          </p>
        </div>

        <Card className="shadow-none border-slate-800 bg-slate-900/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-200">Progresso Geral</h3>
                <p className="text-sm text-slate-400">
                  {completedTasks} de {tasks.length} tarefas concluídas
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-500">{progressPercent}%</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3 bg-slate-800 [&>div]:bg-blue-500" />
          </CardContent>
        </Card>

        <Card className="shadow-none border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-200 mb-4">
              Evolução Projetada (Próximos 6 meses)
            </h3>
            <div className="h-[200px] w-full">
              <ChartContainer
                config={{
                  valor: { label: 'Conclusão %', color: 'hsl(var(--primary))' },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={evolutionData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="mes"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickFormatter={(v) => `${v}%`}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="valor"
                      stroke="var(--color-valor)"
                      fill="var(--color-valor)"
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tasks.map((task) => (
            <TarefaCard
              key={task.id}
              tarefa={task}
              onRegistrarRealizado={registrarValorRealizado}
            />
          ))}
        </div>
      </div>
    </SubscriptionLock>
  )
}
