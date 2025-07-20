import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PersonaPage from './pages/PersonaPage';
import ComparePage from './pages/ComparePage';
import TrendsPage from './pages/TrendsPage';
import StoryPage from './pages/StoryPage';
import InsightsPage from './pages/InsightsPage';
import Footer from './components/Footer';

function App() {
  useEffect(() => {
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/persona" element={<PersonaPage />} />
          <Route path="/persona/:id" element={<PersonaPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/trends" element={<TrendsPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/insights" element={<InsightsPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;