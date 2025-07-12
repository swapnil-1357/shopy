// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <div className="text-center mt-20 text-lg">Loading...</div>
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute
