import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

export function SubscriptionLock({
  children,
  isActive,
  isLoading,
}: {
  children: React.ReactNode
  isActive: boolean
  isLoading?: boolean
}) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async () => {
    if (!user) return
    setSubscribing(true)
    try {
      const { error } = await supabase.from('assinaturas').upsert(
        {
          user_id: user.id,
          plano: 'consult',
          status: 'ativo',
        },
        { onConflict: 'user_id' },
      )

      if (error) throw error

      toast({ title: 'Assinatura Ativada', description: 'Você agora tem acesso completo!' })
      window.location.reload()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSubscribing(false)
    }
  }

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Verificando acesso...
      </div>
    )
  if (isActive) return <>{children}</>

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4 animate-fade-in-up">
      <Card className="max-w-md w-full text-center shadow-lg border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-fit">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Acesso Premium</CardTitle>
          <CardDescription className="text-base mt-2">
            Este recurso requer uma assinatura ativa. Assine agora para ter acesso à análise
            avançada de IA, simuladores operacionais e plano de ação estruturado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full text-lg h-12"
            size="lg"
          >
            {subscribing ? 'Processando...' : 'Assinar Plano Consult'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
