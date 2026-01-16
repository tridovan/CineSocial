import { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Music2 } from 'lucide-react';
import type { PostResponse } from '../types';
import { getFullMediaUrl } from '@/config/media';
import { postService } from '../services/postService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/stores/authStore';

interface ReelItemProps {
    post: PostResponse;
    isActive: boolean;
}

export const ReelItem = ({ post, isActive }: ReelItemProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { user } = useAuthStore();

    const [currentVoteValue, setCurrentVoteValue] = useState<number>(post.userVoteValue || 0);
    const [currentVoteCount, setCurrentVoteCount] = useState<number>(post.voteCount || 0);

    // Auto-play/pause based on active state
    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(e => console.log('Autoplay blocked', e));
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isActive]);

    const handleVote = async (type: number) => {
        if (!user) {
            toast.error('Please login to vote');
            return;
        }

        const newVoteValue = currentVoteValue === type ? 0 : type;
        const previousVoteValue = currentVoteValue;

        // Optimistic update
        let voteDiff = 0;
        if (previousVoteValue === 0) {
            voteDiff = newVoteValue; // +1 or -1
        } else if (newVoteValue === 0) {
            voteDiff = -previousVoteValue; // Undo previous
        } else {
            voteDiff = newVoteValue - previousVoteValue; // Switch +1 to -1 or vice versa (diff is 2)
        }

        setCurrentVoteValue(newVoteValue);
        setCurrentVoteCount(prev => prev + voteDiff);

        try {
            await postService.votePost(post.id, newVoteValue);
        } catch (error) {
            // Revert on error
            setCurrentVoteValue(previousVoteValue);
            setCurrentVoteCount(prev => prev - voteDiff);
            toast.error('Failed to vote');
        }
    };

    const isLiked = currentVoteValue === 1;

    return (
        <div className="relative w-full h-full bg-black snap-start flex items-center justify-center overflow-hidden">
            {/* Video Player */}
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                {post.resourceUrl ? (
                    <video
                        ref={videoRef}
                        src={getFullMediaUrl(post.resourceUrl)}
                        className="h-full w-full object-contain"
                        loop
                        muted={false}
                        playsInline
                        onClick={() => {
                            if (videoRef.current?.paused) videoRef.current.play();
                            else videoRef.current?.pause();
                        }}
                    />
                ) : (
                    <div className="text-white/50">No Video Source</div>
                )}
            </div>

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none"></div>

            {/* Content Content - Bottom Left */}
            <div className="absolute bottom-4 left-4 right-16 text-white pb-safe z-10 w-[70%] text-shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white/80 overflow-hidden">
                        <img
                            src={getFullMediaUrl(post.userProfile?.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.userProfile?.firstName || 'A')}&background=random`}
                            alt="Author"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="font-bold text-lg drop-shadow-md">
                        {post.userProfile?.firstName} {post.userProfile?.lastName}
                    </span>
                    <button className="bg-transparent border border-white/60 text-white text-xs px-2 py-0.5 rounded font-semibold hover:bg-white/20 transition-colors">
                        Follow
                    </button>
                </div>

                <div className="mb-2">
                    <h3 className="text-base font-normal leading-snug drop-shadow-md line-clamp-2">
                        {post.title}
                    </h3>
                    {post.content && <p className="text-sm text-gray-200 line-clamp-1 mt-1 font-light opacity-90">{post.content}</p>}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                    <Music2 size={14} className="animate-spin-slow" />
                    <span className="truncate max-w-[200px]">Original Sound - {post.userProfile?.firstName}</span>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute bottom-6 right-2 w-14 flex flex-col gap-6 items-center z-20 pb-safe">
                <div className="flex flex-col items-center gap-1 group">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleVote(1); }}
                        className={`p-3 rounded-full bg-black/40 backdrop-blur-sm transition-all transform active:scale-90 hover:bg-black/60 ${isLiked ? 'text-brand-red' : 'text-white'}`}
                    >
                        <Heart size={28} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-bounce-short" : ""} />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{currentVoteCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
                        <MessageCircle size={28} />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{post.commentCount || 0}</span>
                </div>

                <button className="p-3 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors mt-2">
                    <MoreVertical size={24} />
                </button>

                {/* Spinning Disk/Album Art Element commonly seen in reels */}
                <div className="mt-4 w-10 h-10 rounded-full bg-zinc-800 border-4 border-zinc-900 overflow-hidden animate-spin-slow-linear">
                    <img
                        src={getFullMediaUrl(post.userProfile?.imgUrl) || "https://ui-avatars.com/api/?background=random"}
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>
            </div>
        </div>
    );
};
