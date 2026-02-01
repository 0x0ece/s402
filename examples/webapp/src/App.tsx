import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProtectedPage from './pages/ProtectedPage';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/protected" element={<ProtectedPage />} />
      </Routes>
    </div>
  );
}

export default App;
