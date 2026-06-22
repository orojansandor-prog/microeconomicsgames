import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/auth'
import HomePage from './pages/HomePage'
import GamesPage from './pages/GamesPage'
import MonopolyPage from './pages/MonopolyPage'
import Level1 from './components/monopoly/Level1'
import Level2 from './components/monopoly/Level2'
import Level3 from './components/monopoly/Level3'
import Level4 from './components/monopoly/Level4'
import LoginPage from './components/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SupplyDemandPage from './pages/SupplyDemandPage'
import SDLevel1 from './components/supply-demand/Level1'
import SDLevel2 from './components/supply-demand/Level2'
import SDLevel3 from './components/supply-demand/Level3'
import SDLevel4 from './components/supply-demand/Level4'
import CostsPage from './pages/CostsPage'
import CostsLevel1 from './components/costs/Level1'
import CostsLevel2 from './components/costs/Level2'
import CostsLevel3 from './components/costs/Level3'
import CostsLevel4 from './components/costs/Level4'
import BudgetConstraintPage from './pages/BudgetConstraintPage'
import BCLevel1 from './components/budget-constraint/Level1'
import BCLevel2 from './components/budget-constraint/Level2'
import BCLevel3 from './components/budget-constraint/Level3'
import BCLevel4 from './components/budget-constraint/Level4'
import ElasticityPage from './pages/ElasticityPage'
import EL1 from './components/elasticity/Level1'
import EL2 from './components/elasticity/Level2'
import EL3 from './components/elasticity/Level3'
import EL4 from './components/elasticity/Level4'

function AppRoutes() {
  const { loading } = useAuth()

  // Public routes render immediately without waiting for auth state.
  // This enables react-snap prerendering and avoids a blank-page flash.
  const loadingFallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (loading) return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={loadingFallback} />
    </Routes>
  )

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><GamesPage /></ProtectedRoute>} />
      <Route path="/games" element={<Navigate to="/dashboard" replace />} />
      <Route path="/games/monopoly" element={<ProtectedRoute><MonopolyPage /></ProtectedRoute>} />
      <Route path="/games/monopoly/level/1" element={<ProtectedRoute><Level1 /></ProtectedRoute>} />
      <Route path="/games/monopoly/level/2" element={<ProtectedRoute><Level2 /></ProtectedRoute>} />
      <Route path="/games/monopoly/level/3" element={<ProtectedRoute><Level3 /></ProtectedRoute>} />
      <Route path="/games/monopoly/level/4" element={<ProtectedRoute><Level4 /></ProtectedRoute>} />
      <Route path="/games/supply-demand" element={<ProtectedRoute><SupplyDemandPage /></ProtectedRoute>} />
      <Route path="/games/supply-demand/level/1" element={<ProtectedRoute><SDLevel1 /></ProtectedRoute>} />
      <Route path="/games/supply-demand/level/2" element={<ProtectedRoute><SDLevel2 /></ProtectedRoute>} />
      <Route path="/games/supply-demand/level/3" element={<ProtectedRoute><SDLevel3 /></ProtectedRoute>} />
      <Route path="/games/supply-demand/level/4" element={<ProtectedRoute><SDLevel4 /></ProtectedRoute>} />
      <Route path="/games/budget-constraint" element={<ProtectedRoute><BudgetConstraintPage /></ProtectedRoute>} />
      <Route path="/games/budget-constraint/level/1" element={<ProtectedRoute><BCLevel1 /></ProtectedRoute>} />
      <Route path="/games/budget-constraint/level/2" element={<ProtectedRoute><BCLevel2 /></ProtectedRoute>} />
      <Route path="/games/budget-constraint/level/3" element={<ProtectedRoute><BCLevel3 /></ProtectedRoute>} />
      <Route path="/games/budget-constraint/level/4" element={<ProtectedRoute><BCLevel4 /></ProtectedRoute>} />
      <Route path="/games/costs" element={<ProtectedRoute><CostsPage /></ProtectedRoute>} />
      <Route path="/games/costs/level/1" element={<ProtectedRoute><CostsLevel1 /></ProtectedRoute>} />
      <Route path="/games/costs/level/2" element={<ProtectedRoute><CostsLevel2 /></ProtectedRoute>} />
      <Route path="/games/costs/level/3" element={<ProtectedRoute><CostsLevel3 /></ProtectedRoute>} />
      <Route path="/games/costs/level/4" element={<ProtectedRoute><CostsLevel4 /></ProtectedRoute>} />
      <Route path="/games/elasticity" element={<ProtectedRoute><ElasticityPage /></ProtectedRoute>} />
      <Route path="/games/elasticity/level/1" element={<ProtectedRoute><EL1 /></ProtectedRoute>} />
      <Route path="/games/elasticity/level/2" element={<ProtectedRoute><EL2 /></ProtectedRoute>} />
      <Route path="/games/elasticity/level/3" element={<ProtectedRoute><EL3 /></ProtectedRoute>} />
      <Route path="/games/elasticity/level/4" element={<ProtectedRoute><EL4 /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
