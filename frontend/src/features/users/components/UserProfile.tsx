import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UserWallProfileResponse } from '../types';
import { Loader2, User as UserIcon, Check, Edit2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { EditProfileModal } from './EditProfileModal';
import { PostList } from '@/features/posts/components/PostList';
import { getFullMediaUrl } from '@/config/media';

export const UserProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState<UserWallProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'following'>('posts');
    const [followingList, setFollowingList] = useState<any[]>([]);
    const [followingLoading, setFollowingLoading] = useState(false);

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

    useEffect(() => {
        if (activeTab === 'following' && isOwnProfile) {
            fetchFollowingList();
        }
    }, [activeTab, isOwnProfile]);

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

    const fetchFollowingList = async () => {
        try {
            setFollowingLoading(true);
            const response = await userService.getMyFollowedUsers();
            if (response.data) {
                setFollowingList(response.data);
            }
        } catch (error) {
            toast.error('Failed to load following list');
        } finally {
            setFollowingLoading(false);
        }
    };

    const handleUnfollowUser = async (userId: string) => {
        try {
            await userService.unfollowUser(userId);
            toast.success('Unfollowed successfully');
            setFollowingList(prev => prev.filter(u => u.id !== userId));
        } catch (error) {
            toast.error('Failed to unfollow');
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
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6">
                <div className="h-64 md:h-80 relative group">
                    {profile.backgroundImgUrl ? (
                        <>
                            <img src={getFullMediaUrl(profile.backgroundImgUrl)} alt="Cover" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-200"></div>
                    )}

                    {isOwnProfile && (
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-3 py-1.5 rounded-md font-semibold text-sm flex items-center gap-2 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                        >
                            <Camera size={16} /> Edit Cover Photo
                        </button>
                    )}
                </div>

                <div className="px-4 md:px-8 pb-4">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-8 gap-4 md:gap-6 relative">
                        {/* Avatar */}
                        <div className="relative z-10">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[4px] border-white bg-white overflow-hidden shadow-md relative group/avatar">
                                <img
                                    src={getFullMediaUrl(profile.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent((profile.firstName || '') + ' ' + (profile.lastName || ''))}&background=D4AF37&color=fff`}
                                    alt={profile.firstName}
                                    className="w-full h-full object-cover"
                                />
                                {isOwnProfile && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                                        <Camera className="text-white" size={24} />
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="absolute bottom-1 right-1 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full text-gray-800 border-2 border-white shadow-sm transition-colors md:hidden"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 pt-2 md:pt-0 pb-2 text-center md:text-left min-w-0">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {profile.firstName} {profile.lastName}
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className="w-full md:w-auto flex justify-center md:justify-end gap-3 mb-2">
                            {isOwnProfile ? (
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Edit profile
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollowToggle}
                                        className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${following
                                            ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                            : 'bg-brand-red text-white hover:bg-red-700'
                                            }`}
                                    >
                                        {following ? (
                                            <>
                                                <Check size={16} /> Following
                                            </>
                                        ) : (
                                            <>
                                                <UserIcon size={16} /> Follow
                                            </>
                                        )}
                                    </button>
                                    <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all">
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Formatting Separator */}
                    <div className="border-t border-gray-200 mt-6 pt-1"></div>

                    {/* Tabs */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'posts' ? 'text-brand-red border-brand-red' : 'text-gray-600 border-transparent hover:bg-gray-50 rounded-lg'}`}
                        >
                            Posts
                        </button>
                        {isOwnProfile && (
                            <button
                                onClick={() => setActiveTab('following')}
                                className={`px-4 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'following' ? 'text-brand-red border-brand-red' : 'text-gray-600 border-transparent hover:bg-gray-50 rounded-lg'}`}
                            >
                                Following
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-20">
                        <h3 className="font-bold mb-3 text-lg text-gray-900">Intro</h3>
                        {profile.bio ? (
                            <p className="text-center text-gray-700 mb-4">{profile.bio}</p>
                        ) : (
                            <div className="text-center text-gray-500 italic mb-4">No bio to show</div>
                        )}

                        {isOwnProfile && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 rounded-lg transition-colors"
                            >
                                Edit Details
                            </button>
                        )}
                    </div>
                </div>

                <div className="md:col-span-2">
                    {activeTab === 'posts' ? (
                        <>
                            <h3 className="font-bold mb-4 text-gray-900 text-lg">Posts</h3>
                            {profile.id && (
                                <PostList
                                    userId={profile.id}
                                    feedType={isOwnProfile ? 'PROFILE' : 'PROFILE'}
                                />
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h3 className="font-bold mb-4 text-gray-900 text-lg">Following</h3>
                            {followingLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : followingList.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {followingList.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border border-gray-200">
                                                    <img
                                                        src={getFullMediaUrl(user.imgUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent((user.firstName || '') + ' ' + (user.lastName || ''))}&background=D4AF37&color=fff`}
                                                        alt={user.firstName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{user.firstName} {user.lastName}</h4>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => user.id && handleUnfollowUser(user.id)}
                                                className="px-4 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 text-sm"
                                            >
                                                Unfollow
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    You are not following anyone yet.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isOwnProfile && profile && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    currentProfile={profile}
                    onUpdateSuccess={() => loadProfile(profile.id as string)}
                />
            )}
        </div>
    );
};
