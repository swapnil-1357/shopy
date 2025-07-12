import Shop from '../models/Shop.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
// Add section
export const addSection = async (req, res) => {
    const { shopId, sectionName } = req.body
    try {
        const shop = await Shop.findById(shopId)
        if (!shop) return res.status(404).json({ message: 'Shop not found' })

        if (shop.sections.includes(sectionName)) {
            return res.status(400).json({ message: 'Section already exists' })
        }

        shop.sections.push(sectionName)
        await shop.save()

        res.json({ message: 'Section added', sections: shop.sections })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Get sections
export const getSections = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.shopId)
        if (!shop) return res.status(404).json({ message: 'Shop not found' })
        res.json({ sections: shop.sections })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Add product
export const addProduct = async (req, res) => {
    const { shopId, section, name, description, price, quantity, imageUrl } = req.body
    try {
        const newProduct = new Product({ shopId, section, name, description, price, quantity, imageUrl })
        await newProduct.save()
        res.json({ message: 'Product added', product: newProduct })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Get products by section
export const getProductsBySection = async (req, res) => {
    const { shopId, section } = req.params
    try {
        const products = await Product.find({ shopId, section })
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}


// Sell product
export const sellProduct = async (req, res) => {
    const { productId, employeeId, quantitySold } = req.body

    try {
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        if (product.quantity < quantitySold) {
            return res.status(400).json({ message: 'Insufficient stock' })
        }

        // Decrease product quantity
        product.quantity -= quantitySold
        await product.save()

        // Find employee and log the sale
        const employee = await User.findById(employeeId)
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found or invalid role' })
        }

        employee.sales.push({
            product: productId,
            quantity: quantitySold,
            date: new Date()
        })
        await employee.save()

        res.json({
            message: 'Product sold',
            remainingQuantity: product.quantity
        })
    } catch (err) {
        console.error('❌ Error in sellProduct:', err)
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}


// Restock product (Owner only)
export const restockProduct = async (req, res) => {
    const { productId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid quantity' })
    }

    try {
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: 'Product not found' })

        product.quantity += quantity
        await product.save()

        res.json({ message: 'Product restocked', updatedQuantity: product.quantity })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}
