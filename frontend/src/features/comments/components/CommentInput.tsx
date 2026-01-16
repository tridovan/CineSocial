import { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { getFullMediaUrl } from '@/config/media';
import { mediaService } from '@/features/media/services/mediaService';
import toast from 'react-hot-toast';

interface CommentInputProps {
    placeholder?: string;
    onSubmit: (content: string, imgUrl?: string) => Promise<void>;
    isLoading?: boolean;
    autoFocus?: boolean;
}

export const CommentInput = ({ placeholder = "Write a comment...", onSubmit, isLoading = false, autoFocus = false }: CommentInputProps) => {
    const { user } = useAuthStore();
    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!content.trim() && !selectedImage) || isLoading || isUploading) return;

        try {
            let imgUrl = undefined;
            if (selectedImage) {
                setIsUploading(true);
                const uploadRes = await mediaService.uploadImage(selectedImage);
                imgUrl = uploadRes.url; // Adjust based on mediaService response
            }

            await onSubmit(content, imgUrl);

            // Reset form
            setContent('');
            handleRemoveImage();
        } catch (error) {
            console.error(error);
            toast.error('Failed to post comment');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex gap-3 p-4 bg-white border-t border-gray-100">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                <img
                    src={getFullMediaUrl(user?.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'U')}&background=random`}
                    alt="User"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1">
                {previewUrl && (
                    <div className="relative inline-block mb-2">
                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg object-cover border border-gray-200" />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-700"
                        >
                            <X size={12} />
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        disabled={isLoading || isUploading}
                        className="w-full bg-gray-100 text-gray-900 rounded-full py-2.5 pl-4 pr-20 focus:outline-none focus:ring-2 focus:ring-brand-red/20 transition-all text-sm placeholder:text-gray-500"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isUploading}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button
                            type="submit"
                            disabled={(!content.trim() && !selectedImage) || isLoading || isUploading}
                            className="p-1.5 text-brand-red hover:bg-brand-red/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading || isUploading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />
                </form>
            </div>
        </div>
    );
};
