import { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { UserList } from '../components/UserList';
import type { UserResponse } from '../types';
import toast from 'react-hot-toast';

export const FollowingPage = () => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFollowing();
    }, []);

    const loadFollowing = async () => {
        try {
            setLoading(true);
            const response = await userService.getMyFollowedUsers();
            if (response && response.data) {
                setUsers(response.data);
            }
        } catch (error) {
            toast.error('Failed to load following list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Following</h1>
            <UserList users={users} loading={loading} />
        </div>
    );
};
