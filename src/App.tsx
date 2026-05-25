import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './routes/LandingPage';
import DemoPage from './routes/DemoPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
