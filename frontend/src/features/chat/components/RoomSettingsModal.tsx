import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2, Users } from 'lucide-react';
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
                memberIds: room.memberIds, // Keep members same for now
                imgUrl: room.imgUrl // Keep img same
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Room Details</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden border border-gray-200">
                        <img
                            src={getFullMediaUrl(room.imgUrl)}
                            alt={room.chatName}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {isGroup ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full mb-6">
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
                        <h3 className="text-xl font-bold mb-6">{room.chatName}</h3>
                    )}

                    <div className="w-full">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3">
                            <Users size={16} /> Members ({room.members?.length || 0})
                        </h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {room.members?.map(member => (
                                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                        <img src={getFullMediaUrl(member.imgUrl)} className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-sm font-medium">{member.firstName} {member.lastName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
