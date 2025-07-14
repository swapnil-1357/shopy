import User from '../models/User.js';

// 🔍 Get Profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        console.error('❌ getProfile error:', err.message);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

// ✏️ Update Profile
export const updateProfile = async (req, res) => {
    const { username, about, profilePicture } = req.body;

    try {
        const updated = await User.findByIdAndUpdate(
            req.user.id,
            { username, about, profilePicture },
            { new: true, runValidators: true, select: '-passwordHash' }
        );

        if (!updated) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(updated); // ✅ Return consistent shape
    } catch (err) {
        console.error('❌ updateProfile error:', err.message);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

