import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar'
import SetupPage from './pages/SetupPage'
import QuizPage from './pages/QuizPage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

export default function App() {
  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<SetupPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  )
}