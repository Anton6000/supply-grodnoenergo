// frontend/src/App.js (Create this file if it doesn't exist)
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CatalogPage from "./pages/CatalogPage";
import AuthPage from "./pages/Auth/AuthPage";
import { AppDataProvider } from "./context/AppDataContext";
import ProductPage from "./pages/ProductPage";
import AccountPage from "./pages/AccountPage";
import CurrentOrderPage from "./pages/CurrentOrderPage";
import AdminDashboard from "./pages/AdminDashboard";
import WarehouseDashboard from "./pages/WarehouseDashboard";

function App() {
  return (
    <Router>
      <AppDataProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/product/:productId" element={<ProductPage />} />
          <Route path="/sign-in-sign-up" element={<AuthPage />} />
          <Route path="/profile/:id" element={<AccountPage />} />
          <Route path="/current-order/:id" element={<CurrentOrderPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/warehouse-dashboard" element={<WarehouseDashboard />} />
        </Routes>
      </AppDataProvider>
    </Router>
  );
}

export default App;