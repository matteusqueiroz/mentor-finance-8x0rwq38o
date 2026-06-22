import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Save, TrendingUp, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/hooks/use-subscription'
import { SubscriptionLock } from '@/components/SubscriptionLock'

interface SimulatorTabProps {
  baseValuation: number
  onSaveValuation: (newValuation: number) => void
}

export function SimulatorTab({ baseValuation, onSaveValuation }: SimulatorTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const { isActive, isLoading } = useSubscription()

  const [priceVar, setPriceVar] = useState(0)
  const [volumeVar, setVolumeVar] = useState(0)
  const [costVar, setCostVar] = useState(0)
  const [expenseVar, setExpenseVar] = useState(0)
  const [pmpVar, setPmpVar] = useState(0)
  const [pmrVar, setPmrVar] = useState(0)
  const [pmeVar, setPmeVar] = useState(0)

  const revenueFactor = (1 + priceVar / 100) * (1 + volumeVar / 100)
  const costFactor = 1 + costVar / 100
  const expenseFactor = 1 + expenseVar / 100
  const workingCapitalFactor = 1 + (pmpVar * 0.5 - pmrVar * 0.8 - pmeVar * 0.4) / 100

  const simulatedValuation = Math.max(
    0,
    baseValuation * (revenueFactor - costFactor * 0.4 - expenseFactor * 0.3) * workingCapitalFactor,
  )

  const handleSave = async () => {
    try {
      const { data: companyData } = await supabase
        .from('empresas')
        .select('id')
        .eq('user_id', user!.id)
        .limit(1)
      const companyId = companyData?.[0]?.id

      const { error } = await supabase.from('valuations').insert({
        user_id: user!.id,
        empresa_id: companyId,
        premissas: {
          type: 'simulacao_avancada',
          priceVar,
          volumeVar,
          costVar,
          expenseVar,
          pmpVar,
          pmrVar,
          pmeVar,
        },
        resultado: { valor_empresa: simulatedValuation, ebitda_estimado: 0, multiplo: 0 } as any,
      })

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Cenário avançado salvo!' })

      onSaveValuation(simulatedValuation)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao salvar simulação', variant: 'destructive' })
    }
  }

  return (
    <SubscriptionLock isActive={isActive} isLoading={isLoading}>
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Simulador Financeiro e Operacional</CardTitle>
            <CardDescription>
              Ajuste os controles operacionais e prazos para ver o impacto projetado no Valor da
              Empresa e Fluxo de Caixa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-semibold flex items-center gap-2 text-primary">
                  <TrendingUp className="w-4 h-4" /> Receitas e Custos
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Preço de Venda
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        priceVar > 0 ? 'text-emerald-500' : priceVar < 0 ? 'text-red-500' : '',
                      )}
                    >
                      {priceVar}%
                    </span>
                  </div>
                  <Slider
                    value={[priceVar]}
                    onValueChange={([v]) => setPriceVar(v)}
                    min={-30}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Volume de Vendas
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        volumeVar > 0 ? 'text-emerald-500' : volumeVar < 0 ? 'text-red-500' : '',
                      )}
                    >
                      {volumeVar}%
                    </span>
                  </div>
                  <Slider
                    value={[volumeVar]}
                    onValueChange={([v]) => setVolumeVar(v)}
                    min={-50}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Custos Variáveis
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        costVar > 0 ? 'text-red-500' : costVar < 0 ? 'text-emerald-500' : '',
                      )}
                    >
                      {costVar}%
                    </span>
                  </div>
                  <Slider
                    value={[costVar]}
                    onValueChange={([v]) => setCostVar(v)}
                    min={-30}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Despesas Fixas
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        expenseVar > 0 ? 'text-red-500' : expenseVar < 0 ? 'text-emerald-500' : '',
                      )}
                    >
                      {expenseVar}%
                    </span>
                  </div>
                  <Slider
                    value={[expenseVar]}
                    onValueChange={([v]) => setExpenseVar(v)}
                    min={-30}
                    max={50}
                    step={1}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold flex items-center gap-2 text-blue-500">
                  <Clock className="w-4 h-4" /> Prazos e Capital de Giro
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Prazo Méd. Recebimento (PMR)
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        pmrVar < 0 ? 'text-emerald-500' : pmrVar > 0 ? 'text-red-500' : '',
                      )}
                    >
                      {pmrVar} dias
                    </span>
                  </div>
                  <Slider
                    value={[pmrVar]}
                    onValueChange={([v]) => setPmrVar(v)}
                    min={-60}
                    max={60}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">Tempo para receber clientes.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Prazo Méd. Pagamento (PMP)
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        pmpVar > 0 ? 'text-emerald-500' : pmpVar < 0 ? 'text-red-500' : '',
                      )}
                    >
                      {pmpVar} dias
                    </span>
                  </div>
                  <Slider
                    value={[pmpVar]}
                    onValueChange={([v]) => setPmpVar(v)}
                    min={-60}
                    max={60}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">Tempo para pagar fornecedores.</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="font-semibold text-slate-700 dark:text-slate-300">
                      Prazo Méd. Estoque (PME)
                    </Label>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        pmeVar < 0 ? 'text-emerald-500' : pmeVar > 0 ? 'text-red-500' : '',
                      )}
                    >
                      {pmeVar} dias
                    </span>
                  </div>
                  <Slider
                    value={[pmeVar]}
                    onValueChange={([v]) => setPmeVar(v)}
                    min={-60}
                    max={60}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">Tempo que o estoque fica parado.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50 bg-gradient-to-br from-background to-secondary/10 h-fit">
          <CardHeader>
            <CardTitle>Impacto Projetado</CardTitle>
            <CardDescription>Valuation Atual vs Cenário Simulado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">
                Valuation Atual Base
              </p>
              <p className="text-3xl font-bold text-foreground">
                {baseValuation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  Valuation Simulado (What-If)
                </p>
                <p
                  className={cn(
                    'text-4xl font-black transition-colors',
                    simulatedValuation > baseValuation
                      ? 'text-emerald-500'
                      : simulatedValuation < baseValuation
                        ? 'text-red-500'
                        : 'text-foreground',
                  )}
                >
                  {simulatedValuation.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>

              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Evolução</span>
                  <span
                    className={
                      simulatedValuation > baseValuation ? 'text-emerald-500' : 'text-red-500'
                    }
                  >
                    {baseValuation > 0
                      ? ((simulatedValuation / baseValuation - 1) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    baseValuation > 0 ? Math.min(100, (simulatedValuation / baseValuation) * 50) : 0
                  }
                  className={cn(
                    'h-2',
                    simulatedValuation > baseValuation
                      ? '[&>div]:bg-emerald-500'
                      : '[&>div]:bg-red-500',
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSave}
              className="w-full h-12 text-md font-semibold"
              variant={simulatedValuation > baseValuation ? 'default' : 'secondary'}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Cenário
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SubscriptionLock>
  )
}
