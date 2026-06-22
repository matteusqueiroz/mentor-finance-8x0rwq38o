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
import { Save } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface SimulatorTabProps {
  baseValuation: number
  onSaveValuation: (newValuation: number) => void
}

export function SimulatorTab({ baseValuation, onSaveValuation }: SimulatorTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [revenueVar, setRevenueVar] = useState(0)
  const [costVar, setCostVar] = useState(0)
  const [expenseVar, setExpenseVar] = useState(0)

  const simulatedValuation = Math.max(
    0,
    baseValuation * (1 + revenueVar / 100 - costVar / 100 - expenseVar / 100),
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
        premissas: { type: 'simulacao', revenueVar, costVar, expenseVar },
        resultado: { valor_empresa: simulatedValuation, ebitda_estimado: 0, multiplo: 0 } as any,
      })

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Cenário salvo como novo valuation!' })

      onSaveValuation(simulatedValuation)
      setRevenueVar(0)
      setCostVar(0)
      setExpenseVar(0)
    } catch (e) {
      toast({ title: 'Erro', description: 'Erro ao salvar simulação', variant: 'destructive' })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Simulador de Variáveis</CardTitle>
          <CardDescription>Ajuste os controles para ver o impacto no Valuation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Crescimento de Receita</Label>
              <span className="text-sm font-medium text-emerald-500">{revenueVar}%</span>
            </div>
            <Slider
              value={[revenueVar]}
              onValueChange={([v]) => setRevenueVar(v)}
              min={-50}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Aumento de Custos</Label>
              <span className="text-sm font-medium text-red-500">{costVar}%</span>
            </div>
            <Slider
              value={[costVar]}
              onValueChange={([v]) => setCostVar(v)}
              min={-50}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Aumento de Despesas</Label>
              <span className="text-sm font-medium text-orange-500">{expenseVar}%</span>
            </div>
            <Slider
              value={[expenseVar]}
              onValueChange={([v]) => setExpenseVar(v)}
              min={-50}
              max={100}
              step={1}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 bg-gradient-to-br from-background to-secondary/10">
        <CardHeader>
          <CardTitle>Comparativo de Valuation</CardTitle>
          <CardDescription>Valuation Atual vs Cenário Projetado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Valuation Atual Base</p>
            <p className="text-2xl font-bold text-foreground">
              {baseValuation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <p className="text-sm font-medium">Valuation Projetado (What-If)</p>
              <p
                className={cn(
                  'text-3xl font-black',
                  simulatedValuation >= baseValuation ? 'text-emerald-500' : 'text-red-500',
                )}
              >
                {simulatedValuation.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <Progress
              value={
                baseValuation > 0 ? Math.min(100, (simulatedValuation / baseValuation) * 50) : 0
              }
              className="h-2"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar como Novo Valuation
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
