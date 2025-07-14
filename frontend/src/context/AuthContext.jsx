import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/axios'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = JSON.parse(localStorage.getItem('user'))

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(storedUser)
        }

        setLoading(false)
    }, [])

    // ⏫ Refresh user profile from backend
    const refreshUser = async () => {
        try {
            const res = await api.get('/user/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })

            setUser(res.data)
            localStorage.setItem('user', JSON.stringify(res.data))
        } catch (err) {
            console.error('❌ Failed to refresh user profile')
        }
    }

    const login = (userData, authToken) => {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', authToken)
        setUser(userData)
        setToken(authToken)
    }

    const logout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setUser(null)
        setToken(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!user && !!token,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
