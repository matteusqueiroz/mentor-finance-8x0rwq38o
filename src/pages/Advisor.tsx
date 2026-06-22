import { useState, useEffect, useRef } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { UploadCloud, Bot, Send, FileText, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'ai'; content: string }
type Documento = {
  id: string
  nome_arquivo: string
  status: string
  criado_em: string
  analise_ia?: any
}

export default function Advisor() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Olá! Sou seu Consultor Legal e Financeiro. Como posso ajudar seu negócio hoje?',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [company, setCompany] = useState<any>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Docs State
  const [docs, setDocs] = useState<Documento[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchCompany = async () => {
      if (!user) return
      const { data } = await supabase.from('empresas').select('*').eq('user_id', user.id).single()
      if (data) setCompany(data)
    }
    const fetchDocs = async () => {
      if (!user) return
      const { data } = await supabase
        .from('documentos_contabeis')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
      if (data) setDocs(data)
    }

    fetchCompany()
    fetchDocs()
  }, [user])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMsg = { role: 'user' as const, content: inputValue }
    setMessages((prev) => [...prev, newMsg])
    setInputValue('')
    setIsTyping(true)

    try {
      const { data, error } = await supabase.functions.invoke('chat-advisor', {
        body: { messages: [...messages, newMsg], companyContext: company },
      })

      if (error) throw error

      setMessages((prev) => [...prev, { role: 'ai', content: data.message }])
    } catch (err: any) {
      toast({
        title: 'Erro de Comunicação',
        description: 'Não foi possível contatar o consultor.',
        variant: 'destructive',
      })
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: newDoc, error: insertError } = await supabase
        .from('documentos_contabeis')
        .insert({
          user_id: user.id,
          empresa_id: company?.id,
          nome_arquivo: file.name,
          url_arquivo: filePath,
          tipo_documento: 'Outro',
          status: 'pendente',
        })
        .select()
        .single()

      if (insertError) throw insertError

      setDocs((prev) => [newDoc, ...prev])
      toast({ title: 'Upload concluído', description: 'O documento foi enviado para análise.' })

      const { data: analysis, error: analyzeError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: { documentText: `Análise solicitada para o documento: ${file.name}` },
        },
      )

      if (analyzeError) throw analyzeError

      const { data: updatedDoc, error: updateError } = await supabase
        .from('documentos_contabeis')
        .update({
          status: 'analisado',
          analise_ia: analysis.analysis,
        })
        .eq('id', newDoc.id)
        .select()
        .single()

      if (updateError) throw updateError

      setDocs((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)))
      toast({
        title: 'Análise concluída',
        description: 'O documento foi analisado pela IA com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro de Upload',
        description: err.message || 'Falha ao enviar documento.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advisor & Documentos</h1>
        <p className="text-muted-foreground mt-2">
          Sua central de consultoria inteligente e gestão de documentos contábeis.
        </p>
      </div>

      <Tabs defaultValue="consultancy" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="consultancy">Consultor IA</TabsTrigger>
          <TabsTrigger value="documents">Scanner de Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="consultancy">
          <Card className="h-[600px] flex flex-col border-border/50 shadow-sm">
            <CardHeader className="bg-primary/5 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-primary" />
                Consultor de Negócios e Contabilidade
              </CardTitle>
              <CardDescription>
                Tire dúvidas sobre tributos, leis trabalhistas ou estratégias financeiras.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                    >
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm border border-border/50',
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex gap-1 items-center border border-border/50 shadow-sm">
                        <span
                          className="animate-bounce inline-block w-1.5 h-1.5 bg-foreground/50 rounded-full"
                          style={{ animationDelay: '0ms' }}
                        />
                        <span
                          className="animate-bounce inline-block w-1.5 h-1.5 bg-foreground/50 rounded-full"
                          style={{ animationDelay: '150ms' }}
                        />
                        <span
                          className="animate-bounce inline-block w-1.5 h-1.5 bg-foreground/50 rounded-full"
                          style={{ animationDelay: '300ms' }}
                        />
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Pergunte sobre notas fiscais, impostos, contratos..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-muted/30"
                  disabled={isTyping}
                />
                <Button type="submit" disabled={isTyping || !inputValue.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </form>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-sm border-border/50 h-fit">
              <CardHeader>
                <CardTitle className="text-lg">Enviar Documento</CardTitle>
                <CardDescription>
                  Faça o upload de notas fiscais, recibos ou contratos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors border-border relative">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground text-center px-4">
                    {isUploading ? (
                      <Loader2 className="h-10 w-10 mb-3 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="h-10 w-10 mb-3" />
                    )}
                    <p className="mb-2 text-sm font-semibold">
                      {isUploading ? 'Processando upload...' : 'Clique ou arraste um arquivo'}
                    </p>
                    <p className="text-xs">PDF, JPG, PNG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleUpload}
                    disabled={isUploading}
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Documentos Recentes</CardTitle>
                <CardDescription>
                  Acompanhe o status dos seus documentos e as análises da IA.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {docs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 mb-4 opacity-20" />
                    <p>Nenhum documento enviado ainda.</p>
                  </div>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Arquivo</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {docs.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium flex items-center gap-2 min-w-[200px]">
                              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="truncate">{doc.nome_arquivo}</span>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {formatDate(doc.criado_em)}
                            </TableCell>
                            <TableCell>
                              {doc.status === 'analisado' ? (
                                <Badge
                                  variant="secondary"
                                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Analisado
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-amber-600 border-amber-200 bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:bg-amber-900/20 whitespace-nowrap"
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
