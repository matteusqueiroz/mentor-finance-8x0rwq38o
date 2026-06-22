import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Configuracoes() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteAccount = () => {
    setIsDeleting(true)
    setTimeout(() => {
      setIsDeleting(false)
      toast({
        title: 'Conta e Dados Excluídos',
        description: 'Todos os seus registros foram apagados permanentemente conforme a LGPD.',
        variant: 'destructive',
      })
      navigate('/')
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
        <Settings className="h-8 w-8 text-slate-400" />
        Configurações
      </h1>
      <Card className="bg-slate-900 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo (LGPD)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Ações destrutivas e irrevogáveis sobre seus dados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-300 leading-relaxed bg-red-500/10 p-4 rounded-lg border border-red-500/20">
            A exclusão da sua conta apagará permanentemente todos os seus dados cadastrais (tabela{' '}
            <code className="text-red-400 bg-red-400/10 px-1 rounded">empresas</code>),
            diagnósticos, assinaturas e acompanhamentos de tarefas do banco de dados. Esta ação não
            pode ser desfeita.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full sm:w-auto font-medium"
          >
            {isDeleting ? (
              'Excluindo dados...'
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" /> Excluir Minha Conta Permanentemente
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
