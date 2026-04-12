import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import Order from './pages/Order';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Dashboard from './pages/Admin/Dashboard';

// Placeholder pages for those not yet fully built
const Placeholder = ({ title }) => (
  <div className="section container pt-32 text-center h-[60vh]">
    <h1 className="text-4xl font-bold text-primary mb-4">{title}</h1>
    <p className="text-gray-600">This page is coming soon. We're busy preparing the best content for you!</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to new-dawn for now */}
        <Route path="/" element={<Navigate to="/new-dawn" replace />} />

        {/* Dynamic Farm Routes (Customer Site) */}
        <Route path="/:farmSlug" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="services" element={<Services />} />
          <Route path="order" element={<Order />} />
          <Route path="contact" element={<Contact />} />
          <Route path="about" element={<Placeholder title="About Our Farm" />} />
          <Route path="gallery" element={<Placeholder title="Gallery" />} />
          
          {/* Farmer Dashboard Route (Back Office) */}
          <Route path="admin" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
