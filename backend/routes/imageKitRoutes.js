import express from 'express';
import ImageKit from 'imagekit';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Define the auth endpoints
router.get('/auth', (req, res) => {
    try {
        const authenticationParameters = imagekit.getAuthenticationParameters();
        res.status(200).json(authenticationParameters);        // Send the parameters back to the client
    } catch (error) {
        console.error('❌ Error generating ImageKit auth params:', error);
        res.status(500).json({ message: 'Could not generate authentication parameters.' });
    }
});

export default router;