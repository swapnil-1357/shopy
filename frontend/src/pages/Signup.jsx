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

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const endpoint =
                formData.role === 'owner' ? '/auth/register-owner' : '/auth/register-employee'

            const res = await axios.post(endpoint, formData)
            alert('Signup successful!')
            navigate('/login')
        } catch (err) {
            alert(err.response?.data?.message || 'Signup failed')
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
                    placeholder={formData.role === 'owner' ? 'Set Employee Password' : 'Employee Password'}
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

                <Button type="submit" className="w-full">Sign Up</Button>
            </form>
        </div>
    )
}

export default Signup
