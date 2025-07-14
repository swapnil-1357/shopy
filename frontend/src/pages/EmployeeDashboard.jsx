import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

const fetchSections = async ({ queryKey }) => {
    const [, shopId] = queryKey;
    const res = await axios.get(`/products/sections/${shopId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data.sections;
};

const fetchProducts = async ({ queryKey }) => {
    const [, shopId, section] = queryKey;
    const res = await axios.get(`/products/products/${shopId}/${section}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return res.data;
};

const fetchAnalytics = async ({ queryKey }) => {
    const [, shopId] = queryKey;
    const res = await axios.get(`/analytics/shop/${shopId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    return {
        ...res.data,
        topProductIds: res.data.topProduct.map(p => p._id),
    };
};

const EmployeeDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [selectedSection, setSelectedSection] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [priceFilter, setPriceFilter] = useState('');
    const [quantityFilter, setQuantityFilter] = useState('');
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('employee_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const { data: sections = [] } = useQuery({
        queryKey: ['sections', user?.shopId],
        queryFn: fetchSections,
        enabled: !!user?.shopId,
        staleTime: Infinity,
    });

    // Set default selected section when sections load
    useEffect(() => {
        if (sections.length > 0 && !selectedSection) {
            setSelectedSection(sections[0]);
        }
    }, [sections, selectedSection]);

    const { data: products = [] } = useQuery({
        queryKey: ['products', user?.shopId, selectedSection],
        queryFn: fetchProducts,
        enabled: !!selectedSection && !!user?.shopId,
        staleTime: 60 * 1000,
    });

    const { data: analyticsData } = useQuery({
        queryKey: ['analytics', user?.shopId],
        queryFn: fetchAnalytics,
        enabled: !!user?.shopId,
        staleTime: Infinity,
    });

    const placeSaleMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                employeeId: user._id,
                shopId: user.shopId,
                items: cart.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                })),
            };

            return axios.post('/pending-sales/create', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
        },
        onSuccess: () => {
            alert('Sale request submitted successfully ✅');
            setCart([]);
            localStorage.removeItem('employee_cart');
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Failed to place sale';
            alert(msg);
        },
    });

    const handleLogout = useCallback(() => {
        localStorage.removeItem('employee_cart');
        logout();
        navigate('/login');
    }, [logout, navigate]);

    useEffect(() => {
        localStorage.setItem('employee_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product) => {
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            return existing
                ? prev.map(item =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
                : [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback(productId => {
        setCart(prev => prev.filter(item => item._id !== productId));
    }, []);

    const incrementQuantity = useCallback(productId => {
        setCart(prev =>
            prev.map(item =>
                item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    }, []);

    const decrementQuantity = useCallback(productId => {
        setCart(prev =>
            prev.map(item =>
                item._id === productId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    }, []);

    const placePendingSale = useCallback(() => {
        if (!cart.length) return alert('Cart is empty');
        placeSaleMutation.mutate();
    }, [cart, placeSaleMutation]);

    const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

    const filteredProducts = useMemo(() => {
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!priceFilter || product.price <= +priceFilter) &&
            (!quantityFilter || product.quantity >= +quantityFilter)
        );
    }, [products, searchTerm, priceFilter, quantityFilter]);

    const topProductIds = analyticsData?.topProductIds || [];

    if (!user || user.role !== 'employee') return null;

    return (
        <div>
            <Navbar
                role="employee"
                cart={cart}
                cartCount={totalItems}
                onAnalytics={() => navigate('/analytics')}
                onPendingCart={() => navigate('/pending-sales')}
                onLogout={handleLogout}
                onCartUpdate={(productId, action) => {
                    if (action === 'increment') incrementQuantity(productId);
                    else if (action === 'decrement') decrementQuantity(productId);
                    else if (action === 'remove') removeFromCart(productId);
                }}
                onCartSubmit={placePendingSale}
            />

            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Welcome, {user.username}</h1>

                <div className="flex items-center mb-6 gap-4">
                    <select
                        className="border-2 border-blue-700 px-4 py-2 rounded-lg font-semibold text-blue-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        value={selectedSection}
                        onChange={e => setSelectedSection(e.target.value)}
                    >
                        {sections.map(sec => (
                            <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>

                    <div className="flex items-center w-[40vw] max-w-xl mx-auto">
                        <input
                            type="text"
                            className="border px-4 py-2 rounded-l w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Search products by name..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <span className="bg-blue-700 text-white px-4 py-2 rounded-r font-medium flex items-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </span>
                    </div>

                    <input
                        type="number"
                        className="border px-3 py-2 rounded w-24 focus:outline-none ml-2"
                        placeholder="Max Price"
                        value={priceFilter}
                        onChange={e => setPriceFilter(e.target.value)}
                        min={0}
                    />
                    <input
                        type="number"
                        className="border px-3 py-2 rounded w-24 focus:outline-none ml-2"
                        placeholder="Min Qty"
                        value={quantityFilter}
                        onChange={e => setQuantityFilter(e.target.value)}
                        min={0}
                    />
                </div>

                <section>
                    <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Products</h2>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    >
                        {filteredProducts.map(product => {
                            const isBestSeller = topProductIds.includes(product._id);

                            return (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ scale: 1.03 }}
                                    className="relative group border rounded-2xl shadow-sm hover:shadow-lg p-4 flex flex-col transition duration-300 bg-white"
                                >
                                    {isBestSeller && (
                                        <div className="absolute bottom-2 right-4 mb-11 flex flex-col items-end group text-yellow-500 text-xs font-bold">
                                            <span className="opacity-0 group-hover:opacity-100 text-white bg-yellow-500 px-2 py-1 rounded shadow transition duration-300 mb-1">
                                                Best Seller
                                            </span>
                                            <span className="text-lg">🌟</span>
                                        </div>
                                    )}
                                    <div className="mb-4 h-48 overflow-hidden rounded-xl">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                                    <p className="text-gray-600 text-sm flex-grow mt-1">{product.description || "No description available."}</p>
                                    <p className="mt-2 text-base font-medium text-gray-900">₹{product.price}</p>
                                    <p className="text-sm text-gray-700">Stock Left: {product.quantity}</p>
                                    <Button
                                        className="mt-4 w-full"
                                        onClick={() => addToCart(product)}
                                        disabled={product.quantity <= 0}
                                    >
                                        {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </section>
            </div>
        </div>
    );
};

export default React.memo(EmployeeDashboard);
