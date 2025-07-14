import PendingSale from '../models/PendingSale.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

export const getShopAnalytics = async (req, res) => {
    const { shopId } = req.params

    try {
        const completedSales = await PendingSale.find({ shopId, status: 'completed' })
            .populate('items.productId')
            .populate('employeeId')

        if (!completedSales.length) {
            return res.status(200).json({
                totalRevenue: 0,
                totalItemsSold: 0,
                products: [],
                employeeProductSales: [],
                topEmployees: [],
                topProduct: [],
                topProductIds: [],    // ✅ Include in empty state too
                topEmployee: []
            })
        }

        let totalRevenue = 0
        let totalItemsSold = 0
        const productMap = new Map()
        const employeeMap = new Map()
        const employeeRevenueMap = new Map()
        const employeePointsMap = new Map()

        completedSales.forEach((sale) => {
            sale.items.forEach(({ productId, quantity, price }) => {
                if (!productId) return

                const amount = (price || productId.price || 0) * quantity
                totalRevenue += amount
                totalItemsSold += quantity

                const prodId = productId._id.toString()
                if (!productMap.has(prodId)) {
                    productMap.set(prodId, {
                        _id: prodId,
                        name: productId.name,
                        totalSold: 0
                    })
                }
                productMap.get(prodId).totalSold += quantity

                const empId = sale.employeeId?._id?.toString()
                if (!empId) return

                // Employee Product Sales Map
                if (!employeeMap.has(empId)) {
                    employeeMap.set(empId, {
                        _id: empId,
                        username: sale.employeeId.username,
                        products: {}
                    })
                }
                const empData = employeeMap.get(empId)
                if (!empData.products[prodId]) {
                    empData.products[prodId] = {
                        name: productId.name,
                        quantity: 0
                    }
                }
                empData.products[prodId].quantity += quantity

                // Revenue by Employee
                if (!employeeRevenueMap.has(empId)) {
                    employeeRevenueMap.set(empId, {
                        _id: empId,
                        username: sale.employeeId.username,
                        revenue: 0
                    })
                }
                employeeRevenueMap.get(empId).revenue += amount

                // Selling Points (Qty Sold)
                if (!employeePointsMap.has(empId)) {
                    employeePointsMap.set(empId, {
                        _id: empId,
                        username: sale.employeeId.username,
                        sellingPoints: 0
                    })
                }
                employeePointsMap.get(empId).sellingPoints += quantity
            })
        })

        const products = Array.from(productMap.values())
        const employeeProductSales = Array.from(employeeMap.values())

        // Top-selling product(s)
        const maxProductSold = Math.max(...products.map(p => p.totalSold))
        const topProduct = products.filter(p => p.totalSold === maxProductSold)
        const topProductIds = topProduct.map(p => p._id)  // ✅ Return just IDs for frontend

        // Top-selling employee(s) by revenue
        const employeeRevenueList = Array.from(employeeRevenueMap.values())
        const maxRevenue = Math.max(...employeeRevenueList.map(e => e.revenue))
        const topEmployee = employeeRevenueList.filter(e => e.revenue === maxRevenue)

        // Top 5 employees by quantity sold
        const topEmployees = Array.from(employeePointsMap.values())
            .sort((a, b) => b.sellingPoints - a.sellingPoints)
            .slice(0, 5)

        res.json({
            totalRevenue,
            totalItemsSold,
            products,
            employeeProductSales,
            topEmployees,
            topProduct,
            topProductIds,     // ✅ Frontend will use this
            topEmployee
        })

    } catch (err) {
        console.error('getShopAnalytics error:', err)
        res.status(500).json({ message: 'Analytics fetch failed', error: err.message })
    }
}
