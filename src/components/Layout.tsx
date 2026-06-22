import { Link, Outlet, useLocation } from 'react-router-dom'
import { Briefcase, Settings, ShieldCheck } from 'lucide-react'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-slate-100">
              Mentor<span className="text-blue-500">Finance</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`hover:text-blue-400 transition-colors ${location.pathname === '/' || location.pathname.startsWith('/onboarding') ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Onboarding
            </Link>
            <Link
              to="/dashboard"
              className={`hover:text-blue-400 transition-colors ${location.pathname === '/dashboard' ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Dashboard
            </Link>
            <Link
              to="/diagnostico"
              className={`hover:text-blue-400 transition-colors ${location.pathname === '/diagnostico' ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Diagnóstico
            </Link>
            <Link
              to="/plano"
              className={`hover:text-blue-400 transition-colors ${location.pathname === '/plano' ? 'text-blue-500' : 'text-slate-400'}`}
            >
              Plano de Ação
            </Link>
            <div className="h-4 w-px bg-slate-800 mx-2" />
            <Link
              to="/privacidade"
              title="Privacidade (LGPD)"
              className="text-slate-500 hover:text-slate-300"
            >
              <ShieldCheck className="h-5 w-5" />
            </Link>
            <Link
              to="/configuracoes"
              title="Configurações"
              className="text-slate-500 hover:text-slate-300"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
