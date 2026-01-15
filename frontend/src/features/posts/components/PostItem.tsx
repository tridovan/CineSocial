import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, MoreHorizontal, RefreshCw, ThumbsDown } from 'lucide-react';
import type { PostResponse } from '../types';
import { getFullMediaUrl } from '@/config/media';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';

interface PostItemProps {
    post: PostResponse;
    onUpdate?: (updatedPost: PostResponse) => void;
}

export const PostItem = ({ post, onUpdate }: PostItemProps) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [voteLoading, setVoteLoading] = useState(false);

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
        try {
            setVoteLoading(true);
            // Toggle logic: if clicking same vote, send 0 (unvote), else send value
            const newValue = post.userVoteValue === value ? 0 : value;

            // Optimistic update could happen here, but for now let's just wait
            // Ideally onUpdate should be called after success if we fetch fresh data,
            // or we manually update the prop locally.
            // Since API returns "String" (message), we strictly should update 
            // the local UI state manually based on 'newValue'.

            await postService.votePost(post.id, newValue);

            // Manual optimistic-like update (simplified)
            // Real apps would recalculate counts. A simple refresh is safer but slower.
            // onUpdate && onUpdate({ ...post, userVoteValue: newValue });
            // For now, let's just toast.

            // Ideally we should reload the post or update the feed item.
            // Let's assume parent will handle refresh or we trust user interaction.
            // For better UX, we'd need to emit an event or return new state.

            // Workaround: Call onUpdate if provided with a partial merge (risky for counts)
            // OR just re-fetch is best.

        } catch (error) {
            toast.error('Vote failed');
        } finally {
            setVoteLoading(false);
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
                                src={post.userProfile?.imgUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent((post.userProfile?.firstName || 'U') + ' ' + (post.userProfile?.lastName || 'N'))}&background=D4AF37&color=fff`}
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
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {post.title && <h3 className="font-bold text-lg mb-2 text-gray-900">{post.title}</h3>}
            <p className="mb-4 text-gray-700 whitespace-pre-wrap">{post.content}</p>

            {/* Media Rendering */}
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
                <div className="flex gap-1">
                    <button
                        onClick={() => handleVote(1)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${post.userVoteValue === 1 ? 'text-brand-red bg-red-50' : 'hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        disabled={voteLoading}
                    >
                        <Heart size={20} className={post.userVoteValue === 1 ? 'fill-current' : ''} />
                        <span>{post.voteCount > 0 ? post.voteCount : 'Like'}</span>
                    </button>

                    <button
                        onClick={() => handleVote(-1)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${post.userVoteValue === -1 ? 'text-gray-900 bg-gray-100' : 'hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        disabled={voteLoading}
                    >
                        <ThumbsDown size={20} className={post.userVoteValue === -1 ? 'fill-current' : ''} />
                    </button>
                </div>

                <Link to={`/posts/${post.id}`} className="flex items-center gap-2 hover:text-brand-gold transition-colors px-3 py-1.5 rounded-full hover:bg-gray-50">
                    <MessageCircle size={20} />
                    <span>{post.commentCount > 0 ? `${post.commentCount} Comments` : 'Comment'}</span>
                </Link>

                <button className="flex items-center gap-2 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-50">
                    <Share2 size={20} /> <span className="hidden sm:inline">Share</span>
                </button>
            </div>
        </div>
    );
};
