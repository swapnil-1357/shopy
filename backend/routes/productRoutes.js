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
router.post('/add-product', verifyToken, requireRole('owner'), addProduct)
router.patch('/restock/:productId', verifyToken, requireRole('owner'), restockProduct)

// Shared routes
router.get('/sections/:shopId', verifyToken, getSections)
router.get('/products/:shopId/:section', verifyToken, getProductsBySection)

// Employee-only route
router.post('/sell', verifyToken, requireRole('employee'), sellProduct)

export default router
