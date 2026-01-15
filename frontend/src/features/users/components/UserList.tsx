import { Link } from 'react-router-dom';
import type { UserResponse, UserWallProfileResponse } from '../types';
import { User as UserIcon } from 'lucide-react';

interface UserListProps {
    users: UserResponse[] | UserWallProfileResponse[];
    title?: string;
    loading?: boolean;
}

export const UserList = ({ users, title, loading }: UserListProps) => {
    if (loading) {
        return <div className="text-center py-10 text-gray-500">Loading users...</div>;
    }

    if (users.length === 0) {
        return <div className="text-center py-10 text-gray-500">No users found.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {title && (
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">{title}</h2>
                </div>
            )}
            <div className="divide-y divide-gray-100">
                {users.map((user) => (
                    <div key={user.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <Link to={`/users/${user.id}`} className="shrink-0">
                            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center border border-gray-200">
                                {user.imgUrl ? (
                                    <img src={user.imgUrl} alt={user.firstName} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={24} className="text-gray-400" />
                                )}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link to={`/users/${user.id}`} className="block">
                                <h3 className="font-bold text-gray-900 truncate hover:text-brand-red transition-colors">
                                    {user.firstName} {user.lastName}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
