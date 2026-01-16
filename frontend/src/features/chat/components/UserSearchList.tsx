import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { userService } from '@/features/users/services/userService';
import type { UserResponse, UserWallProfileResponse } from '@/features/users/types';
import { getFullMediaUrl } from '@/config/media';

interface UserSearchListProps {
    onSelect: (user: UserResponse) => void;
    excludeIds?: string[];
    selectedIds?: string[]; // For highlighting or disabling
    placeholder?: string;
    actionIcon?: React.ReactNode; // Optional icon for the action button (default checks or nothing)
}

export const UserSearchList = ({
    onSelect,
    excludeIds = [],
    selectedIds = [],
    placeholder = "Search for a person...",
    actionIcon
}: UserSearchListProps) => {
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [following, setFollowing] = useState<UserResponse[]>([]);
    const [searchResults, setSearchResults] = useState<UserWallProfileResponse[]>([]);

    useEffect(() => {
        loadFollowing();
    }, []);

    const loadFollowing = async () => {
        try {
            setLoading(true);
            const res = await userService.getMyFollowedUsers();
            if (res.code === 1000 && res.data) {
                setFollowing(res.data);
            }
        } catch (error) {
            console.error("Failed to load followed users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (val: string) => {
        setKeyword(val);
        if (!val.trim()) {
            setSearchResults([]);
            return;
        }
        try {
            // Don't set loading true for search to avoid flickering too much, or use debounce? 
            // Existing implementation didn't debounce much, but let's keep it simple.
            const res = await userService.searchUsers(val);
            if (res.code === 1000 && res.data) {
                setSearchResults(res.data);
            }
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    // Filter out excluded IDs
    const rawList = keyword ? searchResults : following;
    const displayList = rawList.filter(u => u.id && !excludeIds.includes(u.id));

    return (
        <div className="flex flex-col h-full">
            {/* Search Input */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder={placeholder}
                    value={keyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 text-sm"
                />
            </div>

            {/* Results List */}
            <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 pl-1">
                {keyword ? 'Results' : 'Suggested'}
            </h3>

            <div className="flex-1 overflow-y-auto min-h-[150px]">
                {loading && !keyword ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-300" /></div>
                ) : displayList.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-4">No users found.</p>
                ) : (
                    <div className="space-y-1">
                        {displayList.map(u => {
                            const isSelected = u.id && selectedIds.includes(u.id);
                            return (
                                <div
                                    key={u.id}
                                    onClick={() => onSelect(u as UserResponse)}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-100 flex-shrink-0">
                                        <img src={getFullMediaUrl(u.imgUrl)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-gray-900 truncate">{u.firstName} {u.lastName}</p>
                                        {/* Optional: Show email or username if needed */}
                                    </div>

                                    {/* Action Icon / Selection State */}
                                    {actionIcon ? (
                                        <div className="text-gray-400 hover:text-brand-red">
                                            {actionIcon}
                                        </div>
                                    ) : (
                                        /* Default Selection Circle (Hidden unless selected) */
                                        isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
