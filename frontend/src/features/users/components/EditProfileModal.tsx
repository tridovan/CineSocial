import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { userService } from '../services/userService';
import { mediaService } from '@/features/media/services/mediaService';
import toast from 'react-hot-toast';

import { getFullMediaUrl } from '@/config/media';

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    bio: z.string().optional(),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: {
        firstName?: string;
        lastName?: string;
        imgUrl?: string;
        bio?: string;
        backgroundImgUrl?: string;
    };
    onUpdateSuccess: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onUpdateSuccess }: EditProfileModalProps) => {
    const { user, fetchProfile } = useAuthStore();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(currentProfile.imgUrl ? getFullMediaUrl(currentProfile.imgUrl) : null);

    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [previewBackgroundUrl, setPreviewBackgroundUrl] = useState<string | null>(currentProfile.backgroundImgUrl ? getFullMediaUrl(currentProfile.backgroundImgUrl) : null);

    const [isUploading, setIsUploading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<UpdateProfileSchema>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: currentProfile.firstName || '',
            lastName: currentProfile.lastName || '',
            bio: currentProfile.bio || '',
        },
    });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBackgroundFile(file);
            setPreviewBackgroundUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: UpdateProfileSchema) => {
        if (!user?.id) return;

        try {
            setIsUploading(true);
            let imgUrl = currentProfile.imgUrl;
            let backgroundImgUrl = currentProfile.backgroundImgUrl;

            // Upload new avatar if selected
            if (avatarFile) {
                const response = await mediaService.uploadImage(avatarFile);
                imgUrl = response.url;
            }

            // Upload new background if selected
            if (backgroundFile) {
                const response = await mediaService.uploadImage(backgroundFile);
                backgroundImgUrl = response.url;
            }

            // Update profile
            await userService.updateProfile(user.id, {
                ...data,
                imgUrl,
                backgroundImgUrl,
            });

            // Refresh local user data
            await fetchProfile();

            toast.success('Profile updated successfully');
            onUpdateSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/50 rounded-full p-1"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Background Upload */}
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gray-100 group border border-gray-200">
                        {previewBackgroundUrl ? (
                            <img src={previewBackgroundUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon size={32} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                            <div className="text-white font-medium flex items-center gap-2">
                                <Camera size={18} /> Change Cover
                            </div>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Avatar Upload (Overlapping) */}
                    <div className="relative -mt-16 ml-4">
                        <div className="relative group cursor-pointer w-24 h-24">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-md">
                                {previewAvatarUrl ? (
                                    <img src={previewAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 rounded-full"
                            />
                            <div className="absolute bottom-0 right-0 bg-brand-red text-white p-1.5 rounded-full shadow-md z-10 pointer-events-none">
                                <Camera size={14} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                <input
                                    {...register('firstName')}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all"
                                />
                                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                <input
                                    {...register('lastName')}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all"
                                />
                                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                {...register('bio')}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all min-h-[80px]"
                                placeholder="Tell us about yourself..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isUploading}
                            className="flex-1 py-2 bg-brand-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {(isSubmitting || isUploading) ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} /> Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
