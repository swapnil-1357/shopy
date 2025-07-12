import Shop from '../models/Shop.js'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Token generator
const generateToken = (user) => {
    if (!user || !user._id || !user.role) {
        throw new Error("User info missing while generating token")
    }
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
}

// Owner Registration
export const registerOwner = async (req, res) => {
    const { shopName, employeePassword, username } = req.body

    try {
        if (!shopName || !employeePassword || !username) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const existingShop = await Shop.findOne({ name: shopName })
        if (existingShop) {
            return res.status(400).json({ message: 'Shop already exists' })
        }

        const hashedPassword = await bcrypt.hash(employeePassword, 10)
        const shop = await Shop.create({ name: shopName, employeePassword: hashedPassword })

        const user = await User.create({
            username,
            role: 'owner',
            shopId: shop._id
        })

        const token = generateToken(user)
        res.status(201).json({ token, user })

    } catch (err) {
        console.error("❌ registerOwner error:", err.message)
        res.status(500).json({ error: err.message })
    }
}

// Employee Registration
export const registerEmployee = async (req, res) => {
    const { shopName, employeePassword, username } = req.body

    try {
        if (!shopName || !employeePassword || !username) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        const shop = await Shop.findOne({ name: shopName })
        if (!shop) {
            return res.status(403).json({ message: 'Invalid shop or password' })
        }

        const isMatch = await bcrypt.compare(employeePassword, shop.employeePassword)
        if (!isMatch) {
            return res.status(403).json({ message: 'Invalid shop or password' })
        }

        const existingUser = await User.findOne({ username, shopId: shop._id })
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken in this shop' })
        }

        const user = await User.create({
            username,
            role: 'employee',
            shopId: shop._id
        })

        const token = generateToken(user)
        res.status(201).json({ token, user })

    } catch (err) {
        console.error("❌ registerEmployee error:", err.message)
        res.status(500).json({ error: err.message })
    }
}

// Login functions remain unchanged
export const loginOwner = async (req, res) => {
    const { shopName, username } = req.body

    try {
        const shop = await Shop.findOne({ name: shopName })
        if (!shop) return res.status(404).json({ message: 'Shop not found' })

        const user = await User.findOne({ username, role: 'owner', shopId: shop._id })
        if (!user) return res.status(404).json({ message: 'Owner not found' })

        const token = generateToken(user)
        res.status(200).json({ token, user })

    } catch (err) {
        console.error("❌ loginOwner error:", err.message)
        res.status(500).json({ error: err.message })
    }
}

export const loginEmployee = async (req, res) => {
    const { shopName, username } = req.body

    try {
        const shop = await Shop.findOne({ name: shopName })
        if (!shop) return res.status(404).json({ message: 'Shop not found' })

        const user = await User.findOne({ username, role: 'employee', shopId: shop._id })
        if (!user) return res.status(404).json({ message: 'Employee not found' })

        const token = generateToken(user)
        res.status(200).json({ token, user })

    } catch (err) {
        console.error("❌ loginEmployee error:", err.message)
        res.status(500).json({ error: err.message })
    }
}
