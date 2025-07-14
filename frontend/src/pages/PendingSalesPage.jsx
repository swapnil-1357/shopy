import React, { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const PendingSalesPage = () => {
    const { user } = useAuth()
    const [pendingSales, setPendingSales] = useState([])

    useEffect(() => {
        if (user?.shopId) {
            fetchPendingSales()
        }
    }, [user])

    const fetchPendingSales = async () => {
        try {
            const res = await axios.get(`/pending-sales/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setPendingSales(res.data)
        } catch {
            alert('Failed to fetch pending sales')
        }
    }

    const confirmSale = async (saleId) => {
        try {
            await axios.put(`/pending-sales/confirm/${saleId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            alert('Sale confirmed!')
            fetchPendingSales()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to confirm sale')
        }
    }

    if (!user || (user.role !== 'owner' && user.role !== 'employee')) return null

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pending Sales</h1>
            {pendingSales.length === 0 ? (
                <p>No pending sales</p>
            ) : (
                <div className="space-y-4">
                    {pendingSales.map((sale) => (
                        <div key={sale._id} className="border p-4 rounded shadow-sm">
                            <p className="text-sm text-muted-foreground mb-1">
                                Employee: <b>{sale.employeeId?.username || 'Unknown'}</b>
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                                Created: {new Date(sale.createdAt).toLocaleString()}
                            </p>
                            <ul className="list-disc ml-4 mb-3">
                                {sale.items.map((item, idx) => (
                                    <li key={item.productId?._id || idx}>
                                        {(item.productId?.name || 'Unknown Product')} × {item.quantity}
                                    </li>
                                ))}
                            </ul>
                            {user._id === sale.employeeId?._id ? (
                                <Button onClick={() => confirmSale(sale._id)}>
                                    Confirm Sale
                                </Button>
                            ) : (
                                <Button onClick={() => confirmSale(sale._id)} variant="outline">
                                    Owner Confirm
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PendingSalesPage
