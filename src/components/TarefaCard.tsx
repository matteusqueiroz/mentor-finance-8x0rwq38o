import { MoneyField } from './MoneyField'
import { TarefaPlanoAcao } from '@/stores/use-finance-store'

interface TarefaCardProps {
  tarefa: TarefaPlanoAcao
  onRegistrarRealizado: (id: string, valor: number) => void
}

const STATUS_COR: Record<TarefaPlanoAcao['status'], string> = {
  nao_iniciada: 'bg-slate-600',
  em_andamento: 'bg-blue-500',
  concluida: 'bg-emerald-500',
  concluida_com_atraso: 'bg-amber-500',
  atrasada: 'bg-red-500',
}

const STATUS_LABEL: Record<TarefaPlanoAcao['status'], string> = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  concluida_com_atraso: 'Concluída com Atraso',
  atrasada: 'Atrasada',
}

const PRIORIDADE_COR: Record<TarefaPlanoAcao['prioridade'], string> = {
  alta: 'text-red-400 bg-red-400/10 border-red-400/20',
  media: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  baixa: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
}

export function TarefaCard({ tarefa, onRegistrarRealizado }: TarefaCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-5 flex flex-col gap-4 shadow-sm hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase border mb-2 ${PRIORIDADE_COR[tarefa.prioridade]}`}
          >
            {tarefa.prioridade}
          </span>
          <p className="text-base font-medium text-slate-100">{tarefa.acao}</p>
        </div>
        <div className="text-right shrink-0 flex flex-col items-end">
          <span className="text-xs text-slate-400 mb-1">Prazo</span>
          <span className="text-sm font-medium text-slate-300">
            {new Date(tarefa.prazo).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </span>
        </div>
      </div>

      {tarefa.metaValor != null && (
        <div className="space-y-3 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Realizado: R${' '}
              {tarefa.valorRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / Meta:
              R$ {tarefa.metaValor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-medium">{Math.round(tarefa.percentualConcluido)}%</span>
          </div>

          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${STATUS_COR[tarefa.status]} transition-all duration-500 ease-out`}
              style={{ width: `${tarefa.percentualConcluido}%` }}
            />
          </div>

          <div className="pt-2">
            <MoneyField
              label="Registrar valor realizado"
              value={tarefa.valorRealizado === 0 ? null : tarefa.valorRealizado}
              onChange={(v) => onRegistrarRealizado(tarefa.id, v ?? 0)}
            />
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-sm ${STATUS_COR[tarefa.status]}`}
        >
          {STATUS_LABEL[tarefa.status]}
        </span>
      </div>
    </div>
  )
}
