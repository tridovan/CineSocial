import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UserWallProfileResponse } from '../types';
import { Loader2, User as UserIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<UserWallProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    const { user, isAuthenticated } = useAuthStore();
    const isOwnProfile = user?.id === id;

    useEffect(() => {
        // If we are logged in (have token) but user data isn't loaded yet, 
        // wait for AppLayout to fetch it. This prevents the race condition 
        // where we call the 'wall' API because we don't know it's "us" yet.
        if (isAuthenticated && !user) return;

        if (id) {
            loadProfile(id);
        }
    }, [id, user, isAuthenticated]);

    const loadProfile = async (userId: string) => {
        // If it's my own profile, use the data we already have (or fetch fresh 'me')
        // effectively skipping the 'wall' API call which is for others.
        if (user && user.id === userId) {
            setProfile({
                ...user,
                followed: false // You can't follow yourself
            });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await userService.getUserWall(userId);
            if (response?.data) {
                setProfile(response.data);
                setFollowing(response.data.followed || false);
            }
        } catch (error) {
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile?.id || isOwnProfile) return;
        try {
            if (following) {
                await userService.unfollowUser(profile.id);
                toast.success('Unfollowed successfully');
            } else {
                await userService.followUser(profile.id);
                toast.success('Followed successfully');
            }
            setFollowing(!following);
        } catch (error) {
            toast.error('Action failed');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-brand-red" size={40} /></div>;
    }

    if (!profile) {
        return <div className="text-center p-10 text-gray-400">User not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-md" /> {/* Cover Image with Social Gradient */}
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 overflow-hidden flex items-center justify-center shadow-lg">
                        {profile.imgUrl ? (
                            <img src={profile.imgUrl} alt={profile.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={48} className="text-gray-400" />
                        )}
                    </div>
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 drop-shadow-sm md:drop-shadow-none md:text-gray-900 text-white md:mix-blend-normal mix-blend-difference">
                            {profile.firstName} {profile.lastName}
                        </h1>
                        <p className="text-gray-600 font-medium bg-white/80 md:bg-transparent px-2 rounded-md">{profile.email}</p>
                    </div>
                </div>
                <div className="absolute bottom-4 right-8">
                    {!isOwnProfile && (
                        <button
                            onClick={handleFollowToggle}
                            className={`px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 shadow-sm ${following
                                ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                : 'bg-brand-red text-white hover:bg-red-700'
                                }`}
                        >
                            {following ? (
                                <>
                                    <Check size={18} /> Following
                                </>
                            ) : (
                                'Follow'
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold mb-2 text-gray-900">Intro</h3>
                        <p className="text-gray-600 text-sm">Movie enthusiast. Logic pending implementation.</p>
                    </div>
                </div>

                <div className="md:col-span-2">
                    {/* PostList will be here */}
                    <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
                        {isOwnProfile ? "My Posts (Coming Soon)" : "User's posts will appear here."}
                    </div>
                </div>
            </div>
        </div>
    );
};
