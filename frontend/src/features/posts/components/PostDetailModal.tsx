import { X } from 'lucide-react';
import { PostItem } from './PostItem';
import type { PostResponse } from '../types';
import { useEffect } from 'react';

interface PostDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: PostResponse | null;
}

export const PostDetailModal = ({ isOpen, onClose, post }: PostDetailModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Post Details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <PostItem post={post} />
                </div>
            </div>
        </div>
    );
};
