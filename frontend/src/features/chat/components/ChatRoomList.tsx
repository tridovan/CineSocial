import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import type { ChatRoomResponse } from '../types';
import { getFullMediaUrl } from '@/config/media';
import { Loader2, Plus, MessageSquare, Users } from 'lucide-react';
import { CreateChatModal } from './CreateChatModal';

interface ChatRoomListProps {
    onSelectRoom: (roomId: string) => void;
    activeRoomId?: string;
}

export const ChatRoomList = ({ onSelectRoom, activeRoomId }: ChatRoomListProps) => {
    const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await chatService.getUserChatRooms();
            if (res.code === 1000 && res.data) {
                setRooms(res.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-80 flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-xl text-gray-900">Chats</h2>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-brand-red transition-colors"
                    title="New Chat"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-red" /></div>
                ) : rooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-4 text-center">
                        <MessageSquare size={32} className="mb-2 opacity-50" />
                        <p>No conversations yet.</p>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="mt-4 text-brand-red font-medium text-sm hover:underline"
                        >
                            Start a new chat
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {rooms.map(room => (
                            <div
                                key={room.id}
                                onClick={() => onSelectRoom(room.id)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${activeRoomId === room.id ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-100">
                                    {room.imgUrl ? (
                                        <img src={getFullMediaUrl(room.imgUrl)} alt={room.chatName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            {room.type === 'GROUP' ? <Users size={20} /> : <MessageSquare size={20} />}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold text-sm truncate ${activeRoomId === room.id ? 'text-brand-red' : 'text-gray-900'}`}>
                                        {room.chatName}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">
                                        {room.type === 'GROUP' ? 'Group Chat' : 'Private Conversation'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreateChatModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchRooms}
            />
        </div>
    );
};
