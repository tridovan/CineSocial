import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X, Users, Trash2, Plus, LogOut, Camera, Loader2 } from 'lucide-react';
import { UserSearchList } from './UserSearchList';
import { chatService } from '../services/chatService';
import { mediaService } from '@/features/media/services/mediaService';
import type { ChatRoomResponseDetail } from '../types';
import { getFullMediaUrl } from '@/config/media';
import toast from 'react-hot-toast';

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

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
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // Create a ref for the file input
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingImage(true);
            const uploadedMedia = await mediaService.uploadImage(file);

            if (uploadedMedia && uploadedMedia.url) {
                // Immediately update the room with new image
                const res = await chatService.updateChatRoom(room.id, {
                    chatName: room.chatName,
                    memberIds: room.memberIds,
                    imgUrl: uploadedMedia.url
                });

                if (res.code === 1000) {
                    toast.success('Group icon updated');
                    onUpdate();
                }
            }
        } catch (error) {
            console.error("Failed to upload group icon:", error);
            toast.error("Failed to upload group icon");
        } finally {
            setIsUploadingImage(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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

    const handleLeaveGroup = async () => {
        try {
            setIsLoading(true);
            await chatService.leaveChatRoom(room.id);
            toast.success("Left group successfully");
            onClose();
            setShowLeaveConfirm(false);
            navigate('/messages');
            // Force refresh/reload might be needed if state is stale
            window.location.reload();
        } catch (error) {
            console.error("Failed to leave group", error);
            toast.error("Failed to leave group");
            setIsLoading(false); // Only stop loading on error, success navigates away
            setShowLeaveConfirm(false);
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
                    <div className="relative group/avatar">
                        <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border border-gray-200 flex-shrink-0">
                            <img
                                src={getFullMediaUrl(room.imgUrl)}
                                alt={room.chatName}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {isGroup && (
                            <>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity mb-4"
                                    disabled={isUploadingImage}
                                >
                                    {isUploadingImage ? (
                                        <Loader2 className="animate-spin text-white" />
                                    ) : (
                                        <Camera className="text-white" />
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </>
                        )}
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

                        {/* Leave Group Button */}
                        {isGroup && (
                            <div className="w-full mt-6 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => setShowLeaveConfirm(true)}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-2 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut size={18} />
                                    Leave Group
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={handleLeaveGroup}
                title="Leave Group?"
                message="Are you sure you want to leave this group? You won't be able to see future messages."
                confirmText="Leave Group"
                isDangerous={true}
                isLoading={isLoading}
            />
        </div>
    );
};
