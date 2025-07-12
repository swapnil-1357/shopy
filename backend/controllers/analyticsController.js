import PendingSale from '../models/PendingSale.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

export const getShopAnalytics = async (req, res) => {
    const { shopId } = req.params;

    try {
        // Get all completed sales for the shop
        const completedSales = await PendingSale.find({ shopId, status: 'completed' })
            .populate('items.productId')
            .populate('employeeId');

        let totalSales = completedSales.length;
        let employeeStats = {};
        let productStats = {};

        completedSales.forEach((sale) => {
            const empId = sale.employeeId?._id?.toString();
            const empName = sale.employeeId?.name || 'Unknown';

            if (!employeeStats[empId]) {
                employeeStats[empId] = { name: empName, salesCount: 0 };
            }
            employeeStats[empId].salesCount += 1;

            sale.items.forEach(({ productId, quantity }) => {
                if (!productId) return;
                const prodId = productId._id.toString();
                if (!productStats[prodId]) {
                    productStats[prodId] = {
                        name: productId.name,
                        totalSold: 0,
                    };
                }
                productStats[prodId].totalSold += quantity;
            });
        });

        res.json({
            totalSales,
            employeeStats,
            productStats,
        });
    } catch (err) {
        res.status(500).json({ message: 'Analytics fetch failed', error: err.message });
    }
};
