import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import useFinanceStore from '@/stores/use-finance-store'
import { TarefaCard } from '@/components/TarefaCard'

export default function PlanoAcao() {
  const { tasks, registrarValorRealizado } = useFinanceStore()

  const completedTasks = tasks.filter(
    (t) => t.status === 'concluida' || t.status === 'concluida_com_atraso',
  ).length
  const progressPercent = Math.round((completedTasks / tasks.length) * 100) || 0

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-6 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Plano de Ação Dinâmico</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.map((task) => (
          <TarefaCard key={task.id} tarefa={task} onRegistrarRealizado={registrarValorRealizado} />
        ))}
      </div>
    </div>
  )
}
