import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OwnerDashboard from './pages/OwnerDashboard'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/owner-dashboard" element={<OwnerDashboard />} />
      <Route
        path="*"
        element={<div className="text-center mt-20 text-2xl">404 - Not Found</div>}
      />
    </Routes>
  )
}

export default App
