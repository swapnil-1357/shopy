import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser'; // ✅ Import cookie-parser

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import pendingSaleRoutes from './routes/pendingSaleRoutes.js';
import userRoutes from './routes/userRoutes.js'; // ✅ Profile routes

dotenv.config();

const app = express();

// ✅ Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'https://shopy-roan.vercel.app'],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // ✅ Parse cookies from incoming requests

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pending-sales', pendingSaleRoutes);
app.use('/api/user', userRoutes); // ✅ Mount profile routes

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');

        app.listen(PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

startServer();
