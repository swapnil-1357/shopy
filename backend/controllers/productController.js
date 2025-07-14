import Shop from '../models/Shop.js'
import Product from '../models/Product.js'
import User from '../models/User.js'

// Add section (Owner only)
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


// Delete section (Owner only)
export const deleteSection = async (req, res) => {
    const { shopId, sectionName } = req.body;
    const user = req.user; // from verifyToken middleware

    try {
        if (!user || user.role !== 'owner') {
            return res.status(403).json({ message: 'Unauthorized: Only owner can delete sections' });
        }

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: 'Shop not found' });
        }

        const sectionIndex = shop.sections.indexOf(sectionName);
        if (sectionIndex === -1) {
            return res.status(404).json({ message: 'Section not found in shop' });
        }

        // Remove the section
        shop.sections.splice(sectionIndex, 1);
        await shop.save();

        // Optional: Remove products in that section
        await Product.deleteMany({ shopId, section: sectionName });

        res.json({
            message: 'Section deleted successfully',
            sections: shop.sections
        });
    } catch (err) {
        console.error('❌ Error in deleteSection:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get sections (any logged-in user)
export const getSections = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.shopId)
        if (!shop) return res.status(404).json({ message: 'Shop not found' })
        res.json({ sections: shop.sections })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Add product (Owner or Employee)
export const addProduct = async (req, res) => {
    const { shopId, section, name, description, price, quantity, imageUrl } = req.body
    const user = req.user // from verifyToken middleware (should include user info)

    try {
        if (!user || !shopId) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const newProduct = new Product({
            shopId,
            section,
            name,
            description,
            price,
            quantity,
            imageUrl,
            addedBy: user.role,
            addedByUsername: user.username
        })

        await newProduct.save()
        res.json({ message: 'Product added', product: newProduct })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Get products by section (any logged-in user)
export const getProductsBySection = async (req, res) => {
    const { shopId, section } = req.params
    try {
        const products = await Product.find({ shopId, section })
        res.json(products)
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}

// Delete product (Owner only)
export const deleteProduct = async (req, res) => {
    const { productId } = req.params;
    const user = req.user;

    console.log("📦 DELETE /delete/:productId =>", productId);
    console.log("👤 User info:", user);

    try {
        const product = await Product.findById(productId);
        console.log("🔍 Fetched product:", product);

        if (!product) {
            console.warn("❌ Product not found");
            return res.status(404).json({ message: 'Product not found' });
        }

        if (!user || !user.shopId) {
            console.error("❌ Invalid user or missing shopId");
            return res.status(401).json({ message: 'Unauthorized: Missing user/shop info' });
        }

        if (product.shopId.toString() !== user.shopId.toString()) {
            console.warn("🚫 Unauthorized delete attempt by user:", user.username);
            return res.status(403).json({ message: 'Unauthorized: Product does not belong to your shop' });
        }

        await Product.findByIdAndDelete(productId);
        console.log("✅ Product deleted successfully");

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('❌ Server error in deleteProduct:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Sell product (Employee only)
export const sellProduct = async (req, res) => {
    const { productId, employeeId, quantitySold } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.quantity < quantitySold) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Decrease product quantity
        product.quantity -= quantitySold;
        await product.save();

        // Find employee and log the sale
        const employee = await User.findById(employeeId);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found or invalid role' });
        }

        employee.sales.push({
            product: productId,
            quantity: quantitySold,
            priceAtSale: product.price, // ✅ Record the price at the time of sale
            date: new Date()
        });
        await employee.save();

        res.json({
            message: 'Product sold',
            remainingQuantity: product.quantity
        });
    } catch (err) {
        console.error('❌ Error in sellProduct:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update product price (Owner only)
export const updateProductPrice = async (req, res) => {
    const { productId } = req.params;
    const { newPrice } = req.body;
    const user = req.user;

    try {
        if (!user || user.role !== 'owner') {
            return res.status(403).json({ message: 'Unauthorized: Only owners can update price' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        product.price = newPrice;
        await product.save();

        res.json({ message: '✅ Price updated', updatedProduct: product });
    } catch (err) {
        console.error('❌ Error updating price:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Restock product (Owner only)
export const restockProduct = async (req, res) => {
    const { productId } = req.params
    const { quantity } = req.body

    if (typeof quantity !== 'number' || quantity === 0) {
        return res.status(400).json({ message: 'Invalid quantity' })
    }

    try {
        const product = await Product.findById(productId)
        if (!product) return res.status(404).json({ message: 'Product not found' })

        const newQuantity = product.quantity + quantity
        if (newQuantity < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' })
        }

        product.quantity = newQuantity
        await product.save()

        res.json({ message: 'Product stock updated', updatedQuantity: product.quantity })
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message })
    }
}