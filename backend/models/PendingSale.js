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
            priceAtSale: { 
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

// ✅ Virtual: totalPrice (computed on the fly, not stored in DB)
pendingSaleSchema.virtual('totalPrice').get(function () {
    return this.items.reduce((sum, item) => sum + item.quantity * item.priceAtSale, 0); // ✅ Use priceAtSale
});


// Enable virtuals in JSON output
pendingSaleSchema.set('toJSON', { virtuals: true })
pendingSaleSchema.set('toObject', { virtuals: true })

// 📈 Useful compound index for analytics queries
pendingSaleSchema.index({ shopId: 1, status: 1 })

const PendingSale = mongoose.model('PendingSale', pendingSaleSchema)
export default PendingSale
