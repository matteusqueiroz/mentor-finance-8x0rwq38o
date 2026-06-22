import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MoneyField } from '@/components/MoneyField'
import {
  useOnboardingStore,
  onboardingActions,
  Demonstrativos,
} from '@/stores/use-onboarding-store'

export default function Upload() {
  const { demonstrativos } = useOnboardingStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<'upload' | 'processing' | 'validation'>('upload')

  const handleUpload = () => {
    setStep('processing')
    setTimeout(() => {
      onboardingActions.preencherDeExtracao({
        dre: { ...demonstrativos.dre, receitaLiquida: 150000, cmv: 60000, lucroLiquido: 25000 },
        balanco: {
          ...demonstrativos.balanco,
          ativoTotal: 500000,
          passivoTotal: 300000,
          patrimonioLiquido: 200000,
          ativoCirculante: 180000,
          passivoCirculante: 90000,
        },
        dfc: { ...demonstrativos.dfc },
      } as Demonstrativos)
      setStep('validation')
    }, 2500)
  }

  const handleConfirm = () => {
    onboardingActions.setOrigemConfiabilidade('extraido')
    navigate('/diagnostico')
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-slate-100">Upload de Documento</h1>
        <p className="text-slate-400">Deixe a IA extrair os números para você.</p>
      </div>

      {step === 'upload' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-12 flex flex-col items-center text-center">
            <div
              className="w-full max-w-lg border-2 border-dashed border-slate-700 rounded-2xl p-12 bg-slate-900/50 hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={handleUpload}
            >
              <UploadCloud className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-200 mb-2">
                Clique para fazer upload ou arraste arquivos aqui
              </h3>
              <p className="text-sm text-slate-500">
                Formatos suportados: PDF, Excel, CSV (Máx. 25MB)
              </p>
              <Button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white">
                Selecionar Arquivo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'processing' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-20 flex flex-col items-center text-center animate-pulse">
            <FileText className="h-16 w-16 text-blue-500 mb-6" />
            <h3 className="text-xl font-medium text-slate-200 mb-2">
              A IA está processando seu documento...
            </h3>
            <p className="text-slate-500">
              Isolando e interpretando os dados. Isso leva apenas alguns segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {step === 'validation' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Validação Humana Obrigatória</h4>
              <p className="text-sm mt-1">
                Por favor, revise os dados extraídos pela IA. Corrija os valores incorretos e
                preencha os campos faltantes antes de prosseguir.
              </p>
            </div>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Campos Extraídos</CardTitle>
              <CardDescription>
                Revise os principais dados encontrados no documento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <MoneyField
                label="Receita Líquida (DRE)"
                value={demonstrativos.dre.receitaLiquida}
                onChange={(v) => onboardingActions.atualizarDRE({ receitaLiquida: v })}
              />
              <MoneyField
                label="CMV (DRE)"
                value={demonstrativos.dre.cmv}
                onChange={(v) => onboardingActions.atualizarDRE({ cmv: v })}
              />
              <MoneyField
                label="Lucro Líquido (DRE)"
                value={demonstrativos.dre.lucroLiquido}
                onChange={(v) => onboardingActions.atualizarDRE({ lucroLiquido: v })}
              />
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <MoneyField
                  label="Ativo Total (Balanço)"
                  value={demonstrativos.balanco.ativoTotal}
                  onChange={(v) => onboardingActions.atualizarBalanco({ ativoTotal: v })}
                />
                <MoneyField
                  label="Passivo Total (Balanço)"
                  value={demonstrativos.balanco.passivoTotal}
                  onChange={(v) => onboardingActions.atualizarBalanco({ passivoTotal: v })}
                />
                <MoneyField
                  label="Patrimônio Líquido (Balanço)"
                  value={demonstrativos.balanco.patrimonioLiquido}
                  onChange={(v) => onboardingActions.atualizarBalanco({ patrimonioLiquido: v })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800"
              onClick={() => setStep('upload')}
            >
              Refazer Upload
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              Confirmar Dados <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
