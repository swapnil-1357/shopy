import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'


dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/analytics', analyticsRoutes)
const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('✅ MongoDB connected')

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`)
        })
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message)
        process.exit(1)
    }
}

startServer()
