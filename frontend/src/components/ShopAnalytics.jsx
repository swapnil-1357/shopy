import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ShopAnalytics = ({ shopId }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`/api/analytics/shop/${shopId}`);
                setAnalytics(res.data);
            } catch (err) {
                console.error('Failed to load analytics', err);
            } finally {
                setLoading(false);
            }
        };

        if (shopId) {
            fetchAnalytics();
        }
    }, [shopId]);

    if (loading) return <p>Loading analytics...</p>;
    if (!analytics) return <p>No data available.</p>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">📊 Shop Analytics</h1>

            <div className="bg-white shadow rounded p-4 mb-6">
                <p className="text-lg">🧾 Total Completed Sales: <strong>{analytics.totalSales}</strong></p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-semibold mb-2">👨‍💼 Employee Sales</h2>
                    <ul className="list-disc ml-4">
                        {Object.entries(analytics.employeeStats).map(([id, emp]) => (
                            <li key={id}>{emp.name} — <strong>{emp.salesCount}</strong> sale(s)</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-semibold mb-2">📦 Product Sales</h2>
                    <ul className="list-disc ml-4">
                        {Object.entries(analytics.productStats).map(([id, prod]) => (
                            <li key={id}>{prod.name} — <strong>{prod.totalSold}</strong> unit(s) sold</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ShopAnalytics;
