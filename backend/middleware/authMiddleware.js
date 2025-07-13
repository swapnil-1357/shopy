import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// ✅ Middleware to verify JWT token
export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Token missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('_id role shopId'); // ✅ Include shopId
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            shopId: user.shopId?.toString() // ✅ Include shopId safely
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};


// ✅ Middleware to restrict access to specific roles
export const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ message: 'Forbidden: Insufficient role' })
        }
        next()
    }
}

// ✅ Optionally: allow any of multiple roles
export const requireAnyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: Role not allowed' })
        }
        next()
    }
}
