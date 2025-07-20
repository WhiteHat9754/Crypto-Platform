import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import Dashboard from './pages/Dashboard';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TransferPage from './pages/TransferPage';
import SwapPage from './pages/SwapPage';


export default function App() {
  return (
    <Routes>
      {/* ✅ USER ROUTES under Layout */}
      <Route element={<Layout />}>

        {/* ✅ Public landing page */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wallet"
          element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ✅ USER Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ✅ ADMIN ROUTES */}
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}
