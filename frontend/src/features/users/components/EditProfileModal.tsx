import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, X, Camera } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { userService } from '../services/userService';
import { mediaService } from '@/features/media/services/mediaService';
import toast from 'react-hot-toast';

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
});

type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: {
        firstName?: string;
        lastName?: string;
        imgUrl?: string;
    };
    onUpdateSuccess: () => void;
}

export const EditProfileModal = ({ isOpen, onClose, currentProfile, onUpdateSuccess }: EditProfileModalProps) => {
    const { user, fetchProfile } = useAuthStore();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentProfile.imgUrl || null);
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
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: UpdateProfileSchema) => {
        if (!user?.id) return;

        try {
            setIsUploading(true);
            let imgUrl = currentProfile.imgUrl;

            // Upload new avatar if selected
            if (avatarFile) {
                imgUrl = await mediaService.uploadImage(avatarFile);
            }

            // Update profile
            await userService.updateProfile(user.id, {
                ...data,
                imgUrl,
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
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 group-hover:border-brand-red transition-all">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Camera size={32} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="absolute bottom-0 right-0 bg-brand-red text-white p-1 rounded-full shadow-sm">
                                <Camera size={14} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Click to change avatar</p>
                    </div>

                    <div className="space-y-4">
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
                    </div>

                    <div className="flex gap-3 pt-4">
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
