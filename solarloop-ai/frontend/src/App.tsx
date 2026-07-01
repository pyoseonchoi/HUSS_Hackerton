import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PlantListPage from './pages/PlantListPage';
import PlantCreatePage from './pages/PlantCreatePage';
import InspectionUploadPage from './pages/InspectionUploadPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import NotFoundPage from './pages/NotFoundPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {/* Support both root paths */}
          <Route path="/dashboard" element={<Navigate to="/" replace />} />
          <Route path="/plants" element={<PlantListPage />} />
          <Route path="/plants/new" element={<PlantCreatePage />} />
          <Route path="/inspections/new" element={<InspectionUploadPage />} />
          <Route path="/inspections/:id" element={<InspectionDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
