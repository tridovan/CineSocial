import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export const PostItem = ({ post }: { post: any }) => {
    return (
        <div className="bg-bg-card p-4 rounded-xl border border-white/10 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full" />
                    <div>
                        <h3 className="font-bold">{post?.author?.name || 'User Name'}</h3>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                </div>
                <button className="text-gray-400">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <p className="mb-4 text-gray-300">{post?.content || 'This is a sample post content about a movie.'}</p>

            {post?.image && (
                <div className="rounded-lg overflow-hidden mb-4 bg-black/50 aspect-video">
                    {/* Image placeholder */}
                </div>
            )}

            <div className="flex items-center justify-between text-gray-400 border-t border-white/10 pt-4">
                <button className="flex items-center gap-2 hover:text-brand-red transition-colors">
                    <Heart size={20} /> <span>12</span>
                </button>
                <button className="flex items-center gap-2 hover:text-brand-gold transition-colors">
                    <MessageCircle size={20} /> <span>4</span>
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
    );
};
