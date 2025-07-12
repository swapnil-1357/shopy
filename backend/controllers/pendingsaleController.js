import PendingSale from '../models/PendingSale.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// ✅ Create a pending sale
export const createPendingSale = async (req, res) => {
    const { shopId, items } = req.body
    const employeeId = req.user.id // Automatically from auth context

    if (!shopId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Invalid request payload' })
    }

    try {
        const validatedItems = []

        for (const { productId, quantity } of items) {
            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid item in items array' })
            }

            const product = await Product.findById(productId)
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${productId}` })
            }

            if (product.quantity < quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
            }

            validatedItems.push({
                productId,
                quantity,
                priceAtTime: product.price,
            })
        }

        const pendingSale = new PendingSale({
            employeeId,
            shopId,
            items: validatedItems,
        })

        await pendingSale.save()
        res.status(201).json({ message: 'Sale request submitted', pendingSale })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// ✅ Get all pending sales for a shop
export const getPendingSales = async (req, res) => {
    try {
        const { shopId } = req.params

        const sales = await PendingSale.find({ shopId, status: 'pending' })
            .populate('employeeId', 'username email')
            .populate('items.productId')

        res.json(sales)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// ✅ Confirm a pending sale — only by the employee who created it
export const confirmPendingSale = async (req, res) => {
    try {
        const { saleId } = req.params
        const userId = req.user.id

        const sale = await PendingSale.findById(saleId).populate('items.productId')
        if (!sale) return res.status(404).json({ message: 'Pending sale not found' })

        if (sale.status !== 'pending') {
            return res.status(400).json({ message: 'Sale already completed' })
        }

        if (sale.employeeId.toString() !== userId) {
            return res.status(403).json({ message: 'Only the creator can confirm this sale' })
        }

        // Deduct product quantities
        for (const item of sale.items) {
            const product = await Product.findById(item.productId._id)
            if (!product) continue

            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
            }

            product.quantity -= item.quantity
            await product.save()
        }

        const totalPoints = sale.items.reduce((acc, item) => acc + item.quantity * 1, 0)

        // Award points
        await User.findByIdAndUpdate(sale.employeeId, {
            $inc: { sellingPoints: totalPoints }
        })

        sale.status = 'completed'
        sale.pointsAwarded = totalPoints
        sale.confirmedAt = new Date()
        await sale.save()

        res.json({ message: 'Sale confirmed', sale })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// ✅ Delete a pending sale (by owner or creator)
export const deletePendingSale = async (req, res) => {
    try {
        const { saleId } = req.params
        const userId = req.user.id
        const userRole = req.user.role // 'owner' or 'employee'

        const sale = await PendingSale.findById(saleId)
        if (!sale) return res.status(404).json({ message: 'Sale not found' })

        if (userRole !== 'owner' && sale.employeeId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this sale' })
        }

        await sale.deleteOne()
        res.json({ message: 'Pending sale deleted' })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}
