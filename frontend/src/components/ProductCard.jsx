import React from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

const ProductCard = React.memo(({ product, isBestSeller, addToCart }) => (
    <motion.div
        whileHover={{ scale: 1.03 }}
        className="relative group border rounded-2xl shadow-sm hover:shadow-lg p-4 flex flex-col transition duration-300 bg-white"
    >
        {isBestSeller && (
            <div className="absolute bottom-2 right-[-4px] mb-11 flex flex-col items-end group text-yellow-500 text-xs font-bold">
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
        <p className="text-gray-600 text-sm flex-grow mt-1">{product.description || 'No description available.'}</p>
        <p className="mt-2 text-base font-medium text-gray-900">₹{product.price}</p>
        <p className="text-sm text-gray-700">Stock Left: {product.quantity}</p>
        <Button
            className="mt-4 w-full"
            onClick={() => addToCart(product)}
            disabled={product.quantity <= 0}
        >
            {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
    </motion.div>
))

export default ProductCard
