import express from 'express'
import {
    addSection,
    getSections,
    addProduct,
    getProductsBySection,
    sellProduct,
    restockProduct
} from '../controllers/productController.js'

import { verifyToken, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Owner-only routes
router.post('/add-section', verifyToken, requireRole('owner'), addSection)
router.patch('/restock/:productId', verifyToken, requireRole('owner'), restockProduct)

// Both owner and employee can add products now (no role check)
router.post('/add-product', verifyToken, addProduct)

// Shared routes (any logged-in user)
router.get('/sections/:shopId', verifyToken, getSections)
router.get('/products/:shopId/:section', verifyToken, getProductsBySection)

// Employee-only route
router.post('/sell', verifyToken, requireRole('employee'), sellProduct)

export default router
