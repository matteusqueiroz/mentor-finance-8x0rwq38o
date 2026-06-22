import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Briefcase, Settings, ShieldCheck, Moon, Sun, LogOut, Shield } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { useAuth } from '@/hooks/use-auth'

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
