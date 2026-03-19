import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import StrategyLibraryPage from './pages/StrategyLibraryPage';
import StrategyDetailPage from './pages/StrategyDetailPage';
import CandlestickEncyclopediaPage from './pages/CandlestickEncyclopediaPage';
import LiveSignalsPage from './pages/LiveSignalsPage';
import PatternScannerPage from './pages/PatternScannerPage';
import ToolsPage from './pages/ToolsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"               element={<HomePage />} />
              <Route path="/strategies"     element={<StrategyLibraryPage />} />
              <Route path="/strategies/:id" element={<StrategyDetailPage />} />
              <Route path="/candlesticks"   element={<CandlestickEncyclopediaPage />} />
              <Route path="/signals"        element={<LiveSignalsPage />} />
              <Route path="/scanner"        element={<PatternScannerPage />} />
              <Route path="/tools"          element={<ToolsPage />} />
              <Route path="/profile"        element={<ProfilePage />} />
              <Route path="*"               element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

