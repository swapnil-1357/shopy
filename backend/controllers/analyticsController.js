import PendingSale from '../models/PendingSale.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

export const getShopAnalytics = async (req, res) => {
    const { shopId } = req.params

    try {
        const completedSales = await PendingSale.find({ shopId, status: 'completed' })
            .populate('items.productId')
            .populate('employeeId')

        let totalRevenue = 0
        let totalItemsSold = 0
        const productMap = new Map()
        const employeeMap = new Map()
        const employeeRevenueMap = new Map()
        const employeePointsMap = new Map()

        // 🧾 Process completed sales
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

                const emp = sale.employeeId
                const empId = emp?._id?.toString()
                if (!empId) return

                // 📦 Employee Product Map
                if (!employeeMap.has(empId)) {
                    employeeMap.set(empId, {
                        _id: empId,
                        username: emp.username,
                        profilePicture: emp.profilePicture || '',
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

                // 💰 Revenue per employee
                if (!employeeRevenueMap.has(empId)) {
                    employeeRevenueMap.set(empId, {
                        _id: empId,
                        username: emp.username,
                        profilePicture: emp.profilePicture || '',
                        revenue: 0
                    })
                }
                employeeRevenueMap.get(empId).revenue += amount

                // 🏅 Selling points (quantity sold)
                if (!employeePointsMap.has(empId)) {
                    employeePointsMap.set(empId, {
                        _id: empId,
                        username: emp.username,
                        profilePicture: emp.profilePicture || '',
                        sellingPoints: 0
                    })
                }
                employeePointsMap.get(empId).sellingPoints += quantity
            })
        })

        const products = Array.from(productMap.values())
        const employeeProductSales = Array.from(employeeMap.values())

        const maxProductSold = products.length > 0
            ? Math.max(...products.map(p => p.totalSold))
            : 0

        const topProduct = products.filter(p => p.totalSold === maxProductSold)
        const topProductIds = topProduct.map(p => p._id)

        const employeeRevenueList = Array.from(employeeRevenueMap.values())
        const maxRevenue = employeeRevenueList.length > 0
            ? Math.max(...employeeRevenueList.map(e => e.revenue))
            : 0

        const topEmployee = employeeRevenueList.filter(e => e.revenue === maxRevenue)

        const topEmployees = Array.from(employeePointsMap.values())
            .sort((a, b) => b.sellingPoints - a.sellingPoints)
            .slice(0, 5)

        // ✅ Get ALL employees of the shop
        const allShopEmployees = await User.find({ shopId, role: 'employee' }).select('username profilePicture _id')

        const allEmployees = allShopEmployees.map(emp => {
            const empId = emp._id.toString()
            const pointsData = employeePointsMap.get(empId)
            return {
                _id: empId,
                username: emp.username,
                profilePicture: emp.profilePicture || '',
                sellingPoints: pointsData?.sellingPoints || 0
            }
        })

        res.json({
            totalRevenue,
            totalItemsSold,
            products,
            employeeProductSales,
            topEmployees,
            topProduct,
            topProductIds,
            topEmployee,
            allEmployees // ✅ frontend can use this to show full list with profile
        })

    } catch (err) {
        console.error('❌ getShopAnalytics error:', err)
        res.status(500).json({ message: 'Analytics fetch failed', error: err.message })
    }
}
