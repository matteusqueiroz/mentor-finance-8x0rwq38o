import { useEffect, useState, useMemo } from 'react'
import { Lightbulb, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOnboardingStore } from '@/stores/use-onboarding-store'
import { calcularKPIs, gerarDiagnosticoIA, Indicador } from '@/lib/motor-de-confianca'
import { Link } from 'react-router-dom'

export default function Diagnostico() {
  const { demonstrativos, origemConfiabilidade } = useOnboardingStore()
  const [isProcessing, setIsProcessing] = useState(true)
  const [diagnostico, setDiagnostico] = useState<{ narrativa: string; pontuacao: number } | null>(
    null,
  )

  const kpis = useMemo(() => calcularKPIs(demonstrativos), [demonstrativos])

  useEffect(() => {
    gerarDiagnosticoIA(kpis, origemConfiabilidade).then((res) => {
      setDiagnostico(res)
      setIsProcessing(false)
    })
  }, [kpis, origemConfiabilidade])

  const classColors = {
    otimo: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    bom: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    atencao: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    critico: 'text-red-400 bg-red-400/10 border-red-400/20',
    indisponivel: 'text-slate-400 bg-slate-800 border-slate-700',
  }

  const formatValue = (ind: Indicador) => {
    if (ind.valor === null) return 'N/D'
    if (ind.formato === 'percentual') return `${ind.valor.toFixed(1)}%`
    if (ind.formato === 'moeda')
      return `R$ ${ind.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    return ind.valor.toFixed(2)
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto py-6 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100">Diagnóstico IA</h1>
        <p className="text-slate-400 mt-1">
          Interpretado deterministicamente a partir de{' '}
          {origemConfiabilidade === 'extraido'
            ? 'documentos'
            : origemConfiabilidade === 'estimado'
              ? 'suas estimativas'
              : 'seus lançamentos'}
          .
        </p>
      </div>

      {isProcessing ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-16 flex flex-col items-center animate-pulse">
            <Lightbulb className="h-16 w-16 text-blue-500 mb-6" />
            <h3 className="text-xl font-medium text-slate-200">
              A IA está escrevendo o parecer...
            </h3>
            <p className="text-slate-500 mt-2">Isto não levará muito tempo.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 bg-slate-900 border-slate-800 h-max">
            <CardHeader className="bg-blue-500/5 pb-4 border-b border-slate-800 rounded-t-xl">
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Lightbulb className="h-5 w-5" />
                Parecer Estratégico
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex flex-col items-center justify-center h-24 w-24 rounded-full border-4 border-blue-500/30 text-blue-400 shrink-0 bg-blue-500/10">
                  <span className="text-3xl font-bold">{diagnostico?.pontuacao}</span>
                  <span className="text-xs mt-0.5">Health</span>
                </div>
                <div className="text-slate-300 leading-relaxed text-sm md:text-base text-center sm:text-left">
                  {diagnostico?.narrativa}
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl mt-4 border border-slate-700">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-amber-500">Nota:</strong> A IA não realiza cálculos. Todos
                  os indicadores apresentados foram computados de forma exata pelo Motor de
                  Confiança.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 flex flex-col h-max">
            <CardHeader className="pb-4 border-b border-slate-800">
              <CardTitle className="text-lg text-slate-200">Indicadores Calculados</CardTitle>
              <CardDescription className="text-slate-400">
                Gerados via Motor TypeScript
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-5 pt-4">
              {Object.values(kpis).map((ind, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1.5 pb-4 border-b border-slate-800/50 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-300">{ind.nome}</span>
                    <span className="text-sm font-semibold text-slate-100">{formatValue(ind)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span
                      className={`px-2 py-0.5 rounded border capitalize font-medium ${classColors[ind.classificacao]}`}
                    >
                      {ind.classificacao}
                    </span>
                    <span className="text-slate-500">{ind.referencia}</span>
                  </div>
                </div>
              ))}
            </CardContent>
            <div className="p-4 border-t border-slate-800">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Link to="/plano">
                  Ver Plano de Ação <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
