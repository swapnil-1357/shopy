import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/lib/axios';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // ✅ detect current route

    useEffect(() => {
        // ❌ Skip fetch if on login/signup page
        if (['/login', '/signup'].includes(location.pathname)) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await api.get('/user/profile', { withCredentials: true });
                setUser(res.data);
            } catch (err) {
                setUser(null);
                console.warn('⚠️ User not authenticated');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [location.pathname]);

    const refreshUser = async () => {
        try {
            const res = await api.get('/user/profile', { withCredentials: true });
            setUser(res.data);
        } catch (err) {
            console.error('❌ Failed to refresh user profile');
        }
    };

    const login = async () => {
        await refreshUser();
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('❌ Logout failed', err);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                refreshUser,
                isAuthenticated: !!user,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
