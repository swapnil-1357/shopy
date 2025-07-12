import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ['owner', 'employee'], required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    sales: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            date: { type: Date, default: Date.now }
        }
    ]
})

export default mongoose.model('User', userSchema)
