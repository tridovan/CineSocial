import { useEffect, useState } from 'react';
import { PostItem } from './PostItem';
import { postService } from '../services/postService';
import type { PostResponse } from '../types';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/authStore';

interface PostListProps {
    userId?: string; // If provided, fetch posts for this user
    feedType?: 'HOME' | 'PROFILE' | 'MY_FEED' | 'REELS'; // Defaults to HOME
}

export const PostList = ({ userId, feedType = 'HOME' }: PostListProps) => {
    const { user } = useAuthStore();
    const [posts, setPosts] = useState<PostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = async (reset = false) => {
        try {
            setLoading(true);
            const currentPage = reset ? 1 : page;
            let response;

            switch (feedType) {
                case 'PROFILE':
                    if (userId) {
                        response = await postService.getPostsByUserId(userId, currentPage);
                    } else {
                        // Fallback for my profile if no ID passed but type is PROFILE (shouldn't happen often)
                        response = await postService.getMyPosts(currentPage);
                    }
                    break;
                case 'MY_FEED':
                    response = await postService.getMyFeed(currentPage);
                    break;
                case 'REELS':
                    response = await postService.getReels(currentPage);
                    break;
                case 'HOME':
                default:
                    response = await postService.getPosts(currentPage);
                    break;
            }

            if (response?.data) {
                const newPosts = response.data.items;
                if (reset) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }

                setHasMore(currentPage < response.data.totalPage);
                setPage(currentPage + 1);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts(true);
    }, [feedType, userId]);

    // Expose a refresh method if needed for parent components
    // For now, we listen to prop changes.

    if (loading && posts.length === 0) {
        return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-red" size={40} /></div>;
    }

    if (!loading && posts.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostItem key={post.id} post={post} />
            ))}

            {hasMore ? (
                <div className="text-center pt-4">
                    <button
                        onClick={() => loadPosts(false)}
                        disabled={loading}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin inline mr-2" size={16} /> : null}
                        Load More
                    </button>
                </div>
            ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                    You've reached the end of the list.
                </div>
            )}
        </div>
    );
};
