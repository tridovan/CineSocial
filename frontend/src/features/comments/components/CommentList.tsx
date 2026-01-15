import { useRef, useState, useCallback, useEffect } from 'react';
import { commentService } from '../services/commentService';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Loader2 } from 'lucide-react';
import type { CommentResponse } from '../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/authStore';

interface CommentListProps {
    postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
    const { user } = useAuthStore();
    const [comments, setComments] = useState<CommentResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

    const loadComments = useCallback(async (reset = false) => {
        try {
            if (reset) setLoading(true);
            const currentPage = reset ? 1 : page;
            const data = await commentService.getCommentsOfPost(postId, currentPage, 10);

            if (data.data && data.data.items) {
                if (reset) {
                    setComments(data.data.items);
                } else {
                    setComments(prev => [...prev, ...data.data.items]);
                }
                setHasMore(currentPage < data.data.totalPage);
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error('Failed to load comments', error);
        } finally {
            if (reset) setLoading(false);
        }
    }, [postId, page]);

    useEffect(() => {
        loadComments(true);
    }, [postId]);

    const handleNewComment = async (content: string, imgUrl?: string) => {
        try {
            const newCommentRes = await commentService.createComment(postId, { content, imgUrl });
            if (newCommentRes.code === 1000) {
                // Manually populate author profile and fallback fields for immediate display
                // This ensures "seamless" experience as requested by user
                const newComment: CommentResponse = {
                    ...newCommentRes.data,
                    authorProfile: newCommentRes.data.authorProfile || user,
                    createdAt: newCommentRes.data.createdAt || new Date().toISOString(),
                    voteCount: 0,
                    replyCount: 0,
                    userVoteValue: 0
                };

                // Insert new comment at top
                setComments(prev => [newComment, ...prev]);
                setNewlyAddedIds(prev => new Set(prev).add(newComment.id));
                toast.success('Comment posted');
            }
        } catch (e) {
            throw e;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Comment List Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-red" /></div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No comments yet.</div>
                ) : (
                    <>
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                onDeleteSuccess={(id) => setComments(prev => prev.filter(c => c.id !== id))}
                            />
                        ))}

                        {hasMore && (
                            <button
                                onClick={() => loadComments(false)}
                                className="w-full py-2 text-sm text-gray-500 hover:text-gray-800 font-medium"
                            >
                                Load more comments
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <CommentInput onSubmit={handleNewComment} />
        </div>
    );
};
