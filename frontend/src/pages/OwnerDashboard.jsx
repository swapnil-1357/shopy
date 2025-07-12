// src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const OwnerDashboard = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')

        if (!token || !userData) {
            navigate('/login')
            return
        }

        try {
            const parsedUser = JSON.parse(userData)

            if (parsedUser.role !== 'owner') {
                navigate('/login')
            } else {
                setUser(parsedUser)
            }
        } catch {
            navigate('/login')
        }
    }, [])

    if (!user) return null

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>
            <p className="text-muted-foreground">Shop ID: {user.shopId}</p>

            {/* Add owner dashboard content here */}
        </div>
    )
}

export default OwnerDashboard
