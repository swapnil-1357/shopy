// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Add try-catch to prevent errors from breaking the effect
        try {
            const storedUser = localStorage.getItem('user')
            const storedToken = localStorage.getItem('token')

            if (storedUser && storedToken) {
                // Parse user data safely
                const userData = JSON.parse(storedUser)
                setUser(userData)
                setToken(storedToken)
            }
        } catch (error) {
            console.error('Error loading auth data from localStorage:', error)
            // Clear corrupted data
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }, []) // Empty dependency array - this should only run once

    const login = (userData, authToken) => {
        try {
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('token', authToken)
            setUser(userData)
            setToken(authToken)
        } catch (error) {
            console.error('Error saving auth data to localStorage:', error)
        }
    }

    const logout = () => {
        try {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setUser(null)
            setToken(null)
        } catch (error) {
            console.error('Error clearing auth data from localStorage:', error)
        }
    }

    // Memoize this value to prevent unnecessary re-renders
    const isAuthenticated = Boolean(user && token)

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export default AuthProvider
export { useAuth }