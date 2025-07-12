import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from '../lib/axios'
import { useAuth } from './AuthContext'

const ProductContext = createContext()

export const ProductProvider = ({ children }) => {
    const { user } = useAuth()
    const [sections, setSections] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchSections = async () => {
        if (!user) return
        try {
            setLoading(true)
            const res = await axios.get(`/products/sections/${user.shopId}`)
            setSections(res.data.sections)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchProductsBySection = async (section) => {
        if (!user) return
        try {
            setLoading(true)
            const res = await axios.get(`/products/products/${user.shopId}/${section}`)
            setProducts(res.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addSection = async (sectionName) => {
        if (!user) return
        try {
            const res = await axios.post('/products/add-section', {
                shopId: user.shopId,
                sectionName,
            })
            setSections(res.data.sections)
            return true
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add section')
            return false
        }
    }

    const addProduct = async (product) => {
        if (!user) return
        try {
            const payload = { ...product, shopId: user.shopId }
            const res = await axios.post('/products/add-product', payload)
            // Optionally refresh products list or append locally
            return res.data.product
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add product')
            return null
        }
    }

    const sellProduct = async ({ productId, quantitySold }) => {
        if (!user) return
        try {
            const res = await axios.post('/products/sell', {
                productId,
                employeeId: user._id,
                quantitySold,
            })
            return res.data
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to sell product')
            return null
        }
    }

    return (
        <ProductContext.Provider
            value={{
                sections,
                products,
                loading,
                error,
                fetchSections,
                fetchProductsBySection,
                addSection,
                addProduct,
                sellProduct,
            }}
        >
            {children}
        </ProductContext.Provider>
    )
}

export const useProduct = () => useContext(ProductContext)
