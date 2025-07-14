import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: String,
    role: { type: String, enum: ['owner', 'employee'], required: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
    about: { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    sales: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: Number,
            date: { type: Date, default: Date.now }
        }
    ]
})

export default mongoose.model('User', userSchema)
