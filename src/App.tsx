import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Diagnostico from './pages/Diagnostico'
import PlanoAcao from './pages/PlanoAcao'
import Organizacao from './pages/Organizacao'
import Advisor from './pages/Advisor'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import Documentos from './pages/Documentos'
import { FinanceProvider } from './stores/use-finance-store'
import { ThemeProvider } from './components/theme-provider'

import UploadFlow from './pages/onboarding/Upload'
import EstimativaFlow from './pages/onboarding/Estimativa'
import ProfissionalFlow from './pages/onboarding/Profissional'
import TemplateFlow from './pages/onboarding/Template'

import Privacidade from './pages/Privacidade'
import Configuracoes from './pages/Configuracoes'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const App = () => (
  <AuthProvider>
    <ThemeProvider defaultTheme="light" storageKey="mentor-finance-theme">
      <FinanceProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Index />} />

                <Route path="/onboarding/upload" element={<UploadFlow />} />
                <Route path="/onboarding/estimativa" element={<EstimativaFlow />} />
                <Route path="/onboarding/profissional" element={<ProfissionalFlow />} />
                <Route path="/onboarding/template" element={<TemplateFlow />} />

                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documentos" element={<Documentos />} />
                <Route path="/diagnostico" element={<Diagnostico />} />
                <Route path="/plano" element={<PlanoAcao />} />
                <Route path="/organizacao" element={<Organizacao />} />
                <Route path="/advisor" element={<Advisor />} />

                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/configuracoes" element={<Configuracoes />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </FinanceProvider>
    </ThemeProvider>
  </AuthProvider>
)

export default App
