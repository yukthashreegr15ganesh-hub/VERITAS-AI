import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ModelInfoPage } from './pages/ModelInfoPage';
import { HistoryPage } from './pages/HistoryPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-[#e4dfd7] selection:bg-[#991b1b]/40 selection:text-[#fcfaf7]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/model-info" element={<ModelInfoPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
