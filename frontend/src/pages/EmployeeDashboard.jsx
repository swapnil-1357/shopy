import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import axios from '@/lib/axios'
import { Button } from '@/components/ui/button'
import Navbar from '@/components/Navbar'

const EmployeeDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [sections, setSections] = useState([])
    const [selectedSection, setSelectedSection] = useState('')
    const [products, setProducts] = useState([])
    const [cart, setCart] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [priceFilter, setPriceFilter] = useState('')
    const [quantityFilter, setQuantityFilter] = useState('')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    useEffect(() => {
        if (user?.role === 'employee') {
            fetchSections()
        }
    }, [user])

    const fetchSections = async () => {
        try {
            const res = await axios.get(`/products/sections/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            const fetchedSections = res.data.sections
            setSections(fetchedSections)
            if (fetchedSections.length) {
                setSelectedSection(fetchedSections[0])
                fetchProducts(fetchedSections[0])
            }
        } catch (err) {
            alert('Failed to load sections')
        }
    }

    const fetchProducts = async (section) => {
        try {
            const res = await axios.get(`/products/products/${user.shopId}/${section}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setProducts(res.data)
        } catch (err) {
            alert('Failed to load products')
        }
    }

    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((item) => item._id === product._id)
            if (existing) {
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            return [...prev, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((item) => item._id !== productId))
    }

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0)

    const placePendingSale = async () => {
        if (!cart.length) return alert('Cart is empty')

        try {
            const payload = {
                employeeId: user._id,
                shopId: user.shopId,
                items: cart.map((item) => ({
                    productId: item._id,
                    quantity: item.quantity,
                })),
            }

            await axios.post('/pending-sales/create', payload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })

            alert('Sale request submitted successfully ✅')
            setCart([])
            fetchProducts(selectedSection) // Refresh stock
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to place sale'
            alert(msg)
        }
    }

    if (!user || user.role !== 'employee') return null

    return (
        <div>
            <Navbar
                appName="Shopy"
                onAnalytics={() => navigate('/analytics')}
                onPendingCart={() => navigate('/pending-sales')}
                onLogout={handleLogout}
            />
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Welcome, {user.username}</h1>
                {/* Section Dropdown, Search Bar, Filters */}
                <div className="flex items-center mb-6 gap-4">
                    {/* Left: Section Dropdown */}
                    <div className="flex items-center flex-1">
                        <select
                            className="border-2 border-blue-700 px-4 py-2 rounded-lg font-semibold text-blue-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            value={selectedSection}
                            onChange={e => {
                                setSelectedSection(e.target.value);
                                fetchProducts(e.target.value);
                            }}
                        >
                            <option value="">All Sections</option>
                            {sections.map(sec => (
                                <option key={sec} value={sec}>{sec}</option>
                            ))}
                        </select>
                    </div>
                    {/* Middle: Search Bar (centered, 40% width) */}
                    <div className="flex justify-center flex-1">
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
                        {/* Price Filter */}
                        <input
                            type="number"
                            className="border px-3 py-2 rounded w-24 focus:outline-none ml-2"
                            placeholder="Max Price"
                            value={priceFilter}
                            onChange={e => setPriceFilter(e.target.value)}
                            min={0}
                        />
                        {/* Quantity Filter */}
                        <input
                            type="number"
                            className="border px-3 py-2 rounded w-24 focus:outline-none ml-2"
                            placeholder="Min Qty"
                            value={quantityFilter}
                            onChange={e => setQuantityFilter(e.target.value)}
                            min={0}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {products
                        .filter(product =>
                            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                            (priceFilter ? product.price <= Number(priceFilter) : true) &&
                            (quantityFilter ? product.quantity >= Number(quantityFilter) : true)
                        )
                        .map((product) => (
                            <div
                                key={product._id}
                                className="border p-4 rounded shadow hover:shadow-lg transition"
                            >
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-40 object-cover rounded mb-2"
                                />
                                <h3 className="text-lg font-semibold">{product.name}</h3>
                                <p className="text-muted-foreground text-sm">{product.description}</p>
                                <p className="text-sm">Price: ₹{product.price}</p>
                                <p className="text-sm">Stock Left: {product.quantity}</p>
                                <Button
                                    className="mt-2 w-full"
                                    onClick={() => addToCart(product)}
                                    disabled={product.quantity <= 0}
                                >
                                    {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                            </div>
                        ))}
                </div>

                {/* Cart Section */}
                <div className="mt-10 border-t pt-6">
                    <h2 className="text-xl font-bold mb-4">🛒 Your Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-muted-foreground">No items in cart</p>
                    ) : (
                        <>
                            <ul className="space-y-3">
                                {cart.map((item) => (
                                    <li
                                        key={item._id}
                                        className="flex justify-between items-center border px-4 py-2 rounded"
                                    >
                                        <div>
                                            <strong>{item.name}</strong> × {item.quantity} = ₹
                                            {item.quantity * item.price}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            className="text-red-500 hover:underline text-sm"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 text-right">
                                <p className="font-medium">Total Items: {totalItems}</p>
                                <p className="font-medium">Total Price: ₹{totalPrice}</p>
                                <Button className="mt-2" onClick={placePendingSale}>
                                    Submit Sale Request
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EmployeeDashboard
