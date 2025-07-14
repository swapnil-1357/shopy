import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import axios from '../lib/axios'
import Navbar from '@/components/Navbar'
import AddSectionModal from '@/components/AddSectionModal'
import AddProductModal from '@/components/AddProductModal'
import { Trash2 } from "lucide-react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner" 

const Loader = () => (
    <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-700"></div>
    </div>
);


const OwnerDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [sections, setSections] = useState([])
    const [selectedSection, setSelectedSection] = useState('')
    const [loadingSections, setLoadingSections] = useState(false)

    const [products, setProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)

    const [modalImage, setModalImage] = useState(null)
    const [showPendingSalesModal, setShowPendingSalesModal] = useState(false)
    const [pendingSales, setPendingSales] = useState([])
    const [loadingPending, setLoadingPending] = useState(false)
    const [showStockModal, setShowStockModal] = useState(false)
    const [stockProductId, setStockProductId] = useState(null)
    const [stockChange, setStockChange] = useState('')
    const [currentStock, setCurrentStock] = useState(0)

    // Modal states
    const [showAddSectionModal, setShowAddSectionModal] = useState(false)
    const [showAddProductModal, setShowAddProductModal] = useState(false)

    const [searchTerm, setSearchTerm] = useState('')
    const [priceFilter, setPriceFilter] = useState('')
    const [quantityFilter, setQuantityFilter] = useState('')
    const [sectionFilter, setSectionFilter] = useState('')

    useEffect(() => {
        if (!user || user.role !== 'owner') return
        fetchSections()
        fetchPendingSales()
    }, [user])

    useEffect(() => {
        const savedSection = localStorage.getItem('selectedSection')
        if (savedSection) setSelectedSection(savedSection)
    }, [])

    useEffect(() => {
        if (!selectedSection) {
            setProducts([])
            return
        }
        localStorage.setItem('selectedSection', selectedSection)
        fetchProducts(selectedSection)
    }, [selectedSection])

    const fetchSections = async () => {
        setLoadingSections(true)
        try {
            const res = await axios.get(`/products/sections/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setSections(res.data.sections)
            if (!selectedSection && res.data.sections.length) {
                setSelectedSection(res.data.sections[0])
            }
        } catch (err) {
            alert('Failed to load sections')
        } finally {
            setLoadingSections(false)
        }
    }


    const handleDeleteProduct = async (productId) => {
        try {
            const res = await fetch(`/api/products/delete/${productId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // or however you store auth
                },
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || "Failed to delete product")

            // Update local state (adjust based on how your state is structured)
            setProducts(prev => prev.filter(p => p._id !== productId))

            toast.success(data.message || "Product deleted")
        } catch (err) {
            console.error("❌ Delete error:", err)
            toast.error(err.message || "Failed to delete product")
        }
    }
    const fetchProducts = async (section) => {
        setLoadingProducts(true)
        try {
            const res = await axios.get(`/products/products/${user.shopId}/${section}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setProducts(res.data)
        } catch {
            alert('Failed to load products')
        } finally {
            setLoadingProducts(false)
        }
    }

    const fetchPendingSales = async () => {
        setLoadingPending(true)
        try {
            const res = await axios.get(`/pending-sales/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })

            const flattenedSales = []

            if (Array.isArray(res.data)) {
                res.data.forEach((sale) => {
                    if (Array.isArray(sale.items) && sale.items.length > 0) {
                        sale.items.forEach((item, index) => {
                            flattenedSales.push({
                                key: `${sale._id}-${item.productId?._id || index}`,
                                saleId: sale._id,
                                section: item.productId?.section || 'N/A',
                                productName: item.productId?.name || 'N/A',
                                quantity: item.quantity,
                                employeeName: sale.employeeId?.username || 'Unknown',
                                createdAt: sale.createdAt,
                            })
                        })
                    } else {
                        flattenedSales.push({
                            key: `${sale._id}-noitems`,
                            saleId: sale._id,
                            section: 'N/A',
                            productName: 'N/A',
                            quantity: 0,
                            employeeName: sale.employeeId?.username || 'Unknown',
                            createdAt: sale.createdAt,
                        })
                    }
                })
            }

            setPendingSales(flattenedSales)
        } catch (err) {
            alert('Failed to fetch pending sales')
        } finally {
            setLoadingPending(false)
        }
    }

    const handleDeletePending = async (saleId) => {
        if (!window.confirm('Delete this pending sale?')) return
        try {
            await axios.delete(`/pending-sales/delete/${saleId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            fetchPendingSales()
        } catch {
            alert('Failed to delete')
        }
    }

    const handleAddSection = async (sectionName) => {
        if (!sectionName.trim()) return alert('Section name cannot be empty')
        try {
            await axios.post(
                '/products/add-section',
                {
                    shopId: user.shopId,
                    sectionName: sectionName.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            alert('Section added')
            fetchSections()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add section')
        }
    }

    const handleStockChange = async () => {
        if (!stockProductId) return
        const change = Number(stockChange)
        if (isNaN(change) || change === 0) {
            alert('Enter a non-zero number')
            return
        }
        if (change < 0 && currentStock + change < 0) {
            alert('Stock cannot be negative')
            return
        }
        try {
            await axios.patch(
                `/products/restock/${stockProductId}`,
                { quantity: change },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            alert('Stock updated')
            fetchProducts(selectedSection)
            setShowStockModal(false)
            setStockChange('')
            setStockProductId(null)
            setCurrentStock(0)
        } catch {
            alert('Failed to update stock')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!user || user.role !== 'owner') return null

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (sectionFilter ? product.section === sectionFilter : true) &&
        (priceFilter ? product.price <= Number(priceFilter) : true) &&
        (quantityFilter ? product.quantity >= Number(quantityFilter) : true)
    );

    return (
        <div className="max-w-7xl mx-auto">
            <Navbar
                appName="Shopy"
                onAnalytics={() => navigate('/owner/analytics')}
                onPendingCart={() => setShowPendingSalesModal(true)}
                onLogout={handleLogout}
                onAddSection={() => setShowAddSectionModal(true)}
                onAddProduct={() => setShowAddProductModal(true)}
                showAddProduct={true}
                disableAddProduct={!selectedSection}
            />
            <div className="p-6">
                {/* Sections & Search Bar Row */}
                <section className="mb-10">
                    <div className="flex items-center mb-4 gap-4">
                        {/* Left: Stylish Section Dropdown */}
                        <div className="flex items-center flex-1">
                            <select
                                className="border-2 border-blue-700 px-4 py-2 rounded-lg font-semibold text-blue-700 bg-white shadow focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                value={selectedSection}
                                onChange={e => setSelectedSection(e.target.value)}
                            >
                                <option value="">All Sections</option>
                                {sections.map(sec => (
                                    <option key={sec} value={sec}>{sec}</option>
                                ))}
                            </select>
                        </div>
                        {/* Middle: Search bar (centered, 40% width) */}
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
                    {loadingSections ? (
                        <Loader />
                    ) : null}
                </section>

                {/* Welcome Message */}
                <section className="mb-12 max-w-md">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">
                            Welcome, {user?.username}
                        </h2>
                    </div>
                </section>



                {/* Products */}
                <section>
                    <h2 className="text-2xl font-semibold mb-6 text-center">
                        Products in "{selectedSection || 'Select a section'}"
                    </h2>

                    {loadingProducts ? (
                        <Loader />
                    ) : filteredProducts.length === 0 ? (
                        <p className="text-center">No products found in this section.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map(({ _id, name, description, price, quantity, imageUrl }) => (
                                <div
                                    key={_id}
                                    className="relative border rounded-lg shadow-md p-4 flex flex-col bg-white"
                                >
                                    {/* Image */}
                                    <div
                                        className="cursor-pointer mb-4 h-48 overflow-hidden rounded"
                                        onClick={() => setModalImage(imageUrl)}
                                    >
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <h3 className="font-semibold text-lg text-gray-800">{name}</h3>
                                    <p className="text-gray-600 flex-grow text-sm">
                                        {description || "No description"}
                                    </p>
                                    <p className="mt-2 font-medium text-gray-900">₹{price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-700">Stock Left: {quantity}</p>

                                    {/* Update Stock Button */}
                                    <button
                                        onClick={() => {
                                            setStockProductId(_id)
                                            setShowStockModal(true)
                                            setStockChange("")
                                            setCurrentStock(quantity)
                                        }}
                                        className="mt-3 text-blue-600 hover:underline self-start text-sm"
                                    >
                                        Update Stock
                                    </button>

                                    {/* Delete Button (bottom-right) */}
                                    <div className="absolute bottom-4 right-4">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-800">
                                                    <Trash2 size={20} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Delete Product</DialogTitle>
                                                </DialogHeader>
                                                <p>Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
                                                <DialogFooter className="mt-4">
                                                    <Button variant="outline">Cancel</Button>
                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => handleDeleteProduct(_id)}
                                                    >
                                                        Confirm Delete
                                                    </Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
                {/* Pending Sales Modal */}
                {showPendingSalesModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setShowPendingSalesModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Pending Sales</h2>
                            <button
                                onClick={() => setShowPendingSalesModal(false)}
                                className="absolute top-3 right-3 text-xl font-bold hover:text-red-500"
                                aria-label="Close pending sales modal"
                            >
                                &times;
                            </button>
                            {loadingPending ? (
                                <Loader />
                            ) : pendingSales.length === 0 ? (
                                <p>No pending sales.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pendingSales.map((sale) => (
                                        <div
                                            key={sale.key}
                                            className="border p-4 rounded shadow-sm flex justify-between items-center"
                                        >
                                            <div>
                                                <p>
                                                    <strong>Section:</strong> {sale.section}
                                                </p>
                                                <p>
                                                    <strong>Product:</strong> {sale.productName}
                                                </p>
                                                <p>
                                                    <strong>Qty:</strong> {sale.quantity}
                                                </p>
                                                <p>
                                                    <strong>By:</strong> {sale.employeeName}
                                                </p>
                                                <p>
                                                    <strong>At:</strong>{' '}
                                                    {new Date(sale.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                className="text-sm text-red-600 hover:underline"
                                                onClick={() => handleDeletePending(sale.saleId)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Stock Modal */}
                {showStockModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setShowStockModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg max-w-md w-full p-6 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-semibold mb-4">Update Stock</h2>
                            <button
                                onClick={() => setShowStockModal(false)}
                                className="absolute top-3 right-3 text-xl font-bold hover:text-red-500"
                                aria-label="Close stock modal"
                            >
                                &times;
                            </button>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Stock
                                </label>
                                <input
                                    type="number"
                                    value={currentStock}
                                    readOnly
                                    className="border px-3 py-2 rounded w-full bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Change in Stock
                                </label>
                                <input
                                    type="number"
                                    placeholder="Enter positive or negative number"
                                    value={stockChange}
                                    onChange={e => setStockChange(e.target.value)}
                                    className="border px-3 py-2 rounded w-full focus:outline-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowStockModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStockChange}
                                    className="bg-blue-700 text-white px-4 py-2 rounded font-medium hover:bg-blue-800 transition"
                                >
                                    Update Stock
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {modalImage && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setModalImage(null)}
                    >
                        <img
                            src={modalImage}
                            alt="Product Large"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Add Section Modal */}
                <AddSectionModal
                    isOpen={showAddSectionModal}
                    onClose={() => setShowAddSectionModal(false)}
                    onAddSection={handleAddSection}
                />

                {/* Add Product Modal */}
                <AddProductModal
                    isOpen={showAddProductModal}
                    onClose={() => setShowAddProductModal(false)}
                    fetchProducts={fetchProducts}
                    selectedSection={selectedSection}
                    user={user}
                />
            </div>
        </div>
    )
}

export default OwnerDashboard
