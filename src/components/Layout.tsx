import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, Settings, ShieldCheck, Moon, Sun, LogOut, Shield, Bell } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/hooks/use-auth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'

function NotificationsMenu() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    const fetchNotifs = async () => {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(10)
      if (data) setNotifications(data)
    }

    fetchNotifs()

    const channel = supabase
      .channel('notificacoes_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotif = payload.new
          setNotifications((prev) => [newNotif, ...prev])
          toast({
            title: newNotif.titulo,
            description: newNotif.mensagem,
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const unreadCount = notifications.filter((n) => !n.lida).length

  const markAsRead = async (id: string) => {
    await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)))
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Notificações"
          className="relative text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b font-medium flex items-center justify-between bg-muted/30">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} não lidas</span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-sm text-center text-muted-foreground">
              Nenhuma notificação no momento
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 border-b last:border-0 flex flex-col gap-1.5 transition-colors ${
                  !n.lida ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <strong className={`text-sm ${!n.lida ? 'text-primary' : ''}`}>{n.titulo}</strong>
                  {!n.lida && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
                    >
                      Marcar como lida
                    </button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{n.mensagem}</p>
                <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                  {new Date(n.criado_em).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <header className="border-b border-border bg-background/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-primary p-1.5 rounded-lg">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-foreground">
              Mentor<span className="text-primary">Finance</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`hover:text-primary transition-colors ${location.pathname === '/' || location.pathname.startsWith('/onboarding') ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Onboarding
            </Link>
            <Link
              to="/dashboard"
              className={`hover:text-primary transition-colors ${location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/diagnostico"
              className={`hover:text-primary transition-colors ${location.pathname === '/diagnostico' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Diagnóstico
            </Link>
            <Link
              to="/plano"
              className={`hover:text-primary transition-colors ${location.pathname === '/plano' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Plano de Ação
            </Link>
            <Link
              to="/advisor"
              className={`flex items-center gap-1.5 hover:text-primary transition-colors ${location.pathname === '/advisor' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Shield className="h-4 w-4" />
              Advisor
            </Link>
            <div className="h-4 w-px bg-border mx-2" />
            <NotificationsMenu />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Alternar Tema"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              to="/privacidade"
              title="Privacidade (LGPD)"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <Link
              to="/configuracoes"
              title="Configurações"
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
            </Link>
            <button
              onClick={handleSignOut}
              title="Sair"
              className="text-muted-foreground hover:text-red-500 transition-colors p-1 rounded-full hover:bg-muted"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
