// src/lib/imagekit.js
import axios from './axios'; // Assuming you have a pre-configured axios instance

// Helper function to get authentication parameters FROM YOUR BACKEND
const getAuthParameters = async () => {
    try {
        // This securely fetches the credentials from your server's endpoint
        const response = await axios.get('/imagekit/auth'); // The endpoint we created on the backend
        return response.data;
    } catch (error) {
        console.error('Failed to get ImageKit auth params', error);
        throw new Error('Could not authenticate with the image service. Is your backend server running?');
    }
};

export const uploadToImageKit = async (file, progressCallback = null, folder = 'products') => {
    const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;

    if (!publicKey) {
        throw new Error('ImageKit public key not found in environment variables');
    }
    if (!file) {
        throw new Error('No file provided');
    }

    // 1. Fetch the secure authentication parameters from your backend FIRST
    const { token, expire, signature } = await getAuthParameters();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', publicKey);
    formData.append('fileName', file.name);
    formData.append('folder', folder);

    // 2. Append the secure, temporary authentication parameters to the form data
    formData.append('token', token);
    formData.append('expire', expire);
    formData.append('signature', signature);

    // ... (the rest of your XMLHttpRequest code remains the same)
    try {
        const xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            if (progressCallback) {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        progressCallback(percentComplete);
                    }
                });
            }
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.url);
                    } catch (error) {
                        reject(new Error('Invalid response format'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.message || 'Upload failed'));
                    } catch {
                        reject(new Error(`Upload failed with status: ${xhr.status}`));
                    }
                }
            });
            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });
            xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');
            xhr.send(formData);
        });
    } catch (error) {
        throw new Error(`Upload failed: ${error.message}`);
    }
};


// ... (Your getOptimizedImageUrl and other functions can remain as they are)
export const getOptimizedImageUrl = (imageUrl, transformations = {}) => {
    if (!imageUrl || !imageUrl.includes('ik.imagekit.io')) {
        return imageUrl // Return original URL if not an ImageKit URL
    }
    const {
        width,
        height,
        quality = 'auto',
        format = 'auto',
        crop = 'maintain_ratio',
        background = 'auto'
    } = transformations
    let transformString = `q-${quality},f-${format}`
    if (width) transformString += `,w-${width}`
    if (height) transformString += `,h-${height}`
    if (crop) transformString += `,c-${crop}`
    if (background !== 'auto') transformString += `,bg-${background}`
    const urlParts = imageUrl.split('/')
    const fileName = urlParts.pop()
    const baseUrl = urlParts.join('/')
    return `${baseUrl}/tr:${transformString}/${fileName}`
}