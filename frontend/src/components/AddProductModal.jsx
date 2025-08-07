import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToImageKit } from '../lib/imagekit';
import axios from '../lib/axios';

const AddProductModal = ({ isOpen, onClose, fetchProducts, selectedSection, user }) => {
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        imageFile: null,
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const imageInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    // Generate preview URL for selected image
    const previewUrl = productForm.imageFile ? URL.createObjectURL(productForm.imageFile) : null;

    // Cleanup URL object to prevent memory leak
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleProductChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'imageFile') {
            const file = files[0];
            if (file && file.size > 25 * 1024 * 1024) {
                alert('Image must be less than 25MB');
                return;
            }
            if (file && !file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }
            setProductForm((prev) => ({ ...prev, imageFile: file }));
        } else {
            setProductForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const { name, description, price, quantity, imageFile } = productForm;

        if (!name || !price || !quantity || !selectedSection) {
            alert('Please fill required fields (Name, Price, Quantity)');
            return;
        }

        if (price <= 0 || quantity <= 0) {
            alert('Price and quantity must be greater than 0');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            let imageUrl = '';

            if (imageFile) {
                console.log('Uploading image to ImageKit...');
                imageUrl = await uploadToImageKit(
                    imageFile,
                    (percent) => {
                        setUploadProgress(percent);
                    },
                    `products/${selectedSection}`
                );
                console.log('Image uploaded successfully:', imageUrl);
            }

            const productData = {
                shopId: user.shopId,
                section: selectedSection,
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                quantity: Number(quantity),
                imageUrl,
            };

            console.log('Adding product:', productData);

            await axios.post('/products/add-product', productData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            alert('✅ Product added successfully');

            setProductForm({
                name: '',
                description: '',
                price: '',
                quantity: '',
                imageFile: null,
            });

            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }

            fetchProducts(selectedSection);
            handleClose();

        } catch (err) {
            console.error('Error adding product:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to add product';
            alert(`❌ ${errorMessage}`);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        setProductForm({
            name: '',
            description: '',
            price: '',
            quantity: '',
            imageFile: null,
        });
        setUploadProgress(0);
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-xl font-bold hover:text-red-500 w-8 h-8 flex items-center justify-center"
                    aria-label="Close modal"
                    disabled={loading}
                >
                    &times;
                </button>

                <form onSubmit={handleAddProduct} className="space-y-4">
                    {/* Image Upload Section */}
                    <div className="flex flex-col items-center space-y-3">
                        <label className="text-sm font-medium">Product Image</label>

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            name="imageFile"
                            onChange={handleProductChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            disabled={loading}
                        />

                        {previewUrl && (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="h-32 w-32 object-cover rounded-md border shadow-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setProductForm(prev => ({ ...prev, imageFile: null }));
                                        if (imageInputRef.current) imageInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                    disabled={loading}
                                >
                                    ×
                                </button>
                            </div>
                        )}

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="w-full max-w-xs">
                                <div className="flex justify-between items-center text-sm text-blue-600 mb-1">
                                    <span>Uploading Image...</span>
                                    <span>{uploadProgress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div className="space-y-3">
                        <Input
                            name="name"
                            placeholder="Product Name *"
                            value={productForm.name}
                            onChange={handleProductChange}
                            required
                            disabled={loading}
                            maxLength={100}
                        />

                        <textarea
                            name="description"
                            placeholder="Product Description"
                            value={productForm.description}
                            onChange={handleProductChange}
                            disabled={loading}
                            rows={3}
                            maxLength={500}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                name="price"
                                placeholder="Price *"
                                value={productForm.price}
                                onChange={handleProductChange}
                                required
                                disabled={loading}
                            />

                            <Input
                                type="number"
                                min="1"
                                name="quantity"
                                placeholder="Quantity *"
                                value={productForm.quantity}
                                onChange={handleProductChange}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Section Info */}
                    {selectedSection && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-600">
                                <strong>Section:</strong> {selectedSection}
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading || (uploadProgress > 0 && uploadProgress < 100)}
                        className="w-full"
                    >
                        {loading
                            ? (uploadProgress > 0 && uploadProgress < 100)
                                ? `Uploading... ${uploadProgress.toFixed(0)}%`
                                : 'Adding Product...'
                            : 'Add Product'
                        }
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
