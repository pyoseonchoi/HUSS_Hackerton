import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PlantListPage from './pages/PlantListPage';
import PlantCreatePage from './pages/PlantCreatePage';
import InspectionUploadPage from './pages/InspectionUploadPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import MobileDemoPage from './pages/MobileDemoPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Mobile Demo Page has its own full-screen layout */}
        <Route path="/mobile-demo" element={<MobileDemoPage />} />
        
        {/* Other pages are wrapped with the default Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/plants" element={<PlantListPage />} />
                <Route path="/plants/new" element={<PlantCreatePage />} />
                <Route path="/inspections/new" element={<InspectionUploadPage />} />
                <Route path="/inspections/:id" element={<InspectionDetailPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
