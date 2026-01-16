import { useState } from 'react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { getFullMediaUrl } from '@/config/media';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { ThumbsUp, ThumbsDown, MessageSquare, Trash2, MoreHorizontal } from 'lucide-react';
import { commentService } from '../services/commentService';
import type { CommentResponse } from '../types';
import { CommentInput } from './CommentInput';
import toast from 'react-hot-toast';

interface CommentItemProps {
    comment: CommentResponse;
    postId: string;
    onReplySuccess?: () => void;
    onDeleteSuccess?: (commentId: string) => void;
    depth?: number;
}

export const CommentItem = ({ comment, postId, onReplySuccess, onDeleteSuccess, depth = 0 }: CommentItemProps) => {
    const { user } = useAuthStore();
    const [isReplying, setIsReplying] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [replies, setReplies] = useState<CommentResponse[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);

    // Optimistic voting state
    const [voteValue, setVoteValue] = useState(comment.userVoteValue);
    const [voteCount, setVoteCount] = useState(comment.voteCount);

    const isOwner = user?.id === comment.authorProfile?.id;

    const handleVote = async (value: number) => {
        if (!user) return toast.error('Login to vote');

        const newValue = voteValue === value ? 0 : value;
        const prevValue = voteValue;

        // Optimistic update
        setVoteValue(newValue);
        let diff = 0;
        if (prevValue === 0) diff = newValue; // 0 -> 1 (+1) or 0 -> -1 (-1)
        else if (newValue === 0) diff = -prevValue; // 1 -> 0 (-1) or -1 -> 0 (+1)
        else diff = newValue - prevValue; // 1 -> -1 (-2) or -1 -> 1 (+2)

        // Note: The logic for thumbs down usually doesn't affect 'voteCount' if voteCount is only upvotes.
        // Assuming voteCount is net score or just upvotes? 
        // User said: "1 = vote, 0 = no, 1 = dislike" (Wait, user said 1=dislike? No, usually 1 up, -1 down).
        // User prompt: "vote có 3 giá trị int 1 = vote, 0 bằng không có gì... 1 = dislike (giống redit)"
        // Wait, "1 = vote" and "1 = dislike"? That's ambiguous. "1 = vote ... 1 = dislike" ??
        // Maybe -1 = dislike? Reddit has up/down.
        // Let's assume standard: 1 (up), 0 (none), -1 (down).

        if (newValue === 1) {
            setVoteCount(prev => prev + (prevValue === 1 ? 0 : 1)); // If simply counting upvotes? 
            // If counting Score:
            setVoteCount(prev => prev + diff);
        } else {
            setVoteCount(prev => prev + diff);
        }

        try {
            await commentService.voteComment(comment.id, newValue);
        } catch (error) {
            setVoteValue(prevValue); // Revert
            setVoteCount(prev => prev - diff);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this comment?')) return;
        try {
            await commentService.deleteComment(comment.id);
            if (onDeleteSuccess) onDeleteSuccess(comment.id);
            toast.success('Comment deleted');
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleReplySubmit = async (content: string, imgUrl?: string) => {
        try {
            const res = await commentService.createComment(postId, {
                content,
                imgUrl,
                parenCommentId: comment.id
            });
            setIsReplying(false);
            toast.success('Reply sent');

            if (res.code === 1000) {
                const newReply: CommentResponse = {
                    ...res.data,
                    authorProfile: res.data.authorProfile || user,
                    createdAt: res.data.createdAt || new Date().toISOString(),
                    voteCount: 0,
                    replyCount: 0,
                    userVoteValue: 0
                };

                setReplies(prev => [...prev, newReply]);

                if (!showReplies) {
                    setShowReplies(true);
                }
                if (onReplySuccess) onReplySuccess();
            }
        } catch (error) {
            throw error; // Input component handles error display
        }
    };

    const fetchReplies = async () => {
        setRepliesLoading(true);
        try {
            // Fetch replies. Check swagger default page/size. 
            // We fetch all or paginated? The UI for nested replies usually loads a batch.
            const response = await commentService.getReplies(comment.id, 1, 5);
            if (response.data && response.data.items) {
                setReplies(response.data.items);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setRepliesLoading(false);
        }
    };

    const toggleReplies = () => {
        if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
            fetchReplies();
        }
        setShowReplies(!showReplies);
    };

    return (
        <div className={`flex gap-3 mb-4 ${depth > 0 ? 'ml-10' : ''}`}>
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 mt-1">
                <img
                    src={getFullMediaUrl(comment.authorProfile?.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorProfile?.firstName || 'U')}&background=random`}
                    alt="User"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1">
                <div className="bg-gray-50 rounded-2xl px-4 py-2 inline-block max-w-full">
                    <div className="font-bold text-sm text-gray-900">
                        {comment.authorProfile?.firstName} {comment.authorProfile?.lastName}
                    </div>
                    <div className="text-gray-800 text-sm whitespace-pre-wrap">{comment.content}</div>
                </div>

                {comment.imgUrl && (
                    <div className="mt-2">
                        <img src={getFullMediaUrl(comment.imgUrl)} alt="Comment attachment" className="max-h-48 rounded-lg object-contain border border-gray-200" />
                    </div>
                )}

                <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500 font-medium">
                    <button
                        onClick={() => handleVote(1)}
                        className={`hover:text-red-500 ${voteValue === 1 ? 'text-red-500 font-bold' : ''}`}
                    >
                        Like {voteCount > 0 && `(${voteCount})`}
                    </button>
                    <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="hover:text-gray-800"
                    >
                        Reply
                    </button>
                    <RelativeTime date={comment.createdAt} />

                    {isOwner && (
                        <button onClick={handleDelete} className="text-gray-400 hover:text-red-600">
                            Delete
                        </button>
                    )}
                </div>

                {/* View Replies Button */}
                {comment.replyCount > 0 && depth === 0 && (
                    <button
                        onClick={toggleReplies}
                        className="text-xs font-semibold text-gray-500 mt-2 flex items-center gap-2 hover:text-gray-800"
                    >
                        <div className="w-6 h-[1px] bg-gray-300"></div>
                        {showReplies ? 'Hide replies' : `View ${comment.replyCount} replies`}
                    </button>
                )}

                {/* Reply Input */}
                {isReplying && (
                    <div className="mt-3">
                        <CommentInput
                            placeholder={`Reply to ${comment.authorProfile?.firstName}...`}
                            onSubmit={handleReplySubmit}
                            autoFocus
                        />
                    </div>
                )}

                {/* Recursive Replies Display */}
                {showReplies && (
                    <div className="mt-3">
                        {repliesLoading ? (
                            <div className="ml-10 text-xs text-gray-400">Loading replies...</div>
                        ) : (
                            replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    postId={postId}
                                    depth={depth + 1}
                                    onDeleteSuccess={(id) => setReplies(prev => prev.filter(r => r.id !== id))}
                                />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
