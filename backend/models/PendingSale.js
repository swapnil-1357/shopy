import mongoose from 'mongoose'

const pendingSaleSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            priceAtTime: {
                type: Number,
                required: true
            }
        }
    ],
    pointsAwarded: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    confirmedAt: {
        type: Date
    }
})

pendingSaleSchema.virtual('totalPrice').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity * item.priceAtTime, 0)
})

pendingSaleSchema.set('toJSON', { virtuals: true })
pendingSaleSchema.set('toObject', { virtuals: true })
pendingSaleSchema.index({ shopId: 1, status: 1 })

const PendingSale = mongoose.model('PendingSale', pendingSaleSchema)
export default PendingSale
