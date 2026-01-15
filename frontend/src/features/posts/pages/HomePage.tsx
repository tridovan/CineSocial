import { useState } from 'react';
import { CreatePost } from '../components/CreatePost';
import { PostList } from '../components/PostList';
import { ReelFeed } from '../components/ReelFeed';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Film, Users, Globe } from 'lucide-react';

type FeedType = 'HOME' | 'MY_FEED' | 'REELS';

export const HomePage = () => {
    const { isAuthenticated } = useAuthStore();
    const [activeFeed, setActiveFeed] = useState<FeedType>('HOME');
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePostCreated = () => {
        setRefreshKey(prev => prev + 1);
    };

    const tabs = [
        { id: 'HOME' as FeedType, label: 'Home', icon: Globe },
        { id: 'MY_FEED' as FeedType, label: 'Following', icon: Users },
        { id: 'REELS' as FeedType, label: 'Reels', icon: Film },
    ];

    return (
        <div className="max-w-2xl mx-auto py-8">
            {/* Only show CreatePost if not in Reels mode? Or always? Usually always for Home/Following */}
            {isAuthenticated && activeFeed !== 'REELS' && (
                <CreatePost onPostCreated={handlePostCreated} />
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex items-center justify-between">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveFeed(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeFeed === tab.id
                            ? 'bg-brand-gold/10 text-brand-gold'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeFeed === 'REELS' ? (
                <ReelFeed key={refreshKey} />
            ) : (
                <PostList
                    key={`${activeFeed}-${refreshKey}`}
                    feedType={activeFeed}
                />
            )}
        </div>
    );
};
