import React, { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

const PendingSalesPage = () => {
    const { user } = useAuth();
    const [pendingSales, setPendingSales] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.shopId) {
            fetchPendingSales();
        }
    }, [user]);

    const fetchPendingSales = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/pending-sales/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setPendingSales(res.data);
        } catch (err) {
            console.error('Fetch error:', err);
            toast.error('Failed to fetch pending sales');
        } finally {
            setLoading(false);
        }
    };

    const confirmSale = async (saleId) => {
        try {
            await axios.put(`/pending-sales/confirm/${saleId}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            toast.success('✅ Sale confirmed');
            fetchPendingSales();
        } catch (err) {
            toast.error(err.response?.data?.message || '❌ Failed to confirm sale');
        }
    };

    if (!user || (user.role !== 'owner' && user.role !== 'employee')) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Pending Sales</h1>

            {loading ? (
                <p className="text-muted-foreground">Loading sales...</p>
            ) : pendingSales.length === 0 ? (
                <p>No pending sales</p>
            ) : (
                <div className="space-y-4">
                    {pendingSales.map((sale) => (
                        <div key={sale._id} className="border p-4 rounded shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-muted-foreground">
                                    <b>Employee:</b> {sale.employeeId?.username || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 italic">
                                    {new Date(sale.createdAt).toLocaleString()}
                                </p>
                            </div>

                            <ul className="list-disc ml-4 mb-3 text-sm">
                                {sale.items.map((item, idx) => (
                                    <li key={item.productId?._id || idx}>
                                        <span className="font-medium">{item.productId?.name || 'Unnamed Product'}</span>{' '}
                                        × {item.quantity} @ ₹{item.priceAtSale?.toFixed(2)}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground italic">Status: {sale.status}</span>
                                {(user.role === 'owner' || user._id === sale.employeeId?._id) && (
                                    <Button
                                        onClick={() => confirmSale(sale._id)}
                                        variant={user.role === 'owner' ? 'outline' : 'default'}
                                    >
                                        Confirm Sale
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PendingSalesPage;
