import { PostItem } from './PostItem';

export const PostList = () => {
    // Mock data
    const posts = [1, 2, 3];

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostItem key={post} post={{ content: `Post content ${post}` }} />
            ))}
        </div>
    );
};
