import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Image, Video, X, Loader2 } from 'lucide-react';
import { postService } from '../services/postService';
import { mediaService } from '@/features/media/services/mediaService';
import { getFullMediaUrl } from '@/config/media';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { ResourceType } from '../types';

interface CreatePostProps {
    onPostCreated: () => void;
}

interface CreatePostForm {
    content: string;
    title: string;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
    const { user } = useAuthStore();
    const { register, handleSubmit, reset, watch } = useForm<CreatePostForm>();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [resourceType, setResourceType] = useState<ResourceType>('NONE');

    const contentValue = watch('content');
    const titleValue = watch('title');

    // Both TITLE and CONTENT are required as per user feedback (@NotBlank)
    // We also treat selectedFile as a valid substitute for content logic-wise in many apps,
    // but if backend enforces @NotBlank content, we must have text.
    // Let's assume content is strictly required.    
    const isPostable =
        (titleValue?.trim().length > 0) &&
        (contentValue?.trim().length > 0);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: ResourceType) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setResourceType(type);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResourceType('NONE');
    };

    const onSubmit = async (data: CreatePostForm) => {
        if (!isPostable) return;

        try {
            setIsLoading(true);
            let resourceUrl = '';

            if (selectedFile) {
                if (resourceType === 'IMAGE') {
                    const result = await mediaService.uploadImage(selectedFile);
                    resourceUrl = result.url;
                } else if (resourceType === 'VIDEO') {
                    const result = await mediaService.uploadVideo(selectedFile);
                    resourceUrl = result.url;
                }
            }

            await postService.createPost({
                content: data.content,
                resourceUrl: resourceUrl || undefined,
                resourceType: resourceType,
                title: data.title
            });

            toast.success('Post created successfully!');
            reset();
            clearFile();
            onPostCreated();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create post');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200 shrink-0">
                    <img
                        src={getFullMediaUrl(user?.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || 'U') + ' ' + (user?.lastName || 'N'))}&background=D4AF37&color=fff`}
                        alt={user?.firstName}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <input
                            {...register('title', { required: true })}
                            placeholder="Title (Required)"
                            className="w-full bg-transparent text-gray-900 border-none focus:ring-0 font-bold text-xl placeholder-gray-400 p-0 mb-2"
                        />
                        <textarea
                            {...register('content', { required: true })}
                            placeholder={`What's on your mind, ${user.firstName}?`}
                            className="w-full bg-transparent text-gray-900 resize-none border-none focus:ring-0 text-lg placeholder-gray-400 p-0"
                            rows={2}
                        />

                        {previewUrl && (
                            <div className="relative mt-3 rounded-lg overflow-hidden bg-black/5 aspect-video group">
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                                {resourceType === 'IMAGE' ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <video src={previewUrl} className="w-full h-full" controls />
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
                            <div className="flex gap-2">
                                <label className="cursor-pointer text-brand-gold hover:bg-yellow-50 p-2 rounded-full transition-colors relative">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, 'IMAGE')} />
                                    <Image size={24} />
                                </label>
                                <label className="cursor-pointer text-brand-red hover:bg-red-50 p-2 rounded-full transition-colors relative">
                                    <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, 'VIDEO')} />
                                    <Video size={24} />
                                </label>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading || !isPostable}
                                className="bg-brand-red text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading && <Loader2 className="animate-spin" size={16} />}
                                Post
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
