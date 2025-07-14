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

const ProfileModal = ({ trigger }) => {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploadingImage, setUploadingImage] = useState(false)

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

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

        setUploadingImage(true)

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            )
            const data = await res.json()
            if (data.secure_url) {
                setForm((prev) => ({ ...prev, profilePicture: data.secure_url }))
                toast.success('✅ Image uploaded')
            } else {
                throw new Error('Upload failed')
            }
        } catch (err) {
            toast.error('❌ Failed to upload image')
        } finally {
            setUploadingImage(false)
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
                            {form.profilePicture ? (
                                <img
                                    src={form.profilePicture}
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full object-cover border shadow"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
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
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <UploadCloud className="w-4 h-4 animate-pulse" /> Uploading...
                                </p>
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
