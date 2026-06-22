import React, { createContext, useContext, useState } from 'react'

export type Transaction = {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: 'in' | 'out'
  status: 'Pago' | 'Pendente'
}

export type Task = {
  id: string
  title: string
  impact: 'Alto' | 'Médio' | 'Baixo'
  status: 'A Fazer' | 'Fazendo' | 'Concluído'
  deadline: string
  description: string
}

interface FinanceState {
  transactions: Transaction[]
  tasks: Task[]
  healthScore: number
  updateTransactionStatus: (id: string, status: 'Pago' | 'Pendente') => void
  updateTaskStatus: (id: string, status: 'A Fazer' | 'Fazendo' | 'Concluído') => void
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
  {
    id: '3',
    date: '2023-10-05',
    description: 'Energia Elétrica',
    category: 'Custos Variáveis',
    amount: 450,
    type: 'out',
    status: 'Pendente',
  },
  {
    id: '4',
    date: '2023-10-08',
    description: 'Serviços de Consultoria',
    category: 'Receitas',
    amount: 8200,
    type: 'in',
    status: 'Pendente',
  },
  {
    id: '5',
    date: '2023-10-10',
    description: 'Marketing Digital',
    category: 'Marketing',
    amount: 1200,
    type: 'out',
    status: 'Pago',
  },
]

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Renegociar contrato de aluguel',
    impact: 'Alto',
    status: 'A Fazer',
    deadline: '2023-10-15',
    description:
      'O valor do aluguel está 15% acima da média da região. Entrar em contato com a imobiliária para renegociação.',
  },
  {
    id: '2',
    title: 'Cortar assinaturas de software inativas',
    impact: 'Baixo',
    status: 'Concluído',
    deadline: '2023-10-05',
    description: 'Identificamos 3 ferramentas pagas que não são acessadas há mais de 60 dias.',
  },
  {
    id: '3',
    title: 'Antecipar recebíveis de clientes Prazos Longos',
    impact: 'Médio',
    status: 'Fazendo',
    deadline: '2023-10-20',
    description:
      'Melhorar o fluxo de caixa antecipando notas fiscais com vencimento acima de 60 dias.',
  },
]

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [healthScore] = useState<number>(78)

  const updateTransactionStatus = (id: string, status: 'Pago' | 'Pendente') => {
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  const updateTaskStatus = (id: string, status: 'A Fazer' | 'Fazendo' | 'Concluído') => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)))
  }

  return React.createElement(
    FinanceContext.Provider,
    { value: { transactions, tasks, healthScore, updateTransactionStatus, updateTaskStatus } },
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
