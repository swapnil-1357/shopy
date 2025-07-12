import mongoose from 'mongoose'

const shopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    employeePassword: {
        type: String,
        required: true
    },
    sections: [String]
})

const Shop = mongoose.model('Shop', shopSchema)
export default Shop
