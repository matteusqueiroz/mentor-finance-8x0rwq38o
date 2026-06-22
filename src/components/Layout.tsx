import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileBarChart,
  CheckSquare,
  Wallet,
  Settings,
  Bell,
  Search,
  Menu,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AIFab } from './AIFab'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Diagnóstico', href: '/diagnostico', icon: FileBarChart },
  { name: 'Plano de Ação', href: '/plano', icon: CheckSquare },
  { name: 'Organização', href: '/organizacao', icon: Wallet },
  { name: 'Configurações', href: '#', icon: Settings },
]

export default function Layout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar className="border-r border-border/50">
          <SidebarHeader className="p-4 border-b border-border/50 flex items-center justify-start h-16">
            <div className="flex items-center gap-2 px-2 text-primary font-bold text-xl tracking-tight">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              PME Gestão IA
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.href}
                        className="rounded-xl h-11 transition-all active:scale-95"
                      >
                        <Link to={item.href} className="flex items-center gap-3 font-medium">
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-4 flex-1">
              <SidebarTrigger className="lg:hidden" />
              <div className="relative w-full max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações, tarefas..."
                  className="w-full pl-9 bg-muted/50 border-none rounded-full h-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
              </Button>
              <div className="h-8 w-px bg-border/50 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">Padaria Doce Pão</p>
                  <p className="text-xs text-muted-foreground mt-1">Admin</p>
                </div>
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=2" />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
            <div className="mx-auto max-w-6xl w-full">
              <Outlet />
            </div>
          </main>
        </div>

        <AIFab />
      </div>
    </SidebarProvider>
  )
}
