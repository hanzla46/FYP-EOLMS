import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={
            <div className="flex items-center justify-center min-h-screen">
              <h1 className="text-3xl font-bold text-gray-800">EOLMS</h1>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
