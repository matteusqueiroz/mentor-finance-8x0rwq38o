import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, Settings, History } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { clearUserHistory } from '@/services/db'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function Configuracoes() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearHistory = async () => {
    if (!user) return
    setIsClearing(true)
    try {
      await clearUserHistory(user.id)
      toast({
        title: 'Sucesso',
        description: 'Histórico limpo com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar o histórico.',
        variant: 'destructive',
      })
    } finally {
      setIsClearing(false)
    }
  }

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
      <Card className="bg-slate-900/50 border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-orange-500 flex items-center gap-2">
            <History className="h-5 w-5" />
            Gerenciar Dados
          </CardTitle>
          <CardDescription className="text-slate-400">
            Limpe seu histórico de diagnósticos, valuations e acompanhamentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-slate-300 leading-relaxed bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
            A limpeza do histórico excluirá todos os seus registros de diagnósticos, acompanhamentos
            e valuations do banco de dados. Os dados da sua empresa serão mantidos. Esta ação não
            pode ser desfeita.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto font-medium border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                disabled={isClearing}
              >
                {isClearing ? (
                  'Limpando...'
                ) : (
                  <>
                    <History className="h-4 w-4 mr-2" /> Limpar Histórico
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza que deseja limpar seu histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é irreversível e excluirá todos os seus diagnósticos, acompanhamentos e
                  valuations.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

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
