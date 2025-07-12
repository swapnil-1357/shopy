import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import axios from '../lib/axios'
import { uploadToCloudinary } from '../lib/cloudinary'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BarChart2, ShoppingCart } from 'lucide-react'

const OwnerDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const [sections, setSections] = useState([])
    const [newSectionName, setNewSectionName] = useState('')
    const [loadingSections, setLoadingSections] = useState(false)

    const [selectedSection, setSelectedSection] = useState('')
    const [products, setProducts] = useState([])
    const [loadingProducts, setLoadingProducts] = useState(false)

    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        imageFile: null,
    })
    const [loadingProductAdd, setLoadingProductAdd] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [modalImage, setModalImage] = useState(null)

    const [pendingSales, setPendingSales] = useState([])
    const [loadingPending, setLoadingPending] = useState(false)

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    useEffect(() => {
        if (!user || user.role !== 'owner') return
        fetchSections()
        fetchPendingSales()
    }, [user])

    useEffect(() => {
        if (!selectedSection) {
            setProducts([])
            return
        }
        fetchProducts(selectedSection)
    }, [selectedSection])

    const fetchSections = async () => {
        setLoadingSections(true)
        try {
            const res = await axios.get(`/products/sections/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setSections(res.data.sections)
            if (res.data.sections.length) {
                setSelectedSection(res.data.sections[0])
            }
        } catch (err) {
            alert('Failed to load sections')
        } finally {
            setLoadingSections(false)
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

    const handleProductChange = (e) => {
        const { name, value, files } = e.target
        if (name === 'imageFile') {
            setProductForm((prev) => ({ ...prev, imageFile: files[0] }))
        } else {
            setProductForm((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        const { name, description, price, quantity, imageFile } = productForm

        if (!name || !price || !quantity || !selectedSection) {
            alert('Please fill required fields')
            return
        }

        if (imageFile && imageFile.size > 100 * 1024 * 1024) {
            alert('Image must be less than 100MB')
            return
        }

        setLoadingProductAdd(true)
        setUploadProgress(0)

        try {
            let imageUrl = ''
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile, (percent) => {
                    setUploadProgress(percent)
                })
            }

            await axios.post(
                '/products/add-product',
                {
                    shopId: user.shopId,
                    section: selectedSection,
                    name,
                    description,
                    price: Number(price),
                    quantity: Number(quantity),
                    imageUrl,
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            alert('Product added successfully')
            setProductForm({
                name: '',
                description: '',
                price: '',
                quantity: '',
                imageFile: null,
            })
            fetchProducts(selectedSection)
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add product')
        } finally {
            setLoadingProductAdd(false)
            setUploadProgress(0)
        }
    }

    const handleRestock = async (productId) => {
        const quantity = prompt('Enter quantity to restock:')
        if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
            alert('Invalid quantity')
            return
        }
        try {
            await axios.patch(
                `/products/restock/${productId}`,
                { quantity: Number(quantity) },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            alert('Product restocked')
            fetchProducts(selectedSection)
        } catch {
            alert('Failed to restock product')
        }
    }

    const fetchPendingSales = async () => {
        setLoadingPending(true)
        try {
            const res = await axios.get(`/pending-sale/shop/${user.shopId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            setPendingSales(res.data)
        } catch (err) {
            alert('Failed to fetch pending sales')
        } finally {
            setLoadingPending(false)
        }
    }

    const handleDeletePending = async (saleId) => {
        if (!window.confirm('Delete this pending sale?')) return
        try {
            await axios.delete(`/pending-sale/delete/${saleId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            })
            fetchPendingSales()
        } catch {
            alert('Failed to delete')
        }
    }
    const handleAddSection = async () => {
        if (!newSectionName.trim()) return alert('Section name cannot be empty')
        try {
            const res = await axios.post(
                '/products/add-section',
                {
                    shopId: user.shopId,
                    sectionName: newSectionName.trim(),
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                }
            )
            alert('Section added')
            setNewSectionName('')
            fetchSections()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add section')
        }
    }

    if (!user || user.role !== 'owner') return null

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Welcome, {user.username}</h1>
                <div className="flex gap-4 items-center">
                    <Button variant="outline" onClick={() => navigate('/owner/analytics')} className="flex gap-2 items-center">
                        <BarChart2 size={18} /> Analytics
                    </Button>
                    <Button variant="outline" className="flex gap-2 items-center">
                        <ShoppingCart size={18} /> Pending Cart
                    </Button>
                    <Button onClick={handleLogout} variant="destructive">Logout</Button>
                </div>
            </div>

            {/* Sections */}
            <section className="mb-10">
                <h2 className="text-2xl font-semibold mb-4">Sections</h2>
                {loadingSections ? (
                    <p>Loading sections...</p>
                ) : (
                    <>
                        <div className="flex gap-4 flex-wrap mb-4">
                            {sections.map((sec) => (
                                <button
                                    key={sec}
                                    onClick={() => setSelectedSection(sec)}
                                    className={`px-4 py-2 rounded font-medium ${sec === selectedSection ? 'bg-blue-700 text-white' : 'bg-gray-300 hover:bg-gray-400'}`}
                                >
                                    {sec}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3 max-w-md">
                            <input
                                type="text"
                                placeholder="New section name"
                                value={newSectionName}
                                onChange={(e) => setNewSectionName(e.target.value)}
                                className="border px-3 py-2 rounded flex-grow"
                            />
                            <Button onClick={handleAddSection}>Add Section</Button>
                        </div>
                    </>
                )}
            </section>

            {/* Add Product */}
            <section className="mb-12 max-w-md">
                <h2 className="text-2xl font-semibold mb-4">
                    Add Product to "{selectedSection || 'Select a section'}"
                </h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <Input name="name" placeholder="Product Name" value={productForm.name} onChange={handleProductChange} required />
                    <Input name="description" placeholder="Description" value={productForm.description} onChange={handleProductChange} />
                    <Input type="number" min="0" name="price" placeholder="Price" value={productForm.price} onChange={handleProductChange} required />
                    <Input type="number" min="0" name="quantity" placeholder="Quantity" value={productForm.quantity} onChange={handleProductChange} required />
                    <input type="file" accept="image/*" name="imageFile" onChange={handleProductChange} className="block" />
                    {uploadProgress > 0 && uploadProgress < 100 && <p>Uploading Image: {uploadProgress.toFixed(0)}%</p>}
                    <Button type="submit" disabled={loadingProductAdd}>
                        {loadingProductAdd ? 'Adding...' : 'Add Product'}
                    </Button>
                </form>
            </section>

            {/* Products */}
            <section>
                <h2 className="text-2xl font-semibold mb-6">Products in "{selectedSection || 'Select a section'}"</h2>
                {loadingProducts ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <p>No products found in this section.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map(({ _id, name, description, price, quantity, imageUrl }) => (
                            <div key={_id} className="border rounded-lg shadow-md p-4 flex flex-col">
                                <div className="cursor-pointer mb-4 h-48 overflow-hidden rounded" onClick={() => setModalImage(imageUrl)}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">No Image</div>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg">{name}</h3>
                                <p className="text-gray-600 flex-grow">{description || 'No description'}</p>
                                <p className="mt-2 font-medium">${price.toFixed(2)}</p>
                                <p className="text-sm text-gray-700">Quantity: {quantity}</p>
                                <button onClick={() => handleRestock(_id)} className="mt-3 text-blue-600 hover:underline self-start">
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Pending Sales */}
            <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4">Pending Sales</h2>
                {loadingPending ? (
                    <p>Loading pending sales...</p>
                ) : pendingSales.length === 0 ? (
                    <p>No pending sales.</p>
                ) : (
                    <div className="space-y-4">
                        {pendingSales.map((sale) => (
                            <div key={sale._id} className="border p-4 rounded shadow-sm flex justify-between items-center">
                                <div>
                                    <p><strong>Section:</strong> {sale.section}</p>
                                    <p><strong>Product:</strong> {sale.productName}</p>
                                    <p><strong>Qty:</strong> {sale.quantity}</p>
                                    <p><strong>By:</strong> {sale.employeeName}</p>
                                    <p><strong>At:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
                                </div>
                                <button className="text-sm text-red-600 hover:underline" onClick={() => handleDeletePending(sale._id)}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Modal */}
            {modalImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImage(null)}>
                    <img src={modalImage} alt="Product Large" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()} />
                    <button onClick={() => setModalImage(null)} className="absolute top-5 right-5 text-white text-3xl font-bold hover:text-red-500" aria-label="Close modal">
                        &times;
                    </button>
                </div>
            )}
        </div>
    )
}

export default OwnerDashboard
