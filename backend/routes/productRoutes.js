import express from 'express'
import {
    addSection,
    getSections,
    addProduct,
    getProductsBySection,
    sellProduct,
    restockProduct,
    deleteProduct,
    deleteSection // ✅ added
} from '../controllers/productController.js'

import { verifyToken, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Owner-only routes
router.post('/add-section', verifyToken, requireRole('owner'), addSection)
router.delete('/delete-section', verifyToken, requireRole('owner'), deleteSection) // ✅ new route
router.patch('/restock/:productId', verifyToken, requireRole('owner'), restockProduct)
router.delete('/delete/:productId', verifyToken, requireRole('owner'), deleteProduct)

// Both owner and employee can add products
router.post('/add-product', verifyToken, addProduct)

// Shared routes (any logged-in user)
router.get('/sections/:shopId', verifyToken, getSections)
router.get('/products/:shopId/:section', verifyToken, getProductsBySection)

// Employee-only route
router.post('/sell', verifyToken, requireRole('employee'), sellProduct)

export default router
