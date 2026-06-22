import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'

export default function Privacidade() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-6">
      <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-blue-500" />
        Política de Privacidade
      </h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Adequação à LGPD</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-slate-400 leading-relaxed text-sm md:text-base">
          <p>
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD), asseguramos que todas as
            suas informações financeiras são tratadas com sigilo e segurança, utilizando o padrão de
            isolamento <strong className="text-slate-200">RLS (Row Level Security)</strong> em nosso
            banco de dados.
          </p>
          <p>
            <strong className="text-slate-200">1. Coleta de Dados:</strong> Coletamos dados
            inseridos ativamente nos fluxos de Onboarding ou extraídos de documentos enviados sob o
            seu consentimento estrito.
          </p>
          <p>
            <strong className="text-slate-200">2. Finalidade e Inteligência Artificial:</strong> Os
            dados são usados exclusivamente para cálculos determinísticos e posterior análise
            interpretativa feita por Inteligência Artificial. Garantimos contratualmente que a IA
            não retém seus dados para treinar modelos de base.
          </p>
          <p>
            <strong className="text-slate-200">
              3. Exclusão de Dados (Direito ao Esquecimento):
            </strong>{' '}
            Você possui o direito ao esquecimento. Pode solicitar ou executar a exclusão total da
            sua conta e de todos os registros a qualquer momento na página de Configurações.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
