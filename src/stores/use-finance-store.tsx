import React, { createContext, useContext, useState, useEffect } from 'react'

export type Transaction = {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'in' | 'out'
  status: 'Pago' | 'Pendente'
}

export interface TarefaPlanoAcao {
  id: string
  acao: string
  prioridade: 'alta' | 'media' | 'baixa'
  prazo: string
  metaValor: number | null
  metaUnidade: 'BRL' | 'percentual' | 'unidades' | null
  valorRealizado: number
  percentualConcluido: number
  status: 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada' | 'concluida_com_atraso'
  dataConclusao: string | null
}

interface FinanceState {
  transactions: Transaction[]
  tasks: TarefaPlanoAcao[]
  healthScore: number
  updateTransactionStatus: (id: string, status: 'Pago' | 'Pendente') => void
  registrarValorRealizado: (id: string, valorRealizado: number) => void
}

const FinanceContext = createContext<FinanceState | undefined>(undefined)

const initialTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-10-01',
    description: 'Venda Produto A',
    category: 'Receitas',
    amount: 4500,
    type: 'in',
    status: 'Pago',
  },
  {
    id: '2',
    date: '2023-10-02',
    description: 'Aluguel Escritório',
    category: 'Custos Fixos',
    amount: 2500,
    type: 'out',
    status: 'Pago',
  },
]

const initialTasks: TarefaPlanoAcao[] = [
  {
    id: '1',
    acao: 'Renegociar contrato de aluguel para adequação de margem',
    prioridade: 'alta',
    prazo: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    metaValor: 3000,
    metaUnidade: 'BRL',
    valorRealizado: 0,
    percentualConcluido: 0,
    status: 'nao_iniciada',
    dataConclusao: null,
  },
  {
    id: '2',
    acao: 'Antecipar recebíveis de clientes com Prazos Longos',
    prioridade: 'media',
    prazo: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    metaValor: 15000,
    metaUnidade: 'BRL',
    valorRealizado: 7500,
    percentualConcluido: 50,
    status: 'atrasada',
    dataConclusao: null,
  },
  {
    id: '3',
    acao: 'Cortar assinaturas de software inativas',
    prioridade: 'baixa',
    prazo: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    metaValor: null,
    metaUnidade: null,
    valorRealizado: 1,
    percentualConcluido: 100,
    status: 'concluida',
    dataConclusao: new Date().toISOString().split('T')[0],
  },
]

export function recalcularTarefa(
  tarefa: TarefaPlanoAcao,
  novoValorRealizado: number,
): TarefaPlanoAcao {
  const hoje = new Date().toISOString().split('T')[0]
  const prazo = tarefa.prazo

  let percentual = 0
  if (tarefa.metaValor && tarefa.metaValor > 0) {
    percentual = Math.min(100, Math.max(0, (novoValorRealizado / tarefa.metaValor) * 100))
  } else {
    percentual = novoValorRealizado > 0 ? 100 : 0
  }

  let status = tarefa.status
  let dataConclusao = tarefa.dataConclusao

  if (percentual === 100 && tarefa.percentualConcluido < 100) {
    dataConclusao = hoje
  } else if (percentual < 100) {
    dataConclusao = null
  }

  if (percentual === 0 && hoje <= prazo) status = 'nao_iniciada'
  else if (percentual > 0 && percentual < 100 && hoje <= prazo) status = 'em_andamento'
  else if (percentual === 100 && dataConclusao && dataConclusao <= prazo) status = 'concluida'
  else if (percentual === 100 && dataConclusao && dataConclusao > prazo)
    status = 'concluida_com_atraso'
  else if (percentual < 100 && hoje > prazo) status = 'atrasada'

  return {
    ...tarefa,
    valorRealizado: novoValorRealizado,
    percentualConcluido: percentual,
    status,
    dataConclusao,
  }
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [tasks, setTasks] = useState<TarefaPlanoAcao[]>(initialTasks)
  const [healthScore] = useState<number>(78)

  useEffect(() => {
    setTasks((prev) => prev.map((t) => recalcularTarefa(t, t.valorRealizado)))
  }, [])

  const updateTransactionStatus = (id: string, status: 'Pago' | 'Pendente') => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const registrarValorRealizado = (id: string, valorRealizado: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? recalcularTarefa(t, valorRealizado) : t)))
  }

  return React.createElement(
    FinanceContext.Provider,
    {
      value: { transactions, tasks, healthScore, updateTransactionStatus, registrarValorRealizado },
    },
    children,
  )
}

export default function useFinanceStore() {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error('useFinanceStore must be used within a FinanceProvider')
  }
  return context
}
