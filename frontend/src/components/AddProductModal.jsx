import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToCloudinary } from '../lib/cloudinary';
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

    const handleProductChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'imageFile') {
            setProductForm((prev) => ({ ...prev, imageFile: files[0] }));
        } else {
            setProductForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        const { name, description, price, quantity, imageFile } = productForm;

        if (!name || !price || !quantity || !selectedSection) {
            alert('Please fill required fields');
            return;
        }

        if (imageFile && imageFile.size > 100 * 1024 * 1024) {
            alert('Image must be less than 100MB');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile, (percent) => {
                    setUploadProgress(percent);
                });
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
            );

            alert('Product added successfully');
            setProductForm({
                name: '',
                description: '',
                price: '',
                quantity: '',
                imageFile: null,
            });
            if (imageInputRef.current) imageInputRef.current.value = '';
            fetchProducts(selectedSection);
            onClose(); // Close modal after adding product
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add product');
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <h2 className="text-2xl font-semibold mb-4">Add Product</h2>
                <button onClick={onClose} className="absolute top-3 right-3 text-xl font-bold hover:text-red-500" aria-label="Close modal">
                    &times;
                </button>
                <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="flex flex-col items-center">
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            name="imageFile"
                            onChange={handleProductChange}
                            className="block mb-2"
                        />
                        {productForm.imageFile && (
                            <img
                                src={URL.createObjectURL(productForm.imageFile)}
                                alt="Preview"
                                className="h-32 w-32 object-cover rounded mb-2 border"
                            />
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <p className="text-sm text-blue-600">Uploading Image: {uploadProgress.toFixed(0)}%</p>
                        )}
                    </div>
                    <Input
                        name="name"
                        placeholder="Product Name"
                        value={productForm.name}
                        onChange={handleProductChange}
                        required
                    />
                    <Input
                        name="description"
                        placeholder="Description"
                        value={productForm.description}
                        onChange={handleProductChange}
                    />
                    <Input
                        type="number"
                        min="0"
                        name="price"
                        placeholder="Price"
                        value={productForm.price}
                        onChange={handleProductChange}
                        required
                    />
                    <Input
                        type="number"
                        min="0"
                        name="quantity"
                        placeholder="Quantity"
                        value={productForm.quantity}
                        onChange={handleProductChange}
                        required
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;