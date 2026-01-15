import { useState, useEffect } from 'react';
import { Bell, Loader2, BellOff } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationResponse } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { getFullMediaUrl } from '@/config/media';
import { postService } from '@/features/posts/services/postService';
import { PostDetailModal } from '@/features/posts/components/PostDetailModal';
import type { PostResponse } from '@/features/posts/types';
import { twMerge } from 'tailwind-merge';

interface NotificationListProps {
    className?: string;
}

export const NotificationList = ({ className }: NotificationListProps) => {
    const { notifications, setNotifications, markAsRead } = useNotificationStore();
    const [loading, setLoading] = useState(true);

    // Post Detail Modal State
    const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const fetchNotifications = async () => {
            // Only fetch if we suspect stale or empty? 
            // Or always fetch to get latest history? Always fetch is safer for "page load".
            try {
                const res = await notificationService.getNotifications();
                if (res.code === 1000) {
                    setNotifications(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [setNotifications]);

    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.read) {
            // Optimistic update
            markAsRead(notification.id);
            try {
                await notificationService.markAsRead(notification.id);
            } catch (e) {
                console.error('Failed to mark as read API', e);
            }
        }

        if (notification.resourceId) {
            try {
                const postRes = await postService.getPostById(notification.resourceId);
                if (postRes && postRes.data) {
                    setSelectedPost(postRes.data);
                    setIsPostModalOpen(true);
                }
            } catch (error) {
                console.log("Failed to load post or resource is not a post");
            }
        }
    };

    return (
        <div className={twMerge("bg-white rounded-xl border border-gray-100 p-4 w-80 max-h-[80vh] overflow-y-auto flex flex-col shadow-sm", className)}>
            <h3 className="font-bold mb-4 flex items-center gap-2 sticky top-0 bg-white z-10 pb-2 border-b border-gray-100 text-gray-900">
                <Bell size={20} /> Notifications
            </h3>

            <div className="space-y-2 flex-1">
                {loading && notifications.length === 0 ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-brand-red" /></div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                        <div className="bg-gray-100 p-4 rounded-full mb-3 text-gray-400">
                            <BellOff size={32} />
                        </div>
                        <p className="font-medium text-gray-600">No notifications yet</p>
                        <p className="text-xs text-gray-400 mt-1">When you get notifications, they'll show up here</p>
                    </div>
                ) : (
                    notifications.map((n) => (
                        <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`flex gap-3 items-start p-3 rounded-lg transition-colors cursor-pointer ${n.read ? 'bg-white hover:bg-gray-50 text-gray-500' : 'bg-blue-50 hover:bg-blue-100 text-gray-900'}`}
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                                <img src={getFullMediaUrl(n.actorImgUrl)} alt={n.actorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                                    <span className="font-bold">{n.actorName}</span> {n.message}
                                </p>
                                <span className="text-xs text-gray-400 mt-1 block">
                                    {formatDistanceToNow(new Date(n.createdAt || Date.now()))} ago
                                </span>
                            </div>
                            {!n.read && <div className="w-2 h-2 mt-2 rounded-full bg-brand-red flex-shrink-0" />}
                        </div>
                    ))
                )}
            </div>

            {/* Post Detail Modal */}
            <PostDetailModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                post={selectedPost}
            />
        </div>
    );
};
