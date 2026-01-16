import { useRef, useState, useCallback, useEffect } from 'react';
import type { PostResponse } from '../types';
import { postService } from '../services/postService';
import { ReelItem } from './ReelItem';
import { Loader2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export const ReelFeed = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeReelIndex, setActiveReelIndex] = useState(0);

    const fetchReels = useCallback(async (page: number, size: number) => {
        const response = await postService.getReels(page, size);
        return response.data;
    }, []);

    const {
        data: reels,
        loading,
        hasMore,
        lastElementRef,
        error,
        reset
    } = useInfiniteScroll(fetchReels);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const scrollPosition = container.scrollTop;
        const itemHeight = container.clientHeight;

        const index = Math.round(scrollPosition / itemHeight);

        if (index !== activeReelIndex && index >= 0 && index < reels.length) {
            setActiveReelIndex(index);
        }
    }, [activeReelIndex, reels.length]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll, { passive: true });
        }
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const navigateReel = (direction: 'prev' | 'next') => {
        if (!containerRef.current) return;

        let newIndex = activeReelIndex;
        if (direction === 'next' && activeReelIndex < reels.length - 1) {
            newIndex++;
        } else if (direction === 'prev' && activeReelIndex > 0) {
            newIndex--;
        }

        if (newIndex !== activeReelIndex) {
            const itemHeight = containerRef.current.clientHeight;
            containerRef.current.scrollTo({
                top: newIndex * itemHeight,
                behavior: 'smooth'
            });
            setActiveReelIndex(newIndex);
        }
    };

    if (loading && reels.length === 0) {
        return <div className="h-[80vh] flex items-center justify-center bg-black rounded-xl"><Loader2 className="text-white animate-spin" size={40} /></div>;
    }

    if (error && reels.length === 0) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center bg-black rounded-xl text-white gap-4">
                <p>Failed to load reels.</p>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    if (!loading && reels.length === 0) {
        return (
            <div className="h-[80vh] flex flex-col items-center justify-center bg-black rounded-xl text-white gap-4">
                <p>No reels found.</p>
                <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[85vh] bg-black rounded-xl overflow-hidden group/feed">
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory bg-black rounded-xl no-scrollbar relative"
                style={{ borderRadius: '16px' }}
            >
                {reels.map((reel, index) => {
                    if (reels.length === index + 1) {
                        return (
                            <div ref={lastElementRef} key={reel.id} className="w-full h-full snap-start snap-always">
                                <ReelItem
                                    post={reel}
                                    isActive={index === activeReelIndex}
                                />
                            </div>
                        );
                    } else {
                        return (
                            <div key={reel.id} className="w-full h-full snap-start snap-always">
                                <ReelItem
                                    post={reel}
                                    isActive={index === activeReelIndex}
                                />
                            </div>
                        );
                    }
                })}
            </div>

            {/* Navigation Arrows (Desktop) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50 opacity-0 group-hover/feed:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => navigateReel('prev')}
                    disabled={activeReelIndex === 0}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-700/80 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <ChevronUp size={24} />
                </button>
                <button
                    onClick={() => navigateReel('next')}
                    disabled={activeReelIndex === reels.length - 1}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-700/80 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
                >
                    <ChevronDown size={24} />
                </button>
            </div>
        </div>
    );
};
