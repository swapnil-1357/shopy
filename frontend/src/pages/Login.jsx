import React, { useState, useEffect } from 'react'
import axios from '../lib/axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const Login = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        username: '',
        password: '', // Add password to formData
        role: 'owner',
    })

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, isAuthenticated, user } = useAuth()

    // Fix: Add navigate to dependency array AND use the AuthContext
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'owner' ? '/owner-dashboard' : '/employee-dashboard')
        }
    }, [isAuthenticated, user, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value.trimStart(),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                shopName: formData.shopName.trim().toLowerCase(),
                username: formData.username.trim(),
            }

            const endpoint =
                formData.role === 'owner' ? '/auth/login-owner' : '/auth/login-employee'

            const res = await axios.post(endpoint, payload)
            const { token, user } = res.data

            // Use AuthContext login method instead of direct localStorage
            login(user, token)

            alert('✅ Login successful')
            navigate(user.role === 'owner' ? '/owner-dashboard' : '/employee-dashboard')
        } catch (err) {
            const status = err.response?.status
            const message = err.response?.data?.message || 'Login failed'

            if (status === 400) alert(`⚠️ ${message}`)
            else if (status === 401 || status === 403) alert('❌ Invalid credentials')
            else if (status === 404) alert('❌ Shop or user not found')
            else alert(`❌ ${message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    name="shopName"
                    placeholder="Shop Name"
                    value={formData.shopName}
                    onChange={handleChange}
                />
                <Input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <Input
                    name="password"
                    type="password"
                    placeholder={formData.role === 'owner' ? 'Owner Password' : 'Employee Password'}
                    value={formData.password}
                    onChange={handleChange}
                />
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border-2 border-blue-700 rounded-lg px-4 py-2 font-semibold text-blue-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                    <option value="owner">Owner</option>
                    <option value="employee">Employee</option>
                </select>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Log In'}
                </Button>
            </form>

            {/* Sign up link */}
            <p className="text-center mt-4 text-sm text-muted-foreground">
                New user?{' '}
                <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                    Sign up here
                </Link>
            </p>
        </div>
    )
}

export default Login