import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wand2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function ReportsTab() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [reports, setReports] = useState<any[]>([])
  const [generatingReport, setGeneratingReport] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetchReports = async () => {
      const { data } = await supabase
        .from('relatorios' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
      if (data) setReports(data)
    }
    fetchReports()
  }, [user])

  const generateReport = async () => {
    setGeneratingReport(true)
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { mes_referencia: currentMonth },
      })

      if (error) throw error

      if (data?.success && data?.relatorio) {
        setReports((prev) => [data.relatorio, ...prev])
        toast({ title: 'Sucesso', description: 'Relatório gerado com sucesso!' })
      }
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Erro ao gerar relatório',
        variant: 'destructive',
      })
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Relatórios Gerados</CardTitle>
          <CardDescription>Histórico de análises mensais automatizadas.</CardDescription>
        </div>
        <Button onClick={generateReport} disabled={generatingReport}>
          {generatingReport ? (
            <Wand2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Gerar Relatório do Mês
        </Button>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum relatório gerado ainda. Clique no botão acima para criar o primeiro.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reports.map((rep) => (
              <Card key={rep.id} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Ref: {rep.mes_referencia}</CardTitle>
                  <CardDescription>{new Date(rep.criado_em).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground line-clamp-6">
                    {rep.conteudo}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
