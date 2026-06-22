import { Link } from 'react-router-dom'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LayoutDashboard,
  FileBarChart,
  CheckSquare,
  Wallet,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export default function Index() {
  const options = [
    {
      title: 'Diagnóstico por IA',
      description:
        'Faça um raio-x das suas finanças e descubra a saúde do seu negócio de forma automatizada.',
      icon: FileBarChart,
      href: '/diagnostico',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Dashboard de Resultados',
      description: 'Acompanhe seus KPIs, receitas, despesas, lucro e fluxo de caixa em tempo real.',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Plano de Ação Inteligente',
      description: 'Siga as recomendações baseadas em dados sugeridas pelo seu consultor IA.',
      icon: CheckSquare,
      href: '/plano',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Organização Financeira',
      description: 'Gerencie e categorize suas movimentações, controlando o seu orçamento diário.',
      icon: Wallet,
      href: '/organizacao',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
  ]

  return (
    <div className="space-y-8 animate-slide-up flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] max-w-4xl mx-auto text-center py-10">
      <div className="space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-2 ring-8 ring-primary/5">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Bem-vindo ao seu <span className="text-primary">Consultor IA</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto pt-2">
          Sua jornada para uma gestão financeira mais inteligente começa aqui. Escolha uma das
          opções abaixo para iniciar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-10">
        {options.map((option) => (
          <Link key={option.title} to={option.href} className="group outline-none block">
            <Card className="h-full shadow-sm border-border/50 hover:border-primary/50 hover:shadow-elevation transition-all duration-300 text-left bg-card hover:bg-accent/10">
              <CardHeader className="p-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110 ${option.bg}`}
                >
                  <option.icon className={`h-7 w-7 ${option.color}`} />
                </div>
                <CardTitle className="text-xl flex items-center justify-between">
                  {option.title}
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1.5 transition-all" />
                </CardTitle>
                <CardDescription className="text-base mt-2 leading-relaxed">
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
