import { Demonstrativos } from '@/stores/use-onboarding-store'

export type Classificacao = 'otimo' | 'bom' | 'atencao' | 'critico' | 'indisponivel'

export interface Indicador {
  nome: string
  valor: number | null
  classificacao: Classificacao
  metodologia: string
  referencia: string
  benchmarkSetorial: number | null
  formato: 'percentual' | 'moeda' | 'numero' | 'dias' | 'texto'
}

function segurancaDivisao(num: number | null, den: number | null): number | null {
  if (num === null || den === null || den === 0) return null
  return num / den
}

export function calcularKPIs(d: Demonstrativos): Record<string, Indicador> {
  const kpis: Record<string, Indicador> = {}

  // 1. Rentabilidade
  const lucroLiq = d.dre.lucroLiquido
  const recLiq = d.dre.receitaLiquida
  const margemLiquidaVal = segurancaDivisao(lucroLiq, recLiq)
  kpis['margemLiquida'] = {
    nome: 'Margem Líquida',
    valor: margemLiquidaVal !== null ? margemLiquidaVal * 100 : null,
    classificacao:
      margemLiquidaVal !== null
        ? margemLiquidaVal > 0.15
          ? 'otimo'
          : margemLiquidaVal > 0.05
            ? 'bom'
            : 'atencao'
        : 'indisponivel',
    metodologia: 'Lucratividade Final',
    referencia: 'Gitman (2012)',
    benchmarkSetorial: 15,
    formato: 'percentual',
  }

  const pl = d.balanco.patrimonioLiquido
  const roe = segurancaDivisao(lucroLiq, pl)
  kpis['roe'] = {
    nome: 'ROE (Retorno sobre PL)',
    valor: roe !== null ? roe * 100 : null,
    classificacao:
      roe !== null ? (roe > 0.2 ? 'otimo' : roe > 0.05 ? 'bom' : 'atencao') : 'indisponivel',
    metodologia: 'Retorno ao Acionista',
    referencia: 'Assaf Neto (2014)',
    benchmarkSetorial: 20,
    formato: 'percentual',
  }

  // 2. Liquidez e Endividamento
  const ac = d.balanco.ativoCirculante
  const pc = d.balanco.passivoCirculante
  const liqCorrente = segurancaDivisao(ac, pc)
  kpis['liquidezCorrente'] = {
    nome: 'Liquidez Corrente',
    valor: liqCorrente,
    classificacao:
      liqCorrente !== null
        ? liqCorrente > 1.2
          ? 'otimo'
          : liqCorrente < 1
            ? 'critico'
            : 'atencao'
        : 'indisponivel',
    metodologia: 'Liquidez de Curto Prazo',
    referencia: 'Matarazzo (2010)',
    benchmarkSetorial: 1.5,
    formato: 'numero',
  }

  const passivoTotal = d.balanco.passivoTotal
  const ativoTotal = d.balanco.ativoTotal
  const endividamentoGeral = segurancaDivisao(passivoTotal, ativoTotal)
  kpis['endividamentoGeral'] = {
    nome: 'Endividamento Geral',
    valor: endividamentoGeral !== null ? endividamentoGeral * 100 : null,
    classificacao:
      endividamentoGeral !== null
        ? endividamentoGeral < 0.5
          ? 'otimo'
          : endividamentoGeral > 0.7
            ? 'critico'
            : 'atencao'
        : 'indisponivel',
    metodologia: 'Estrutura de Capital',
    referencia: 'Matarazzo (2010)',
    benchmarkSetorial: 50,
    formato: 'percentual',
  }

  // 3. Fleuriet
  const ncg = (ac || 0) - (d.balanco.fornecedores || 0)
  const cdg =
    (pl || 0) + (d.balanco.passivoNaoCirculante || 0) - (d.balanco.ativoNaoCirculante || 0)
  const tesouraria = cdg - ncg

  let tipoFleuriet = 1
  if (cdg > 0 && ncg > 0 && tesouraria > 0) tipoFleuriet = 1
  else if (cdg > 0 && ncg > 0 && tesouraria < 0) tipoFleuriet = 4
  else if (cdg < 0 && ncg > 0 && tesouraria < 0) tipoFleuriet = 6

  kpis['tesouraria'] = {
    nome: 'Tesouraria (Saldo)',
    valor: tesouraria,
    classificacao: tesouraria > 0 ? 'otimo' : tesouraria === 0 ? 'indisponivel' : 'critico',
    metodologia: 'Capital de Giro Dinâmico',
    referencia: 'Fleuriet (2003)',
    benchmarkSetorial: null,
    formato: 'moeda',
  }

  return kpis
}

// Edge function MOCK
export async function gerarDiagnosticoIA(kpis: Record<string, Indicador>, origem: string) {
  return new Promise<{ narrativa: string; pontuacao: number }>((resolve) => {
    setTimeout(() => {
      const tom =
        origem === 'estimado' ? 'com base nas suas estimativas' : 'com base nos dados informados'
      resolve({
        narrativa: `Olá! Analisei seus números ${tom}. Sua empresa apresenta uma Margem Líquida de ${kpis.margemLiquida.valor?.toFixed(1) || '--'}%, o que indica um cenário ${kpis.margemLiquida.classificacao}. A Liquidez Corrente está em ${kpis.liquidezCorrente.valor?.toFixed(2) || '--'}, indicando ${kpis.liquidezCorrente.valor && kpis.liquidezCorrente.valor > 1 ? 'boa capacidade' : 'risco'} para honrar com obrigações de curto prazo.`,
        pontuacao: kpis.margemLiquida.valor && kpis.margemLiquida.valor > 10 ? 85 : 60,
      })
    }, 2000)
  })
}
