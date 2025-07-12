import express from 'express'
import {
    createPendingSale,
    getPendingSales,
    confirmPendingSale,
    deletePendingSale,
} from '../controllers/pendingsaleController.js'

import { verifyToken, requireAnyRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes below require authentication
router.use(verifyToken)

// @route   POST /api/pending-sale/create
// @desc    Create a pending sale (employee only)
// @access  Employee
router.post('/create', requireAnyRole('employee'), createPendingSale)

// @route   GET /api/pending-sale/shop/:shopId
// @desc    Get all pending sales for a shop
// @access  Owner or employee
router.get('/shop/:shopId', requireAnyRole('employee', 'owner'), getPendingSales)

// @route   PUT /api/pending-sale/confirm/:saleId
// @desc    Confirm a sale (only by the employee who created it)
// @access  Employee
router.put('/confirm/:saleId', requireAnyRole('employee'), confirmPendingSale)

// @route   DELETE /api/pending-sale/delete/:saleId
// @desc    Delete or cancel a pending sale
// @access  Owner or employee
router.delete('/delete/:saleId', requireAnyRole('employee', 'owner'), deletePendingSale)

export default router
