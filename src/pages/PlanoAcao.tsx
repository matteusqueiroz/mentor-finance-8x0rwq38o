import { useState, useMemo } from 'react'
import { CheckCircle2, Circle, Clock, ArrowRight, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import useFinanceStore, { Task } from '@/stores/use-finance-store'

export default function PlanoAcao() {
  const { tasks, updateTaskStatus } = useFinanceStore()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const completedTasks = tasks.filter((t) => t.status === 'Concluído').length
  const progressPercent = Math.round((completedTasks / tasks.length) * 100)

  const impactColors = {
    Alto: 'bg-destructive/10 text-destructive border-destructive/20',
    Médio: 'bg-secondary/10 text-secondary border-secondary/20',
    Baixo: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plano de Ação</h1>
        <p className="text-muted-foreground mt-1">
          Recomendações da IA baseadas no seu diagnóstico financeiro.
        </p>
      </div>

      <Card className="shadow-subtle border-none bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground">Progresso do Plano Atual</h3>
              <p className="text-sm text-muted-foreground">
                {completedTasks} de {tasks.length} tarefas concluídas
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold text-primary">{progressPercent}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Sheet key={task.id}>
            <SheetTrigger asChild>
              <Card className="shadow-sm hover:shadow-md transition-all cursor-pointer border border-border/50 hover:border-primary/30 group">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      className="shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        updateTaskStatus(
                          task.id,
                          task.status === 'Concluído' ? 'A Fazer' : 'Concluído',
                        )
                      }}
                    >
                      {task.status === 'Concluído' ? (
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      ) : (
                        <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <div>
                      <h4
                        className={cn(
                          'font-medium text-foreground',
                          task.status === 'Concluído' && 'line-through text-muted-foreground',
                        )}
                      >
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className={impactColors[task.impact]}>
                          Impacto {task.impact}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Prazo: {task.deadline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-4">
                    <Select
                      value={task.status}
                      onValueChange={(val: any) => {
                        updateTaskStatus(task.id, val)
                      }}
                    >
                      <SelectTrigger
                        className="w-[130px] h-8 text-xs bg-transparent"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A Fazer">A Fazer</SelectItem>
                        <SelectItem value="Fazendo">Fazendo</SelectItem>
                        <SelectItem value="Concluído">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                  </div>
                </CardContent>
              </Card>
            </SheetTrigger>
            <SheetContent className="sm:max-w-md w-full border-l-0 shadow-elevation">
              <SheetHeader className="mb-6">
                <Badge variant="outline" className={cn('w-max mb-2', impactColors[task.impact])}>
                  Impacto {task.impact}
                </Badge>
                <SheetTitle className="text-2xl">{task.title}</SheetTitle>
                <SheetDescription>Prazo sugerido: {task.deadline}</SheetDescription>
              </SheetHeader>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Por que fazer isso?</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Passo a passo sugerido:</h4>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{' '}
                      Levante os contratos atuais e identifique as cláusulas de quebra.
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />{' '}
                      Pesquise valores de mercado na região para usar como argumento.
                    </li>
                    <li className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> Agende
                      uma reunião amigável com a imobiliária apresentando os dados do diagnóstico.
                    </li>
                  </ul>
                </div>
                <div className="pt-6 border-t">
                  <Button
                    className="w-full rounded-full"
                    onClick={() => updateTaskStatus(task.id, 'Concluído')}
                    disabled={task.status === 'Concluído'}
                  >
                    {task.status === 'Concluído' ? 'Tarefa Concluída!' : 'Marcar como Concluída'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  )
}
