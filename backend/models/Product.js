import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    imageUrl: String,
    section: String, // e.g. "Electronics"
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
})

const Product = mongoose.model('Product', productSchema)
export default Product
