import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Camera,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Settings,
} from 'lucide-react'

export default function Documentos() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [empresaId, setEmpresaId] = useState<string | null>(null)
  const [emailContabilidade, setEmailContabilidade] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const fetchDocumentos = async () => {
    if (!user) return
    setLoading(true)

    // Fetch empresa info first
    const { data: empData } = await supabase
      .from('empresas')
      .select('id, email_contabilidade')
      .eq('user_id', user.id)
      .limit(1)

    if (empData && empData.length > 0) {
      setEmpresaId(empData[0].id)
      setEmailContabilidade(empData[0].email_contabilidade)
    }

    const { data } = await supabase
      .from('documentos_contabeis')
      .select('*')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false })

    if (data) setDocumentos(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDocumentos()

    if (!user) return

    // Subscribe to realtime updates for documentos_contabeis
    const channel = supabase
      .channel('documentos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documentos_contabeis',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setDocumentos((prev) => {
              if (prev.find((d) => d.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setDocumentos((prev) =>
              prev.map((d) => (d.id === payload.new.id ? { ...d, ...payload.new } : d)),
            )
          } else if (payload.eventType === 'DELETE') {
            setDocumentos((prev) => prev.filter((d) => d.id !== payload.old.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    if (!empresaId) {
      toast({
        title: 'Atenção',
        description: 'Por favor, configure sua empresa primeiro.',
        variant: 'destructive',
      })
      navigate('/configuracoes')
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('documentos').getPublicUrl(filePath)

      // 2. Insert into DB
      const { data: doc, error: insertError } = await supabase
        .from('documentos_contabeis')
        .insert({
          user_id: user.id,
          empresa_id: empresaId,
          nome_arquivo: file.name,
          url_arquivo: publicUrlData.publicUrl,
          tipo_documento: file.type,
          status: 'pendente',
        })
        .select()
        .single()

      if (insertError) throw insertError

      toast({
        title: 'Sucesso',
        description: 'Documento enviado. Iniciando análise...',
      })

      // 3. Analyze document via Edge Function
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: { documentUrl: publicUrlData.publicUrl, fileName: file.name, documentId: doc.id },
        },
      )

      if (analysisError) {
        await supabase.from('documentos_contabeis').update({ status: 'erro' }).eq('id', doc.id)
        throw analysisError
      }

      let finalStatus = 'processado'

      if (emailContabilidade) {
        // 4. Send to Accountant if configured
        const { error: sendError } = await supabase.functions.invoke('send-accounting-email', {
          body: { record: doc },
        })

        if (sendError) {
          finalStatus = 'erro_envio'
          toast({
            title: 'Aviso',
            description: 'Documento analisado, mas falhou ao enviar para a contabilidade.',
            variant: 'destructive',
          })
        } else {
          finalStatus = 'enviado'
          toast({
            title: 'Enviado',
            description: 'Documento analisado e enviado à contabilidade.',
          })
        }
      } else {
        toast({
          title: 'Processado',
          description:
            'Documento analisado. Configure o e-mail da contabilidade para envio automático.',
        })
      }

      // 5. Update final status in DB
      await supabase
        .from('documentos_contabeis')
        .update({
          status: finalStatus,
          analise_ia: analysisData?.analysis,
        })
        .eq('id', doc.id)
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao fazer upload ou processar o documento.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Scanner & Contabilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            Digitalize documentos financeiros e envie automaticamente para seu contador.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={cameraInputRef}
            onChange={handleFileUpload}
            disabled={uploading}
          />

          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Camera className="h-4 w-4 mr-2" />
            Capturar
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 sm:flex-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </div>
      </div>

      {!emailContabilidade && !loading && (
        <Card className="border-orange-500/30 bg-orange-500/5 shadow-sm">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-3 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">
                E-mail da contabilidade não configurado. Os documentos não serão enviados
                automaticamente.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/configuracoes')}
              className="shrink-0 border-orange-500/50 hover:bg-orange-500/10 text-orange-700"
            >
              <Settings className="h-4 w-4 mr-2" /> Configurar Contato
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Histórico de Documentos</CardTitle>
          <CardDescription>
            Acompanhe o status de processamento e envio dos seus documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              Carregando documentos...
            </div>
          ) : documentos.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-medium text-foreground">Nenhum documento</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Faça upload ou capture uma foto de um recibo/nota fiscal para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Dados Extraídos (IA)</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell
                        className="font-medium max-w-[150px] sm:max-w-[250px] truncate"
                        title={doc.nome_arquivo}
                      >
                        {doc.nome_arquivo}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {doc.status === 'pendente' && (
                          <Badge
                            variant="secondary"
                            className="flex w-fit items-center gap-1 whitespace-nowrap"
                          >
                            <Clock className="h-3 w-3" /> Processando
                          </Badge>
                        )}
                        {doc.status === 'processado' && (
                          <Badge className="bg-blue-500 hover:bg-blue-600 flex w-fit items-center gap-1 whitespace-nowrap text-white">
                            <CheckCircle className="h-3 w-3" /> Processado
                          </Badge>
                        )}
                        {doc.status === 'enviado' && (
                          <Badge className="bg-emerald-500 hover:bg-emerald-600 flex w-fit items-center gap-1 whitespace-nowrap text-white">
                            <CheckCircle className="h-3 w-3" /> Enviado
                          </Badge>
                        )}
                        {doc.status === 'erro' && (
                          <Badge
                            variant="destructive"
                            className="flex w-fit items-center gap-1 whitespace-nowrap"
                          >
                            <AlertTriangle className="h-3 w-3" /> Erro na Análise
                          </Badge>
                        )}
                        {doc.status === 'erro_envio' && (
                          <Badge
                            variant="destructive"
                            className="flex w-fit items-center gap-1 whitespace-nowrap"
                          >
                            <AlertTriangle className="h-3 w-3" /> Erro no Envio
                          </Badge>
                        )}
                        {doc.status === 'concluido' && (
                          <Badge className="bg-green-500 hover:bg-green-600 flex w-fit items-center gap-1 whitespace-nowrap text-white">
                            <CheckCircle className="h-3 w-3" /> Concluído
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {doc.analise_ia ? (
                          <span className="truncate block max-w-[300px]">
                            {doc.analise_ia.summary || 'Dados extraídos com sucesso'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild className="shrink-0">
                          <a href={doc.url_arquivo} target="_blank" rel="noopener noreferrer">
                            Visualizar <ArrowRight className="h-4 w-4 ml-1 hidden sm:inline" />
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
