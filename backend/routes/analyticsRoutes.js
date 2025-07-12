import express from 'express';
import { getShopAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/shop/:shopId', getShopAnalytics);

export default router;
