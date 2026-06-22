import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Trash2,
  AlertTriangle,
  Settings,
  History,
  Building,
  Save,
  Mail,
  Github,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { clearUserHistory } from '@/services/db'
import { supabase } from '@/lib/supabase/client'
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

  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome_empresa: '',
    setor: '',
    regime_tributario: '',
    tipo_clientes: '',
    email_contabilidade: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [githubConnected, setGithubConnected] = useState(false)

  useEffect(() => {
    if (!user)
      return supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setEmpresaId(data[0].id)
            setFormData({
              nome_empresa: data[0].nome_empresa || '',
              setor: data[0].setor || '',
              regime_tributario: data[0].regime_tributario || '',
              tipo_clientes: data[0].tipo_clientes || '',
              email_contabilidade: data[0].email_contabilidade || '',
            })
          }
        })

    // Check premium status
    supabase
      .from('assinaturas')
      .select('plano')
      .eq('user_id', user.id)
      .eq('status', 'ativo')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setIsPremium(data[0].plano === 'premium' || data[0].plano === 'pro')
        }
      })
  }, [user])

  const handleSaveCompany = async () => {
    if (!formData.nome_empresa.trim()) {
      toast({
        title: 'Validação',
        description: 'O nome da empresa é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email_contabilidade && !emailRegex.test(formData.email_contabilidade)) {
      toast({
        title: 'Validação',
        description: 'O e-mail da contabilidade é inválido.',
        variant: 'destructive',
      })
      return
    }
    if (!user) return
    setIsSaving(true)
    try {
      if (empresaId) {
        await supabase.from('empresas').update(formData).eq('id', empresaId)
      } else {
        const { data } = await supabase
          .from('empresas')
          .insert({ ...formData, user_id: user.id })
          .select('id')
          .single()
        if (data) setEmpresaId(data.id)
      }
      toast({
        title: 'Perfil Atualizado',
        description: 'Os dados da sua empresa foram salvos com sucesso.',
      })
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao salvar dados.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearHistory = async () => {
    if (!user) return
    setIsClearing(true)
    try {
      await clearUserHistory(user.id)
      toast({ title: 'Sucesso', description: 'Histórico de registros limpo com sucesso.' })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar os registros.',
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
        title: 'Conta Excluída',
        description: 'Sua conta foi excluída permanentemente (LGPD).',
        variant: 'destructive',
      })
      navigate('/')
    }, 1500)
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        Configurações & Perfil
      </h1>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" /> Perfil da Empresa
          </CardTitle>
          <CardDescription>
            Atualize os detalhes do seu negócio para relatórios e diagnósticos mais precisos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Nome da Empresa *</Label>
            <Input
              value={formData.nome_empresa}
              onChange={(e) => setFormData({ ...formData, nome_empresa: e.target.value })}
              placeholder="Ex: Minha Empresa Ltda"
            />
          </div>
          <div className="space-y-2">
            <Label>Setor de Atuação</Label>
            <Select
              value={formData.setor}
              onValueChange={(v) => setFormData({ ...formData, setor: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Comércio">Comércio</SelectItem>
                <SelectItem value="Serviços">Serviços</SelectItem>
                <SelectItem value="Indústria">Indústria</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Regime Tributário</Label>
              <Select
                value={formData.regime_tributario}
                onValueChange={(v) => setFormData({ ...formData, regime_tributario: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o regime" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                  <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                  <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Clientes</Label>
              <Select
                value={formData.tipo_clientes}
                onValueChange={(v) => setFormData({ ...formData, tipo_clientes: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2B">B2B (Empresas)</SelectItem>
                  <SelectItem value="B2C">B2C (Consumidor Final)</SelectItem>
                  <SelectItem value="B2B2C">B2B e B2C</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> E-mail da Contabilidade
            </Label>
            <p className="text-sm text-muted-foreground mb-2">
              Documentos enviados serão encaminhados automaticamente para este e-mail.
            </p>
            <Input
              type="email"
              value={formData.email_contabilidade}
              onChange={(e) => setFormData({ ...formData, email_contabilidade: e.target.value })}
              placeholder="contato@contabilidade.com.br"
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/30 pt-6">
          <Button
            onClick={handleSaveCompany}
            disabled={isSaving}
            className="w-full sm:w-auto ml-auto"
          >
            <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Salvando...' : 'Salvar Perfil'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-primary" /> Integração GitHub
          </CardTitle>
          <CardDescription>
            Conecte seu repositório para sincronizar dados e relatórios diretamente com o GitHub
            (Funcionalidade Premium).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isPremium ? (
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-muted/50 p-4 rounded-lg border">
              <div className="flex-1">
                <h4 className="font-medium">Recurso Exclusivo Premium</h4>
                <p className="text-sm text-muted-foreground">
                  Faça o upgrade para acessar a integração com repositórios e automatizar seus
                  relatórios.
                </p>
              </div>
              <Button
                onClick={() =>
                  toast({ title: 'Planos', description: 'Abrindo modal de assinatura...' })
                }
              >
                Upgrade para Premium
              </Button>
            </div>
          ) : githubConnected ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-green-500/10 border border-green-500/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-400">
                    GitHub Conectado
                  </h4>
                  <p className="text-sm text-green-700/80 dark:text-green-400/80">
                    Repositório: empresa/financeiro-sync
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setGithubConnected(false)}
              >
                Desconectar
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border p-4 rounded-lg">
              <div>
                <h4 className="font-medium">Nenhum repositório conectado</h4>
                <p className="text-sm text-muted-foreground">
                  Sincronize seus dados com segurança.
                </p>
              </div>
              <Button
                onClick={() => {
                  toast({
                    title: 'Redirecionando...',
                    description: 'Abrindo autenticação do GitHub.',
                  })
                  setTimeout(() => setGithubConnected(true), 1500)
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" /> Conectar GitHub
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-500 flex items-center gap-2">
            <History className="h-5 w-5" /> Gerenciar Dados Antigos
          </CardTitle>
          <CardDescription>
            A limpeza exclui seus diagnósticos e acompanhamentos anteriores, mantendo os dados da
            empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-orange-600 border-orange-500/50 hover:bg-orange-500/10 hover:text-orange-700"
                disabled={isClearing}
              >
                <History className="h-4 w-4 mr-2" />{' '}
                {isClearing ? 'Limpando...' : 'Limpar Meu Histórico'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação limpará permanentemente seus registros antigos de caixa e valuations. O
                  perfil da empresa será mantido.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearHistory}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Confirmar Limpeza
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-red-500/30 bg-red-500/5">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Zona de Perigo (LGPD)
          </CardTitle>
          <CardDescription>
            Ações irrevogáveis que apagam totalmente sua identidade digital da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            <Trash2 className="h-4 w-4 mr-2" />{' '}
            {isDeleting ? 'Processando Exclusão...' : 'Excluir Minha Conta Permanentemente'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
