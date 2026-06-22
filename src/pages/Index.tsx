import { Link } from 'react-router-dom'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadCloud, Lightbulb, Briefcase, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { onboardingActions } from '@/stores/use-onboarding-store'

export default function Index() {
  const options = [
    {
      id: 'upload',
      title: 'Upload de Documento',
      selo: 'Sem digitação',
      description:
        'Envie sua DRE, Balanço, DFC ou planilha. A IA extrai os dados — você só valida e confirma.',
      icon: UploadCloud,
      href: '/onboarding/upload',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      id: 'estimativa',
      title: 'Estimativa',
      selo: 'Modo Simples',
      description:
        'Você toca o negócio no dia a dia, mas os números não estão organizados. Construímos a partir do que você estima.',
      icon: Lightbulb,
      href: '/onboarding/estimativa',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      id: 'profissional',
      title: 'Profissional',
      selo: 'Modo Avançado',
      description:
        'Você domina seus números. Análise completa com Fleuriet, ciclo financeiro e estrutura de capital.',
      icon: Briefcase,
      href: '/onboarding/profissional',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      id: 'template',
      title: 'Template Padrão',
      selo: 'Download incluso',
      description: 'Baixe nossa planilha padronizada, preencha e importe com um clique.',
      icon: FileSpreadsheet,
      href: '/onboarding/template',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] max-w-5xl mx-auto py-10 px-4">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-100">
          Bem-vindo ao <span className="text-blue-500">MentorFinance</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Como você prefere começar? Escolha a forma mais fácil para você inserir os dados do seu
          negócio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {options.map((option) => (
          <Link
            key={option.id}
            to={option.href}
            className="group outline-none block"
            onClick={() => onboardingActions.escolherFluxo(option.id as any)}
          >
            <Card className="h-full relative overflow-hidden shadow-none border-slate-800 bg-slate-900/50 hover:bg-slate-800/50 hover:border-slate-600 transition-all duration-300">
              <div
                className={`absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg border-b border-l ${option.bg} ${option.color} ${option.borderColor}`}
              >
                {option.selo}
              </div>
              <CardHeader className="p-6 md:p-8">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${option.bg}`}
                >
                  <option.icon className={`h-7 w-7 ${option.color}`} />
                </div>
                <CardTitle className="text-xl md:text-2xl text-slate-100 flex items-center justify-between mb-3">
                  {option.title}
                  <ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-blue-500 group-hover:translate-x-1.5 transition-all" />
                </CardTitle>
                <CardDescription className="text-base text-slate-400 leading-relaxed">
                  {option.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
