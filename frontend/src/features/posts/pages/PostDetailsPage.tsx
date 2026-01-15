import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostItem } from '../components/PostItem';
import { CommentList } from '@/features/comments/components/CommentList';
import { postService } from '../services/postService';
import type { PostResponse } from '../types';
import { Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const PostDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<PostResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // Implementation note: relying on standard REST endpoint. 
                // If backend missing GET /posts/:id, this will fail.
                const data = await postService.getPostById(id);
                if (data && data.data) {
                    setPost(data.data); // data.data because ApiResponsePostResponse structure
                } else if (data) {
                    // Fallback if structure is direct
                    setPost(data as any);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-red" size={40} /></div>;
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center p-10 gap-4 text-center">
                <p className="text-gray-500 text-lg">Post not found or has been deleted.</p>
                <button onClick={() => navigate(-1)} className="text-brand-red font-semibold hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-6 px-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} /> Back
            </button>

            <PostItem post={post} />

            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">Comments</h3>
                </div>
                <div className="h-[600px] flex flex-col">
                    <CommentList postId={post.id} />
                </div>
            </div>
        </div>
    );
};
