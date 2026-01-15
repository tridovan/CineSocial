import { Bell } from 'lucide-react';

export const NotificationList = () => {
    const notifications = [1, 2, 3];

    return (
        <div className="bg-bg-card rounded-xl border border-white/10 p-4 w-80">
            <h3 className="font-bold mb-4 flex items-center gap-2">
                <Bell size={20} /> Notifications
            </h3>
            <div className="space-y-3">
                {notifications.map((n) => (
                    <div key={n} className="flex gap-3 items-start p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                        <div className="w-2 h-2 mt-2 rounded-full bg-brand-red" />
                        <div>
                            <p className="text-sm">User X liked your post</p>
                            <span className="text-xs text-gray-500">2 min ago</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
