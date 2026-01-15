import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MoreHorizontal, RefreshCw, ThumbsDown, ThumbsUp, Trash2, Edit, Share2 } from 'lucide-react';
import type { PostResponse } from '../types';
import { getFullMediaUrl } from '@/config/media';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { EditPostModal } from './EditPostModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { CommentList } from '@/features/comments/components/CommentList';

interface PostItemProps {
    post: PostResponse;
    onUpdate?: (updatedPost: PostResponse) => void;
    onDelete?: (postId: string) => void;
}

export const PostItem = ({ post, onUpdate, onDelete }: PostItemProps) => {
    const { user } = useAuthStore();
    const [isRetrying, setIsRetrying] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);
    const [optimisticVote, setOptimisticVote] = useState<{ value: number; count: number } | null>(null);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isOwner = user?.id === post.userProfile?.id;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentVoteValue = optimisticVote ? optimisticVote.value : post.userVoteValue;
    const currentVoteCount = optimisticVote ? optimisticVote.count : post.voteCount;

    const handleRetry = async () => {
        try {
            setIsRetrying(true);
            await postService.retryPost(post.id);
            toast.success('Retry signal sent. Please refresh in a moment.');
        } catch (error) {
            toast.error('Failed to retry processing');
        } finally {
            setIsRetrying(false);
        }
    };

    const handleVote = async (value: number) => {
        if (voteLoading) return;

        const previousValue = currentVoteValue;
        const newValue = previousValue === value ? 0 : value;

        let countDiff = 0;
        if (value === 1) {
            if (previousValue === 1) countDiff = -1;
            else countDiff = 1;
        } else {
            if (previousValue === 1) countDiff = -1;
        }

        setOptimisticVote({
            value: newValue,
            count: post.voteCount + countDiff
        });

        try {
            setVoteLoading(true);
            await postService.votePost(post.id, newValue);
        } catch (error) {
            toast.error('Vote failed');
            setOptimisticVote(null);
        } finally {
            setVoteLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await postService.deletePost(post.id);
            toast.success('Post deleted successfully');
            if (onDelete) {
                onDelete(post.id);
            } else {
                window.location.reload();
            }
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleUpdateSuccess = (updatedPost: PostResponse) => {
        if (onUpdate) {
            onUpdate(updatedPost);
        } else {
            window.location.reload();
        }
    };

    const isMediaFailed = post.status === 'MEDIA_FAILED';

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link to={`/users/${post.userProfile?.id}`}>
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-200">
                            <img
                                src={getFullMediaUrl(post.userProfile?.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent((post.userProfile?.firstName || 'U') + ' ' + (post.userProfile?.lastName || 'N'))}&background=D4AF37&color=fff`}
                                alt={post.userProfile?.firstName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                    <div>
                        <Link to={`/users/${post.userProfile?.id}`} className="font-bold text-gray-900 hover:text-brand-red transition-colors">
                            {post.userProfile?.firstName} {post.userProfile?.lastName}
                        </Link>
                        <p className="text-xs text-gray-500">
                            <RelativeTime date={post.createdAt} />
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MoreHorizontal size={20} />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-10 overflow-hidden transform origin-top-right transition-all">
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                    onClick={() => { setShowMenu(false); setIsEditing(true); }}
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                    onClick={() => { setShowMenu(false); setIsDeleting(true); }}
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {post.title && <h3 className="font-bold text-lg mb-2 text-gray-900">{post.title}</h3>}
            <p className="mb-4 text-gray-700 whitespace-pre-wrap">{post.content}</p>

            {post.resourceType !== 'NONE' && post.resourceUrl && (
                <div className="rounded-lg overflow-hidden mb-4 bg-black aspect-video flex items-center justify-center relative group">
                    {isMediaFailed ? (
                        <div className="text-center text-white p-4">
                            <p className="mb-2 text-red-400 font-bold">Media Processing Failed</p>
                            <button
                                onClick={handleRetry}
                                disabled={isRetrying}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors mx-auto"
                            >
                                <RefreshCw size={16} className={isRetrying ? 'animate-spin' : ''} />
                                <span>Retry</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            {post.resourceType === 'IMAGE' ? (
                                <img
                                    src={getFullMediaUrl(post.resourceUrl)}
                                    alt="Post media"
                                    className="w-full h-full object-contain bg-black"
                                />
                            ) : (
                                <video
                                    src={getFullMediaUrl(post.resourceUrl)}
                                    controls
                                    className="w-full h-full bg-black"
                                />
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="flex items-center justify-between text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex items-center bg-gray-50 rounded-full">
                    <button
                        onClick={() => handleVote(1)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-full transition-colors ${currentVoteValue === 1 ? 'text-brand-red bg-red-50 font-medium' : 'hover:bg-gray-100'}`}
                        disabled={voteLoading}
                    >
                        <ThumbsUp size={18} className={currentVoteValue === 1 ? 'fill-current' : ''} />
                        <span>{currentVoteCount}</span>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200"></div>
                    <button
                        onClick={() => handleVote(-1)}
                        className={`flex items-center px-3 py-1.5 rounded-r-full transition-colors ${currentVoteValue === -1 ? 'text-brand-red bg-red-50' : 'hover:bg-gray-100'}`}
                        disabled={voteLoading}
                    >
                        <ThumbsDown size={18} className={currentVoteValue === -1 ? 'fill-current' : ''} />
                    </button>
                </div>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${showComments ? 'text-gray-900 bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                    <MessageCircle size={20} />
                    <span>{post.commentCount} Comments</span>
                </button>
            </div>

            {/* Inline Comments Section */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CommentList postId={post.id} />
                </div>
            )}

            {isEditing && (
                <EditPostModal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    post={post}
                    onUpdateSuccess={handleUpdateSuccess}
                />
            )}

            {isDeleting && (
                <ConfirmDeleteModal
                    isOpen={isDeleting}
                    onClose={() => setIsDeleting(false)}
                    onConfirm={handleDelete}
                    title="Delete Post"
                    message="Are you sure you want to delete this post? This action cannot be undone."
                />
            )}
        </div>
    );
};
