import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Diagnostico from './pages/Diagnostico'
import PlanoAcao from './pages/PlanoAcao'
import Organizacao from './pages/Organizacao'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { FinanceProvider } from './stores/use-finance-store'

import UploadFlow from './pages/onboarding/Upload'
import EstimativaFlow from './pages/onboarding/Estimativa'
import ProfissionalFlow from './pages/onboarding/Profissional'
import TemplateFlow from './pages/onboarding/Template'

import Privacidade from './pages/Privacidade'
import Configuracoes from './pages/Configuracoes'

const App = () => (
  <FinanceProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />

            <Route path="/onboarding/upload" element={<UploadFlow />} />
            <Route path="/onboarding/estimativa" element={<EstimativaFlow />} />
            <Route path="/onboarding/profissional" element={<ProfissionalFlow />} />
            <Route path="/onboarding/template" element={<TemplateFlow />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/plano" element={<PlanoAcao />} />
            <Route path="/organizacao" element={<Organizacao />} />

            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </FinanceProvider>
)

export default App
