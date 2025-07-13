import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'))
            const storedToken = localStorage.getItem('token')

            if (storedUser && storedToken) {
                setUser(storedUser)
                setToken(storedToken)
            }
        } catch (error) {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }, [])

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
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user && !!token, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
