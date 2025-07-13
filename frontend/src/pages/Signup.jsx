// src/pages/Signup.jsx

import React, { useState } from 'react'
import axios from '../lib/axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
    const [formData, setFormData] = useState({
        shopName: '',
        username: '',
        employeePassword: '',
        ownerSecret: '',
        role: 'employee', // Default to employee
    })

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value.trimStart(),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                shopName: formData.shopName.trim().toLowerCase(),
                username: formData.username.trim(),
                employeePassword: formData.employeePassword,
            }

            if (formData.role === 'owner') {
                payload.ownerSecret = formData.ownerSecret.trim()
            }

            const endpoint =
                formData.role === 'owner'
                    ? '/auth/register-owner'
                    : '/auth/register-employee'

            await axios.post(endpoint, payload)

            alert('✅ Signup successful!')
            navigate('/login')
        } catch (err) {
            const status = err.response?.status
            const message = err.response?.data?.message || 'Signup failed'

            if (status === 400 || status === 403 || status === 404) {
                alert(`⚠️ ${message}`)
            } else {
                alert(`❌ ${message}`)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-6 border rounded-xl shadow">
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

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
                    name="employeePassword"
                    placeholder={
                        formData.role === 'owner'
                            ? 'Set Employee Password'
                            : 'Employee Password'
                    }
                    value={formData.employeePassword}
                    onChange={handleChange}
                    type="password"
                />

                {formData.role === 'owner' && (
                    <Input
                        name="ownerSecret"
                        placeholder="Owner Secret Key"
                        value={formData.ownerSecret}
                        onChange={handleChange}
                        type="password"
                    />
                )}

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                >
                    <option value="owner">Owner</option>
                    <option value="employee">Employee</option>
                </select>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
            </form>

            <p className="text-center mt-4 text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:underline font-medium">
                    Log in
                </a>
            </p>
        </div>
    )
}

export default Signup
