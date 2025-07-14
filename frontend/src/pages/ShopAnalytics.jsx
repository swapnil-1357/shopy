import React, { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js'
import { Bar, Pie } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const ShopAnalytics = () => {
    const { user } = useAuth()
    const [data, setData] = useState(null)

    useEffect(() => {
        if (user?.shopId) fetchAnalytics()
    }, [user])

    const fetchAnalytics = async () => {
        try {
            const res = await axios.get(`/analytics/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setData(res.data)
        } catch (err) {
            alert('Failed to fetch analytics')
            console.error(err)
        }
    }

    if (!data) return <div className="p-6">Loading analytics...</div>

    // Transform employeeProductSales to detailed rows
    const detailedRows = []
    for (const emp of data.employeeProductSales || []) {
        for (const [_, prodInfo] of Object.entries(emp.products || {})) {
            detailedRows.push({
                employee: emp.username,
                product: prodInfo.name,
                quantity: prodInfo.quantity
            })
        }
    }

    // Chart data
    const productChartData = {
        labels: (data.products || []).map(p => p.name),
        datasets: [
            {
                label: 'Quantity Sold',
                data: (data.products || []).map(p => p.totalSold),
                backgroundColor: 'rgba(59, 130, 246, 0.7)', // blue-500
                borderRadius: 8
            }
        ]
    }

    const employeePieChartData = {
        labels: (data.topEmployees || []).map(e => e.username),
        datasets: [
            {
                label: 'Selling Points',
                data: (data.topEmployees || []).map(e => e.sellingPoints),
                backgroundColor: [
                    '#60a5fa',
                    '#34d399',
                    '#fbbf24',
                    '#f87171',
                    '#a78bfa'
                ],
                borderWidth: 1
            }
        ]
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-4">📊 Shop Analytics</h1>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
                    <p className="text-2xl font-bold">₹ {data.totalRevenue?.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-muted-foreground">
                        Total items sold: {data.totalItemsSold || 0}
                    </p>
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Top Product</h2>
                    {data.topProduct ? (
                        <p className="text-base">
                            🏆 <strong>{data.topProduct.name}</strong> — {data.topProduct.totalSold} sold
                        </p>
                    ) : (
                        <p className="text-muted-foreground">No product data available</p>
                    )}
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Top Employee</h2>
                    {data.topEmployee ? (
                        <p className="text-base">
                            👤 <strong>{data.topEmployee.username}</strong> — ₹ {data.topEmployee.revenue?.toFixed(2)}
                        </p>
                    ) : (
                        <p className="text-muted-foreground">No employee data</p>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Top Products Sold</h2>
                    <Bar data={productChartData} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Top Sellers</h2>
                    <Pie data={employeePieChartData} />
                </div>
            </div>

            {/* Detailed Sales */}
            <div className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">Detailed Sales</h2>
                {detailedRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No detailed sales available</p>
                ) : (
                    <table className="w-full text-sm table-auto border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-1">Employee</th>
                                <th className="text-left py-1">Product</th>
                                <th className="text-left py-1">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedRows.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-1">{row.employee}</td>
                                    <td className="py-1">{row.product}</td>
                                    <td className="py-1">{row.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default ShopAnalytics
