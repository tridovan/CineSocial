import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Users, Trash2, Plus } from 'lucide-react';
import { UserSearchList } from './UserSearchList';
import { chatService } from '../services/chatService';
import type { ChatRoomResponseDetail } from '../types';
import { getFullMediaUrl } from '@/config/media';
import toast from 'react-hot-toast';

interface RoomSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    room: ChatRoomResponseDetail;
    onUpdate: () => void;
}

interface RoomForm {
    chatName: string;
}

export const RoomSettingsModal = ({ isOpen, onClose, room, onUpdate }: RoomSettingsModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);

    // Only allow editing name for Groups?
    // User response schema implies standard ChatRoomRequest for update.
    const isGroup = room.type === 'GROUP';

    const { register, handleSubmit } = useForm<RoomForm>({
        defaultValues: {
            chatName: room.chatName
        }
    });

    const onSubmit = async (data: RoomForm) => {
        try {
            setIsLoading(true);
            const res = await chatService.updateChatRoom(room.id, {
                chatName: data.chatName,
                memberIds: room.memberIds, // Keep members same
                imgUrl: room.imgUrl
            });

            if (res.code === 1000) {
                toast.success('Room updated');
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update room');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddMember = async (user: any) => {
        try {
            // Optimistic / Immediate update
            const newMemberIds = [...room.memberIds, user.id];

            const res = await chatService.updateChatRoom(room.id, {
                chatName: room.chatName,
                memberIds: newMemberIds,
                imgUrl: room.imgUrl
            });

            if (res.code === 1000) {
                toast.success(`Added ${user.firstName}`);
                onUpdate(); // Refresh room data
                // setIsAddingUser(false); // Optional: close search or keep open for more? Keep open is better UX.
            }
        } catch (error) {
            console.error("Failed to add member", error);
            toast.error("Failed to add member");
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this member?")) return;

        try {
            const newMemberIds = room.memberIds.filter(id => id !== userId);

            const res = await chatService.updateChatRoom(room.id, {
                chatName: room.chatName,
                memberIds: newMemberIds,
                imgUrl: room.imgUrl
            });

            if (res.code === 1000) {
                toast.success('Member removed');
                onUpdate();
            }
        } catch (error) {
            console.error("Failed to remove member", error);
            toast.error("Failed to remove member");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="font-bold text-lg">Room Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center overflow-y-auto">
                    <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border border-gray-200 flex-shrink-0">
                        <img
                            src={getFullMediaUrl(room.imgUrl)}
                            alt={room.chatName}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {isGroup ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full mb-6 flex-shrink-0">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Group Name</label>
                            <div className="flex gap-2">
                                <input
                                    {...register('chatName', { required: true })}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
                                />
                                <button disabled={isLoading} className="bg-brand-red text-white px-3 py-2 rounded-lg text-sm font-bold">
                                    SAVE
                                </button>
                            </div>
                        </form>
                    ) : (
                        <h3 className="text-xl font-bold mb-6 text-center">{room.chatName}</h3>
                    )}

                    <div className="w-full flex-1">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                <Users size={16} /> Members ({room.members?.length || 0})
                            </h4>
                            {isGroup && (
                                <button
                                    onClick={() => setIsAddingUser(!isAddingUser)}
                                    className="text-brand-red text-xs font-bold hover:underline"
                                >
                                    {isAddingUser ? 'Done' : 'Add Member'}
                                </button>
                            )}
                        </div>

                        {/* Add Member Section */}
                        {isAddingUser && (
                            <div className="mb-4 border border-gray-200 rounded-xl p-3 bg-gray-50/50">
                                <UserSearchList
                                    onSelect={handleAddMember}
                                    excludeIds={room.memberIds}
                                    placeholder="Search to add..."
                                    actionIcon={<Plus size={16} />}
                                />
                            </div>
                        )}

                        {/* Member List */}
                        <div className="space-y-2">
                            {room.members?.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg group">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={getFullMediaUrl(member.imgUrl)} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-sm font-medium flex-1">{member.firstName} {member.lastName}</span>

                                    {isGroup && (
                                        <button
                                            onClick={() => handleRemoveMember(member.id!)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                            title="Remove member"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
