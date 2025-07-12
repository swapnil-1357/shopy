// src/lib/cloudinary.js

export const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    // Specify folder path for uploaded asset
    formData.append('folder', 'section/product')

    const res = await fetch(url, {
        method: 'POST',
        body: formData,
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error?.message || 'Upload failed')
    }

    const data = await res.json()
    return data.secure_url
}
