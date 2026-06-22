import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoneyField } from '@/components/MoneyField'
import { useOnboardingStore, onboardingActions } from '@/stores/use-onboarding-store'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function Profissional() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    const { balanco } = demonstrativos
    const ativoTotal = balanco.ativoTotal || 0
    const passivoTotal = balanco.passivoTotal || 0
    const pl = balanco.patrimonioLiquido || 0

    const diferenca = Math.abs(ativoTotal - (passivoTotal + pl))
    const limite = ativoTotal * 0.01

    if (ativoTotal > 0 && diferenca > limite) {
      setError(
        `A equação patrimonial não fecha. Ativo Total (R$ ${ativoTotal}) difere de Passivo + PL (R$ ${passivoTotal + pl}).`,
      )
      return
    }

    setError(null)
    onboardingActions.setOrigemConfiabilidade('informado')
    navigate('/diagnostico')
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Modo Profissional</h1>
        <p className="text-slate-400">
          Preencha seus demonstrativos financeiros detalhados para uma análise completa e precisa.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-100">Balanço Patrimonial</CardTitle>
            <CardDescription>Posição financeira num dado momento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MoneyField
              label="Ativo Circulante"
              value={demonstrativos.balanco.ativoCirculante}
              onChange={(v) => onboardingActions.atualizarBalanco({ ativoCirculante: v })}
            />
            <MoneyField
              label="Ativo Não Circulante"
              value={demonstrativos.balanco.ativoNaoCirculante}
              onChange={(v) => onboardingActions.atualizarBalanco({ ativoNaoCirculante: v })}
            />
            <div className="pt-4 border-t border-slate-800">
              <MoneyField
                label="Ativo Total"
                value={demonstrativos.balanco.ativoTotal}
                onChange={(v) => onboardingActions.atualizarBalanco({ ativoTotal: v })}
              />
            </div>
            <div className="h-2" />
            <MoneyField
              label="Passivo Circulante"
              value={demonstrativos.balanco.passivoCirculante}
              onChange={(v) => onboardingActions.atualizarBalanco({ passivoCirculante: v })}
            />
            <MoneyField
              label="Passivo Não Circulante"
              value={demonstrativos.balanco.passivoNaoCirculante}
              onChange={(v) => onboardingActions.atualizarBalanco({ passivoNaoCirculante: v })}
            />
            <div className="pt-4 border-t border-slate-800">
              <MoneyField
                label="Passivo Total"
                value={demonstrativos.balanco.passivoTotal}
                onChange={(v) => onboardingActions.atualizarBalanco({ passivoTotal: v })}
              />
            </div>
            <div className="h-2" />
            <MoneyField
              label="Patrimônio Líquido"
              value={demonstrativos.balanco.patrimonioLiquido}
              onChange={(v) => onboardingActions.atualizarBalanco({ patrimonioLiquido: v })}
            />
            <div className="h-2" />
            <MoneyField
              label="Estoques"
              value={demonstrativos.balanco.estoques}
              onChange={(v) => onboardingActions.atualizarBalanco({ estoques: v })}
            />
            <MoneyField
              label="Contas a Receber"
              value={demonstrativos.balanco.contasAReceber}
              onChange={(v) => onboardingActions.atualizarBalanco({ contasAReceber: v })}
            />
            <MoneyField
              label="Fornecedores"
              value={demonstrativos.balanco.fornecedores}
              onChange={(v) => onboardingActions.atualizarBalanco({ fornecedores: v })}
            />
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">DRE (Resultados)</CardTitle>
              <CardDescription>Fluxo de receitas e despesas no período.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Receita Bruta"
                value={demonstrativos.dre.receitaBruta}
                onChange={(v) => onboardingActions.atualizarDRE({ receitaBruta: v })}
              />
              <MoneyField
                label="Receita Líquida"
                value={demonstrativos.dre.receitaLiquida}
                onChange={(v) => onboardingActions.atualizarDRE({ receitaLiquida: v })}
              />
              <MoneyField
                label="CMV / Custo"
                value={demonstrativos.dre.cmv}
                onChange={(v) => onboardingActions.atualizarDRE({ cmv: v })}
              />
              <MoneyField
                label="Despesas Operacionais"
                value={demonstrativos.dre.despesasOperacionais}
                onChange={(v) => onboardingActions.atualizarDRE({ despesasOperacionais: v })}
              />
              <MoneyField
                label="Depreciação e Amortização"
                value={demonstrativos.dre.depreciacaoAmortizacao}
                onChange={(v) => onboardingActions.atualizarDRE({ depreciacaoAmortizacao: v })}
              />
              <div className="pt-4 border-t border-slate-800">
                <MoneyField
                  label="Lucro Operacional (EBIT)"
                  value={demonstrativos.dre.lucroOperacional}
                  onChange={(v) => onboardingActions.atualizarDRE({ lucroOperacional: v })}
                />
                <MoneyField
                  label="Lucro Líquido"
                  value={demonstrativos.dre.lucroLiquido}
                  onChange={(v) => onboardingActions.atualizarDRE({ lucroLiquido: v })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Fluxo de Caixa (DFC)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Fluxo Operacional"
                value={demonstrativos.dfc.fluxoOperacional}
                onChange={(v) => onboardingActions.atualizarDFC({ fluxoOperacional: v })}
              />
              <MoneyField
                label="Saldo Final (Tesouraria)"
                value={demonstrativos.dfc.saldoFinal}
                onChange={(v) => onboardingActions.atualizarDFC({ saldoFinal: v })}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-slate-800 pt-6">
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800"
          onClick={() => navigate('/')}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
          Validar e Gerar Diagnóstico <CheckCircle2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
