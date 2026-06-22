import { useState } from 'react'
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import useFinanceStore from '@/stores/use-finance-store'

export default function Organizacao() {
  const { transactions, updateTransactionStatus } = useFinanceStore()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organização</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas movimentações, categorias e orçamentos.
          </p>
        </div>
        <Button className="shrink-0 rounded-full shadow-subtle active:scale-95 transition-transform">
          <Plus className="mr-2 h-4 w-4" /> Nova Movimentação
        </Button>
      </div>

      <Tabs defaultValue="transacoes" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger value="transacoes" className="rounded-lg">
            Transações
          </TabsTrigger>
          <TabsTrigger value="categorias" className="rounded-lg">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="rounded-lg">
            Orçamento (Real vs Previsto)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transacoes">
          <Card className="shadow-subtle border-none overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 px-4">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
            </div>
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="group">
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-muted font-normal text-xs">
                        {tx.category}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        tx.type === 'in' ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      {tx.type === 'in' ? '+' : '-'} R${' '}
                      {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'cursor-pointer transition-colors',
                          tx.status === 'Pago'
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20',
                        )}
                        onClick={() =>
                          updateTransactionStatus(tx.id, tx.status === 'Pago' ? 'Pendente' : 'Pago')
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma transação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="categorias" className="animate-fade-in">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Receitas',
              'Custos Fixos',
              'Custos Variáveis',
              'Marketing',
              'Impostos',
              'Folha de Pagamento',
            ].map((cat) => (
              <Card
                key={cat}
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer group border-border/50"
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">{cat}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">12 transações este mês</p>
                </CardContent>
              </Card>
            ))}
            <Button
              variant="outline"
              className="h-full min-h-[100px] border-dashed text-muted-foreground hover:text-foreground flex flex-col gap-2 rounded-xl"
            >
              <Plus className="h-5 w-5" />
              Adicionar Categoria
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="orcamento" className="animate-fade-in space-y-6">
          <Card className="shadow-subtle border-none">
            <CardHeader>
              <CardTitle>Acompanhamento de Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {[
                { name: 'Custos Fixos', actual: 12500, limit: 15000 },
                { name: 'Marketing', actual: 4200, limit: 4000 },
                { name: 'Impostos', actual: 8500, limit: 10000 },
              ].map((item) => {
                const percent = Math.min(Math.round((item.actual / item.limit) * 100), 100)
                const isOver = item.actual > item.limit
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">
                        R$ {item.actual.toLocaleString('pt-BR')} / R${' '}
                        {item.limit.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-2"
                      indicatorClassName={cn(
                        'transition-all',
                        isOver ? 'bg-destructive' : 'bg-primary',
                      )}
                    />
                    {isOver && (
                      <p className="text-xs text-destructive mt-1">Atenção: Orçamento excedido!</p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
