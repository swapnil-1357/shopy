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
        role: 'owner',
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
                ...formData,
                shopName: formData.shopName.trim().toLowerCase(),
                username: formData.username.trim(),
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

            if (status === 400) {
                alert(`⚠️ ${message}`)
            } else if (status === 403) {
                alert('❌ Invalid shop or password')
            } else if (status === 404) {
                alert('❌ Shop not found')
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
                />

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
        </div>
    )
}

export default Signup
