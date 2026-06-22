import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Download, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useOnboardingStore,
  onboardingActions,
  Demonstrativos,
} from '@/stores/use-onboarding-store'

export default function TemplateFlow() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()

  const handleSimulateUpload = () => {
    onboardingActions.preencherDeExtracao({
      dre: { ...demonstrativos.dre, receitaLiquida: 200000, cmv: 80000, lucroLiquido: 40000 },
      balanco: {
        ...demonstrativos.balanco,
        ativoTotal: 600000,
        passivoTotal: 300000,
        patrimonioLiquido: 300000,
        ativoCirculante: 200000,
        passivoCirculante: 80000,
      },
      dfc: { ...demonstrativos.dfc },
    } as Demonstrativos)
    onboardingActions.setOrigemConfiabilidade('informado')
    navigate('/diagnostico')
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-100">Template Padrão</h1>
        <p className="text-slate-400">
          Trabalhe offline com nossa planilha formatada e faça upload com precisão garantida.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center space-y-4">
            <div className="p-4 bg-purple-500/10 rounded-full border border-purple-500/20">
              <Download className="h-10 w-10 text-purple-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-200">1. Baixe o Template</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Faça o download da nossa planilha Excel padronizada. Ela já possui as abas
              estruturadas para DRE, Balanço Patrimonial e DFC.
            </p>
            <Button
              variant="outline"
              className="mt-4 border-purple-500/50 text-purple-400 hover:bg-purple-500/10 bg-transparent"
            >
              Baixar Template.xlsx
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardContent className="p-8 text-center flex flex-col items-center h-full justify-center space-y-4">
            <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
              <UploadCloud className="h-10 w-10 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-slate-200">2. Faça o Upload</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O sistema fará a leitura determinística e exata de cada célula da sua planilha,
              garantindo que não haverá interpretação errônea.
            </p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSimulateUpload}
            >
              Importar Planilha Preenchida
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-200"
          onClick={() => navigate('/')}
        >
          Voltar para Escolha de Fluxo
        </Button>
      </div>
    </div>
  )
}
