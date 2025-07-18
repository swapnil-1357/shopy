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

    const detailedRows = []
    for (const emp of data.employeeProductSales || []) {
        for (const [_, prodInfo] of Object.entries(emp.products || {})) {
            detailedRows.push({
                employee: emp.username,
                profilePicture: emp.profilePicture || '',
                product: prodInfo.name,
                quantity: prodInfo.quantity
            })
        }
    }

    const productChartData = {
        labels: (data.products || []).map(p => p.name),
        datasets: [
            {
                label: 'Quantity Sold',
                data: (data.products || []).map(p => p.totalSold),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
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
                backgroundColor: ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa'],
                borderWidth: 1
            }
        ]
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold mb-4">📊 Shop Analytics</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Revenue</h2>
                    <p className="text-2xl font-bold text-green-600">
                        ₹ {new Intl.NumberFormat('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }).format(data.totalRevenue ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                        Based on price at time of sale
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Total items sold: {data.totalItemsSold || 0}
                    </p>
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">🏆 Top Product(s)</h2>
                    {Array.isArray(data.topProduct) && data.topProduct.length > 0 ? (
                        <ul className="list-disc list-inside text-sm">
                            {data.topProduct.map((p, idx) => (
                                <li key={idx}>
                                    <strong>{p.name}</strong> — {p.totalSold} sold
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No product data</p>
                    )}
                </div>

                <div className="border p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">👤 Top Employee(s)</h2>
                    {Array.isArray(data.topEmployee) && data.topEmployee.length > 0 ? (
                        <ul className="space-y-2">
                            {data.topEmployee.map((e, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    <img
                                        src={e.profilePicture || '/default-avatar.png'}
                                        alt={e.username}
                                        className="w-8 h-8 rounded-full object-cover border"
                                    />
                                    <div>
                                        <div className="font-medium">{e.username}</div>
                                        <div className="text-muted-foreground text-xs">
                                            ₹ {new Intl.NumberFormat('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }).format(e.revenue ?? 0)} earned
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">No employee data</p>
                    )}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">📦 Products Sold</h2>
                    <Bar data={productChartData} />
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">💼 Top Sellers (by quantity)</h2>
                    <Pie data={employeePieChartData} />
                </div>
            </div>

            {/* Detailed Sales Table */}
            <div className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">🧾 Detailed Sales</h2>
                {detailedRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No detailed sales available</p>
                ) : (
                    <table className="w-full text-sm table-auto border-collapse">
                        <thead>
                            <tr className="border-b font-medium">
                                <th className="text-left py-1">Employee</th>
                                <th className="text-left py-1">Product</th>
                                <th className="text-left py-1">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedRows.map((row, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="py-1 flex items-center gap-2">
                                        <img
                                            src={row.profilePicture || '/default-avatar.png'}
                                            alt={row.employee}
                                            className="w-6 h-6 rounded-full object-cover border"
                                        />
                                        <span>{row.employee}</span>
                                    </td>
                                    <td className="py-1">{row.product}</td>
                                    <td className="py-1">{row.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* All Employees by Selling Points */}
            <div className="border p-4 rounded shadow">
                <h2 className="text-lg font-semibold mb-4">🧑‍💼 All Employees (by selling points)</h2>
                {data.allEmployees?.length ? (
                    <ul className="space-y-2">
                        {data.allEmployees
                            .sort((a, b) => b.sellingPoints - a.sellingPoints)
                            .map((emp, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    <img
                                        src={emp.profilePicture || '/default-avatar.png'}
                                        alt={emp.username}
                                        className="w-6 h-6 rounded-full object-cover border"
                                    />
                                    <span>{emp.username}</span>
                                    <span className="ml-auto text-muted-foreground">
                                        {emp.sellingPoints} pts
                                    </span>
                                </li>
                            ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-sm">No employees found</p>
                )}
            </div>
        </div>
    )
}

export default ShopAnalytics
