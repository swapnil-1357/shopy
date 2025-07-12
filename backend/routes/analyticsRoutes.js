import express from 'express'
import { getEmployeePerformance } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/performance/:shopId', getEmployeePerformance)

export default router
