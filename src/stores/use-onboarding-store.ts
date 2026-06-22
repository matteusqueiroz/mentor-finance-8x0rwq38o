import { useSyncExternalStore } from 'react'

export type FluxoEscolhido = 'upload' | 'estimativa' | 'profissional' | 'template'

export interface DRE {
  receitaBruta: number | null
  receitaLiquida: number | null
  cmv: number | null
  despesasOperacionais: number | null
  depreciacaoAmortizacao: number | null
  lucroOperacional: number | null
  lucroLiquido: number | null
}

export interface Balanco {
  ativoCirculante: number | null
  ativoNaoCirculante: number | null
  ativoTotal: number | null
  passivoCirculante: number | null
  passivoNaoCirculante: number | null
  passivoTotal: number | null
  patrimonioLiquido: number | null
  estoques: number | null
  contasAReceber: number | null
  fornecedores: number | null
}

export interface DFC {
  fluxoOperacional: number | null
  fluxoInvestimento: number | null
  fluxoFinanciamento: number | null
  saldoInicial: number | null
  saldoFinal: number | null
}

export interface Demonstrativos {
  dre: DRE
  balanco: Balanco
  dfc: DFC
}

export interface OnboardingState {
  fluxo: FluxoEscolhido | null
  setor: string | null
  empresaNome: string
  origemConfiabilidade: 'estimado' | 'extraido' | 'informado'
  demonstrativos: Demonstrativos
  passoAtual: number
  passosTotais: number
  camposValidados: Record<string, boolean>
}

const initialDemonstrativos: Demonstrativos = {
  dre: {
    receitaBruta: null,
    receitaLiquida: null,
    cmv: null,
    despesasOperacionais: null,
    depreciacaoAmortizacao: null,
    lucroOperacional: null,
    lucroLiquido: null,
  },
  balanco: {
    ativoCirculante: null,
    ativoNaoCirculante: null,
    ativoTotal: null,
    passivoCirculante: null,
    passivoNaoCirculante: null,
    passivoTotal: null,
    patrimonioLiquido: null,
    estoques: null,
    contasAReceber: null,
    fornecedores: null,
  },
  dfc: {
    fluxoOperacional: null,
    fluxoInvestimento: null,
    fluxoFinanciamento: null,
    saldoInicial: null,
    saldoFinal: null,
  },
}

let state: OnboardingState = {
  fluxo: null,
  setor: null,
  empresaNome: '',
  origemConfiabilidade: 'informado',
  demonstrativos: JSON.parse(JSON.stringify(initialDemonstrativos)),
  passoAtual: 1,
  passosTotais: 3,
  camposValidados: {},
}

const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const onboardingActions = {
  escolherFluxo: (fluxo: FluxoEscolhido) => {
    state = { ...state, fluxo }
    emit()
  },
  setSetor: (setor: string) => {
    state = { ...state, setor }
    emit()
  },
  setEmpresaNome: (empresaNome: string) => {
    state = { ...state, empresaNome }
    emit()
  },
  setOrigemConfiabilidade: (origem: 'estimado' | 'extraido' | 'informado') => {
    state = { ...state, origemConfiabilidade: origem }
    emit()
  },
  atualizarDRE: (patch: Partial<DRE>) => {
    state = {
      ...state,
      demonstrativos: { ...state.demonstrativos, dre: { ...state.demonstrativos.dre, ...patch } },
    }
    emit()
  },
  atualizarBalanco: (patch: Partial<Balanco>) => {
    state = {
      ...state,
      demonstrativos: {
        ...state.demonstrativos,
        balanco: { ...state.demonstrativos.balanco, ...patch },
      },
    }
    emit()
  },
  atualizarDFC: (patch: Partial<DFC>) => {
    state = {
      ...state,
      demonstrativos: { ...state.demonstrativos, dfc: { ...state.demonstrativos.dfc, ...patch } },
    }
    emit()
  },
  preencherDeExtracao: (d: Demonstrativos) => {
    state = { ...state, demonstrativos: JSON.parse(JSON.stringify(d)) }
    emit()
  },
  resetar: () => {
    state = {
      fluxo: null,
      setor: null,
      empresaNome: '',
      origemConfiabilidade: 'informado',
      demonstrativos: JSON.parse(JSON.stringify(initialDemonstrativos)),
      passoAtual: 1,
      passosTotais: 3,
      camposValidados: {},
    }
    emit()
  },
}

export function useOnboardingStore() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
  )
}
