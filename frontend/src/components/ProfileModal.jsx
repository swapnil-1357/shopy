import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { User2, UploadCloud } from 'lucide-react'
import { uploadToImageKit, getOptimizedImageUrl } from '@/lib/imagekit'

const ProfileModal = ({ trigger }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [profile, setProfile] = useState({
        username: '',
        role: '',
        about: '',
        profilePicture: '',
    })

    const [form, setForm] = useState({ about: '', profilePicture: '' })

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await api.get('/user/profile', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            })
            setProfile(res.data)
            setForm({
                about: res.data.about || '',
                profilePicture: res.data.profilePicture || '',
            })
        } catch (err) {
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file size (10MB limit for profile pictures)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('❌ Image must be less than 10MB')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('❌ Please select a valid image file')
            return
        }

        setUploadingImage(true)
        setUploadProgress(0)

        try {
            const imageUrl = await uploadToImageKit(
                file,
                (progress) => setUploadProgress(Math.round(progress)),
                'profiles' // Folder for profile pictures
            )

            if (imageUrl) {
                setForm((prev) => ({ ...prev, profilePicture: imageUrl }))
                toast.success('✅ Image uploaded successfully')
            } else {
                throw new Error('Upload failed - no URL returned')
            }
        } catch (err) {
            console.error('Upload error:', err)
            toast.error(`❌ ${err.message || 'Failed to upload image'}`)
        } finally {
            setUploadingImage(false)
            setUploadProgress(0)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            const res = await api.patch(
                '/user/profile',
                {
                    about: form.about.trim(),
                    profilePicture: form.profilePicture.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            )
            toast.success('✅ Profile updated')
            setProfile(res.data.user)
            setOpen(false)
        } catch (err) {
            toast.error(err?.response?.data?.message || '❌ Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        if (open) fetchProfile()
    }, [open])

    // Generate optimized image URL for display
    const optimizedProfilePicture = form.profilePicture
        ? getOptimizedImageUrl(form.profilePicture, {
            width: 96,
            height: 96,
            quality: 80,
            crop: 'force'
        })
        : ''

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon">
                        <User2 />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-6 text-center text-muted">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center gap-2">
                            {optimizedProfilePicture ? (
                                <img
                                    src={optimizedProfilePicture}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border shadow"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm">
                                    No Image
                                </div>
                            )}

                            <label className="text-sm font-medium">Change Profile Picture</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                            {uploadingImage && (
                                <div className="text-center">
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center">
                                        <UploadCloud className="w-4 h-4 animate-pulse" />
                                        Uploading... {uploadProgress}%
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Username</label>
                            <Input value={profile?.username || ''} readOnly disabled />
                        </div>

                        {/* Role */}
                        <div>
                            <label className="text-sm font-medium block mb-1">Role</label>
                            <Input value={profile?.role || ''} readOnly disabled />
                        </div>

                        {/* About */}
                        <div>
                            <label className="text-sm font-medium block mb-1">About</label>
                            <Textarea
                                rows={4}
                                value={form.about}
                                onChange={(e) => setForm({ ...form, about: e.target.value })}
                                placeholder="Tell us something about yourself..."
                            />
                        </div>
                    </div>
                )}

                <DialogFooter className="pt-4">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || uploadingImage || loading}>
                        {saving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ProfileModal