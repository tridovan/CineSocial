import { useState, useCallback } from 'react';
import { PostItem } from './PostItem';
import { postService } from '../services/postService';
import { Loader2 } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface PostListProps {
    userId?: string; // If provided, fetch posts for this user
    feedType?: 'HOME' | 'PROFILE' | 'MY_FEED' | 'REELS'; // Defaults to HOME
}

export const PostList = ({ userId, feedType = 'HOME' }: PostListProps) => {

    // Memoize the fetch function to be stable
    const fetchPosts = useCallback(async (page: number, size: number) => {
        let response;
        switch (feedType) {
            case 'PROFILE':
                if (userId) {
                    response = await postService.getPostsByUserId(userId, page, size);
                } else {
                    response = await postService.getMyPosts(page, size);
                }
                break;
            case 'MY_FEED':
                response = await postService.getMyFeed(page, size);
                break;
            case 'REELS':
                response = await postService.getReels(page, size);
                break;
            case 'HOME':
            default:
                response = await postService.getPosts(page, size);
                break;
        }
        // Hook expects PageResponse<T>, so we return response.data
        return response.data;
    }, [feedType, userId]);

    const {
        data: posts,
        loading,
        hasMore,
        lastElementRef,
        error
    } = useInfiniteScroll(fetchPosts, 1, 10, [feedType, userId]);

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

    if (error) {
        return <div className="text-center py-10 text-red-500">Failed to load posts. Please try again.</div>;
    }

    return (
        <div className="space-y-6">
            {posts.map((post, index) => {
                if (posts.length === index + 1) {
                    return (
                        <div ref={lastElementRef} key={post.id}>
                            <PostItem post={post} />
                        </div>
                    );
                } else {
                    return <PostItem key={post.id} post={post} />;
                }
            })}

            {loading && posts.length > 0 && (
                <div className="flex justify-center py-4">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">
                    You've reached the end of the list.
                </div>
            )}
        </div>
    );
};
