import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import type { ChatRoomResponseDetail, ChatMessageResponse } from '../types';
import { Loader2, MoreVertical, ArrowLeft, Send, Image as ImageIcon, Users } from 'lucide-react';
import { getFullMediaUrl } from '@/config/media';
import { ChatMessageItem } from './ChatMessageItem';
import { RoomSettingsModal } from './RoomSettingsModal';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

interface ChatWindowProps {
    roomId: string;
    onBack: () => void;
}

export const ChatWindow = ({ roomId, onBack }: ChatWindowProps) => {
    const { token, user } = useAuthStore();
    const [room, setRoom] = useState<ChatRoomResponseDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [inputText, setInputText] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // WebSocket Hook
    const { subscribeToRoom, unsubscribeFromRoom, sendGroupMessage, sendPrivateMessage } = useChatWebSocket({
        token,
        onMessageReceived: (newMsg) => {
            // Only add if it belongs to current room
            if (newMsg.roomId === roomId) {
                setMessages(prev => [...prev, newMsg]);
            }
        }
    });

    // 1. Fetch Room Data
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [roomRes, historyRes] = await Promise.all([
                    chatService.getChatRoomDetail(roomId),
                    chatService.getChatHistory(roomId, 0, 20)
                ]);
                if (roomRes.code === 1000) setRoom(roomRes.data);
                if (historyRes.code === 1000) {
                    setMessages((historyRes.data.items || []).reverse());
                    setHasMore(historyRes.data.pageNo < historyRes.data.totalPage - 1);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [roomId]);

    // 2. Subscribe to WebSocket Room
    useEffect(() => {
        if (roomId) {
            subscribeToRoom(roomId);
        }
        return () => {
            if (roomId) unsubscribeFromRoom(roomId);
        };
    }, [roomId, subscribeToRoom, unsubscribeFromRoom]);

    // 3. Auto-scroll on new message
    useEffect(() => {
        if (messages.length > 0) {
            // Use setTimeout to allow DOM to render
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputText.trim() || !room) return;

        if (room.type === 'GROUP') {
            sendGroupMessage(roomId, inputText);
        } else {
            // For private, we send to the other person (User Queue) or fallback to Room Queue?
            // Based on user prompt: "Send Private: /app/chat/private/{recipientId}"
            // We need to find the other person's ID.
            const other = room.members.find(m => m.id !== user?.id);
            if (other && other.id) {
                sendPrivateMessage(other.id, inputText);
            } else {
                console.warn("Recipient not found for private message");
                // Fallback: Some backends allow sending to room even for private.
                // sendGroupMessage(roomId, inputText);
            }
        }
        setInputText('');
    };

    if (loading) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-brand-red" /></div>;
    }

    if (!room) {
        return <div className="flex-1 flex items-center justify-center text-gray-500">Room not found</div>;
    }

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-16 border-b border-gray-100 flex items-center px-4 justify-between bg-white flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600">
                        <ArrowLeft size={20} />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 flex items-center justify-center">
                        {room.imgUrl ? (
                            <img
                                src={getFullMediaUrl(room.imgUrl)}
                                alt={room.chatName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Users size={20} className="text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-tight">{room.chatName}</h3>
                        <p className="text-xs text-gray-500">
                            {room.type === 'GROUP' ? `${room.members?.length || 0} members` : 'Active now'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {hasMore && (
                    <div className="flex justify-center">
                        <button className="text-xs text-brand-red font-medium hover:underline">Load older messages</button>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="text-center text-gray-300 py-10 mt-10">
                        <p>No messages yet.</p>
                        <p className="text-sm">Say hello!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;
                        return (
                            <ChatMessageItem
                                key={msg.id || index}
                                message={msg}
                                showAvatar={showAvatar}
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <ImageIcon size={20} />
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm py-1"
                        placeholder={room.type === 'GROUP' ? `Message ${room.chatName}` : "Message..."}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-400'}`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Room Settings Modal */}
            <RoomSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                room={room}
                onUpdate={() => fetchRoomData()} // Refresh header
            />
        </div>
    );
};
