import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const { resetPassword } = useAuth()
  const { toast } = useToast()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const { error } = await resetPassword(email)
    setIsLoading(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setIsSent(true)
      toast({ title: 'E-mail enviado', description: 'Verifique sua caixa de entrada.' })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg border-none animate-fade-in-up">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Recuperar senha</CardTitle>
          <CardDescription>
            {isSent
              ? 'Enviamos um link de recuperação para o seu e-mail.'
              : 'Insira seu e-mail para receber um link de redefinição de senha.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </Button>
            </form>
          ) : (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/login">Voltar ao login</Link>
            </Button>
          )}
        </CardContent>
        {!isSent && (
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
            <div>
              Lembrou sua senha?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
