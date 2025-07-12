import User from '../models/User.js'
import Product from '../models/Product.js'

export const getEmployeePerformance = async (req, res) => {
    const { shopId } = req.params

    try {
        const employees = await User.find({ shopId, role: 'employee' }).populate('sales.product')

        const performance = employees.map(emp => {
            const totalSold = emp.sales.reduce((sum, sale) => sum + sale.quantity, 0)

            return {
                employeeId: emp._id,
                username: emp.username,
                totalSold,
                sales: emp.sales.map(s => ({
                    productName: s.product?.name || 'Deleted Product',
                    quantity: s.quantity,
                    date: s.date
                }))
            }
        })

        performance.sort((a, b) => b.totalSold - a.totalSold)

        res.json({ performance })
    } catch (err) {
        console.error('❌ Error in getEmployeePerformance:', err)
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}
