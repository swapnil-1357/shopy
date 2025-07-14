import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';


import Login from './pages/Login'
import Signup from './pages/Signup'
import OwnerDashboard from './pages/OwnerDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import PendingSalesPage from './pages/PendingSalesPage'
import ShopAnalytics from './pages/ShopAnalytics'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />


      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboards */}
        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        {/* Shared Pages for both roles */}
        <Route
          path="/pending-sales"
          element={
            <ProtectedRoute allowedRoles={['owner', 'employee']}>
              <PendingSalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute allowedRoles={['owner', 'employee']}>
              <ShopAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<div className="text-center mt-20 text-2xl">404 - Not Found</div>}
        />
      </Routes>
    </>
  )
}

export default App
