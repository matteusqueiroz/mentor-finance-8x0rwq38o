import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Diagnostico from './pages/Diagnostico'
import PlanoAcao from './pages/PlanoAcao'
import Organizacao from './pages/Organizacao'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { FinanceProvider } from './stores/use-finance-store'

const App = () => (
  <FinanceProvider>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/diagnostico" element={<Diagnostico />} />
            <Route path="/plano" element={<PlanoAcao />} />
            <Route path="/organizacao" element={<Organizacao />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </FinanceProvider>
)

export default App
