import { CreatePost } from '../components/CreatePost';
import { PostList } from '../components/PostList';
import { useAuthStore } from '@/features/auth/stores/authStore';

export const HomePage = () => {
    const { isAuthenticated } = useAuthStore();
    // We can define a callback to refresh the list, but for now PostList listens to prop changes.
    // To trigger a refresh on new post, we can use a key or a state.
    // Let's rely on PostList's internal logic or force re-mount via key?
    // Better: Pass a "refreshTrigger" prop to PostList, or rely on simple state toggle.

    // Actually, CreatePost just calls onPostCreated. 
    // Let's modify PostList to accept a "refreshKey" or similar.
    // Or simpler: Just render them. The user will see their post at the top? 
    // Wait, the API returns the list. If we don't refresh the list, the new post won't appear.

    // Let's implement a simple refresh trigger.

    const reloadFeed = () => {
        // This is a bit hacky without a proper query client (like React Query), 
        // but we can just reload the page or use a key to force re-render of PostList.
        // Using window.location.reload() is too harsh.
        // Using a key on PostList is effective for resetting it.
        window.location.reload();
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            {isAuthenticated && (
                <CreatePost onPostCreated={reloadFeed} />
            )}

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900">News Feed</h1>
                {/* Future: tabs for 'For You' vs 'Following' */}
            </div>

            <PostList feedType="HOME" />
        </div>
    );
};
