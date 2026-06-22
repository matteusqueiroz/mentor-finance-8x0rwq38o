import { useState } from 'react'
import { Bot, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function AIFab() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: 'Olá! Sou seu assistente financeiro. Como posso ajudar com sua empresa hoje?',
    },
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (!inputValue.trim()) return
    setMessages((prev) => [...prev, { role: 'user', content: inputValue }])
    setInputValue('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'Analisando seus dados... Parece que seu fluxo de caixa está saudável para os próximos 15 dias, mas recomendo focar na renegociação do aluguel.',
        },
      ])
    }, 1000)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[350px] mb-4 shadow-elevation animate-slide-up border-primary/20">
          <CardHeader className="bg-primary/5 pb-4 border-b">
            <CardTitle className="flex justify-between items-center text-lg">
              <div className="flex items-center gap-2 text-primary">
                <Bot className="h-5 w-5" />
                Consultor IA
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm',
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-3 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex w-full gap-2"
            >
              <Input
                placeholder="Pergunte algo..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 rounded-full bg-muted/50"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full shrink-0 transition-transform active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          'h-14 w-14 rounded-full shadow-elevation transition-all active:scale-95',
          isOpen
            ? 'bg-secondary hover:bg-secondary/90'
            : 'bg-primary hover:bg-primary/90 animate-float',
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  )
}
