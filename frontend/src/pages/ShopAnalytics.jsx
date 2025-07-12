import React, { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'

const ShopAnalytics = () => {
    const { user } = useAuth()
    const [data, setData] = useState(null)

    useEffect(() => {
        if (user?.shopId) {
            fetchAnalytics()
        }
    }, [user])

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`/analytics/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setData(res.data)
        } catch {
            alert('Failed to fetch analytics')
        }
    }

    if (!data) return <div className="p-6">Loading analytics...</div>

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Shop Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded shadow">
                    <h2 className="font-semibold text-lg mb-2">Total Sales</h2>
                    <p className="text-2xl font-bold">₹ {data.totalRevenue}</p>
                    <p className="text-sm text-muted-foreground">
                        Total items sold: {data.totalItemsSold}
                    </p>
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="font-semibold text-lg mb-2">Top Employees</h2>
                    <ul className="text-sm">
                        {data.topEmployees.map((emp) => (
                            <li key={emp._id}>
                                {emp.username} — {emp.points} pts
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ShopAnalytics
