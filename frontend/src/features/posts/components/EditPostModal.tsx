import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { postService } from '../services/postService';
import type { PostResponse } from '../types';
import toast from 'react-hot-toast';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostResponse;
    onUpdateSuccess: (updatedPost: PostResponse) => void;
}

interface EditPostForm {
    title: string;
    content: string;
}

export const EditPostModal = ({ isOpen, onClose, post, onUpdateSuccess }: EditPostModalProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // We initialize form with current post data
    const { register, handleSubmit } = useForm<EditPostForm>({
        defaultValues: {
            title: post.title || '',
            content: post.content || ''
        }
    });

    const onSubmit = async (data: EditPostForm) => {
        try {
            setIsLoading(true);
            await postService.updatePost(post.id, {
                title: data.title,
                content: data.content
            });

            toast.success('Post updated successfully');

            // Construct optimistic update object or fetch fresh?
            // Since API returns "String", we can't get full object back easily.
            // We'll merge data into existing post for UI
            const updatedPost = { ...post, title: data.title, content: data.content, updatedAt: new Date().toISOString() };

            onUpdateSuccess(updatedPost);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update post');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Post</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            {...register('title', { required: true })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all"
                            placeholder="Post title"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            {...register('content', { required: true })}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold transition-all min-h-[150px] resize-none"
                            placeholder="What's on your mind?"
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 rounded-full font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 rounded-full font-bold bg-brand-gold text-white hover:bg-yellow-600 transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {isLoading && <Loader2 className="animate-spin" size={16} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
