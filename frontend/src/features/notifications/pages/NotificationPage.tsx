import { NotificationList } from '../components/NotificationList';

export const NotificationPage = () => {
    return (
        <div className="max-w-2xl mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-1 pl-4">Your Notifications</h1>
                <p className="text-gray-500 text-sm pl-4">See who is interacting with you</p>
            </div>

            {/* Pass w-full to override the default w-80 */}
            <NotificationList className="w-full max-h-none border-none bg-transparent p-0" />
        </div>
    );
};
