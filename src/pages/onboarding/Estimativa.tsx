import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MoneyField } from '@/components/MoneyField'
import { useOnboardingStore, onboardingActions } from '@/stores/use-onboarding-store'
import { Lightbulb, ArrowRight } from 'lucide-react'

export default function Estimativa() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()

  const handleSave = () => {
    onboardingActions.setOrigemConfiabilidade('estimado')
    navigate('/diagnostico')
  }

  const { dre, balanco } = demonstrativos

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded-full bg-amber-500/10 mb-2">
          <Lightbulb className="h-8 w-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-100">Modo Simples (Estimativa)</h1>
        <p className="text-slate-400">
          Responda algumas perguntas rápidas sobre o dia a dia do seu negócio. Não precisa de
          exatidão.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl">
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">
              1. Quanto você faturou no último mês, mais ou menos?
            </h3>
            <MoneyField
              label="Faturamento Estimado"
              value={dre.receitaBruta}
              onChange={(v) => {
                onboardingActions.atualizarDRE({
                  receitaBruta: v,
                  receitaLiquida: v ? v * 0.9 : null,
                })
              }}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">
              2. Quanto custou para produzir ou comprar o que você vendeu?
            </h3>
            <MoneyField
              label="Custo Direto Estimado"
              value={dre.cmv}
              onChange={(v) => onboardingActions.atualizarDRE({ cmv: v })}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">
              3. Depois de pagar todas as contas, quanto costuma sobrar?
            </h3>
            <MoneyField
              label="Sobra Mensal Estimada"
              value={dre.lucroLiquido}
              onChange={(v) => onboardingActions.atualizarDRE({ lucroLiquido: v })}
            />
            {dre.receitaBruta && dre.lucroLiquido && dre.lucroLiquido > dre.receitaBruta && (
              <p className="text-xs text-amber-400 mt-2 font-medium">
                Aviso: A sobra informada é maior que o faturamento.
              </p>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-8">
            <h3 className="text-lg font-medium text-slate-200">
              4. Você sabe qual é o valor aproximado do seu estoque hoje?
            </h3>
            <MoneyField
              label="Valor em Estoque Estimado"
              value={balanco.estoques}
              onChange={(v) => onboardingActions.atualizarBalanco({ estoques: v })}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-200">
              5. Quanto os clientes ainda devem para você no total?
            </h3>
            <MoneyField
              label="Contas a Receber Estimadas"
              value={balanco.contasAReceber}
              onChange={(v) => onboardingActions.atualizarBalanco({ contasAReceber: v })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800"
          onClick={() => navigate('/')}
        >
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
          Ver Meu Diagnóstico <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
