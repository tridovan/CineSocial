import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Check, Loader2, Camera } from 'lucide-react';
import { userService } from '@/features/users/services/userService';
import { chatService } from '../services/chatService';
import { mediaService } from '@/features/media/services/mediaService';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UserResponse, UserWallProfileResponse } from '@/features/users/types';
import { getFullMediaUrl } from '@/config/media';
import toast from 'react-hot-toast';

interface CreateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type Tab = 'PRIVATE' | 'GROUP';

export const CreateChatModal = ({ isOpen, onClose, onSuccess }: CreateChatModalProps) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<Tab>('PRIVATE');

    // Common State
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [following, setFollowing] = useState<UserResponse[]>([]);
    const [searchResults, setSearchResults] = useState<UserWallProfileResponse[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
    const [creating, setCreating] = useState(false);

    // Group Specific State
    const [chatName, setChatName] = useState('');
    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [groupImagePreview, setGroupImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load following on mount
    useEffect(() => {
        if (isOpen) {
            loadFollowing();
            resetState();
        }
    }, [isOpen]);

    const resetState = () => {
        setSelectedUsers([]);
        setChatName('');
        setKeyword('');
        setGroupImage(null);
        setGroupImagePreview(null);
        setActiveTab('PRIVATE');
    };

    const loadFollowing = async () => {
        try {
            setLoading(true);
            const res = await userService.getMyFollowedUsers();
            if (res.code === 1000 && res.data) {
                setFollowing(res.data);
            }
        } catch (error) {
            console.error(error);
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
            const res = await userService.searchUsers(val);
            if (res.code === 1000 && res.data) {
                setSearchResults(res.data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleUser = (user: UserResponse | UserWallProfileResponse) => {
        // For Private: Only 1 user allowed. 
        if (activeTab === 'PRIVATE') {
            const isSelected = selectedUsers.some(u => u.id === user.id);
            if (isSelected) {
                setSelectedUsers([]);
            } else {
                setSelectedUsers([{
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    imgUrl: user.imgUrl,
                    email: user.email
                }]);
            }
            return;
        }

        // For Group: Multiple allowed
        const isSelected = selectedUsers.some(u => u.id === user.id);
        if (isSelected) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            const normalized: UserResponse = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                imgUrl: user.imgUrl,
                email: user.email
            };
            setSelectedUsers(prev => [...prev, normalized]);
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setGroupImage(file);
            setGroupImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Please select members');
            return;
        }

        // PRIVATE CHAT LOGIC (Deterministic)
        if (activeTab === 'PRIVATE') {
            if (!user?.id) return;
            const targetUser = selectedUsers[0];

            // 1. Calculate Deterministic ID
            const sortedIds = [user.id, targetUser.id!].sort();
            const roomId = sortedIds.join('_');

            // 2. Navigate (Draft Mode support via state)
            onClose(); // Close modal first
            navigate('/messages', {
                state: {
                    roomId,
                    targetUser: targetUser
                }
            });
            onSuccess(); // Optional: trigger parent refresh if needed (usually not for private)
            return;
        }

        // GROUP CHAT LOGIC (API Based)
        try {
            setCreating(true);
            let finalImgUrl: string | undefined = undefined;

            if (groupImage) {
                try {
                    const uploadRes = await mediaService.uploadImage(groupImage);
                    finalImgUrl = uploadRes.url;
                } catch (e) {
                    console.error("Image upload failed", e);
                    toast.error("Failed to upload group image");
                    setCreating(false);
                    return;
                }
            }

            if (!chatName.trim()) {
                toast.error('Group name is required');
                setCreating(false);
                return;
            }

            const res = await chatService.createChatRoom({
                chatName: chatName,
                memberIds: selectedUsers.map(u => u.id!),
                imgUrl: finalImgUrl
            });

            if (res.code === 1000) {
                toast.success('Chat created');
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to create chat');
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    const displayList = keyword ? searchResults : following;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header with Tabs */}
                <div className="pt-4 px-4 pb-0 border-b border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-lg">New Message</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-6 text-sm font-medium">
                        <button
                            onClick={() => { setActiveTab('PRIVATE'); setSelectedUsers([]); }}
                            className={`pb-3 border-b-2 transition-colors ${activeTab === 'PRIVATE' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            Private Message
                        </button>
                        <button
                            onClick={() => { setActiveTab('GROUP'); setSelectedUsers([]); }}
                            className={`pb-3 border-b-2 transition-colors ${activeTab === 'GROUP' ? 'border-brand-red text-brand-red' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            New Group
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'GROUP' && (
                        <div className="mb-6 flex flex-col items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                            {/* Image Upload */}
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-20 h-20 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                                    {groupImagePreview ? (
                                        <img src={groupImagePreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-400" size={28} />
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="text-white" size={24} />
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                            </div>

                            {/* Name Input */}
                            <input
                                className="w-full text-center bg-transparent border-b border-gray-300 focus:border-brand-red focus:outline-none py-1 text-lg font-medium placeholder:text-gray-400"
                                placeholder="Group Name"
                                value={chatName}
                                onChange={(e) => setChatName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={activeTab === 'PRIVATE' ? "Search for a person..." : "Add members..."}
                            value={keyword}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20"
                        />
                    </div>

                    {/* Selected Chips (Group only) */}
                    {activeTab === 'GROUP' && selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {selectedUsers.map(u => (
                                <span key={u.id} className="bg-blue-50 text-brand-red px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-blue-100">
                                    {u.firstName}
                                    <button onClick={() => toggleUser(u)} className="hover:text-red-700"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* List */}
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2 pl-1">
                            {keyword ? 'Results' : 'Suggested'}
                        </h3>
                        {loading ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-300" /></div>
                        ) : displayList.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm py-4">No users found.</p>
                        ) : (
                            displayList.map(u => {
                                const isSelected = selectedUsers.some(s => s.id === u.id);
                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleUser(u as any)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
                                            <img src={getFullMediaUrl(u.imgUrl)} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-900">{u.firstName} {u.lastName}</p>
                                        </div>

                                        {/* Checkbox state */}
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? 'bg-brand-red border-brand-red text-white' : 'border-gray-300 text-transparent'}`}>
                                            <Check size={12} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={handleCreate}
                        disabled={creating || selectedUsers.length === 0 || (activeTab === 'GROUP' && !chatName.trim())}
                        className="bg-brand-red text-white px-8 py-2.5 rounded-full font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-red/20"
                    >
                        {creating ? <Loader2 className="animate-spin" size={18} /> : (activeTab === 'GROUP' ? 'Create Group' : 'Chat')}
                    </button>
                </div>
            </div>
        </div>
    );
};
