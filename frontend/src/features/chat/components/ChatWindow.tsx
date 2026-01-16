import { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { mediaService } from '@/features/media/services/mediaService';
import type { ChatRoomResponseDetail, ChatMessageResponse, UserResponse } from '../types';
import { Loader2, MoreVertical, ArrowLeft, Send, Image as ImageIcon, Users } from 'lucide-react';
import { getFullMediaUrl } from '@/config/media';
import { ChatMessageItem } from './ChatMessageItem';
import { RoomSettingsModal } from './RoomSettingsModal';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useChatWebSocket } from '../hooks/useChatWebSocket';

interface ChatWindowProps {
    roomId: string;
    onBack: () => void;
    initialTargetUser?: UserResponse;
}

export const ChatWindow = ({ roomId, onBack, initialTargetUser }: ChatWindowProps) => {
    const { token, user } = useAuthStore();
    const [room, setRoom] = useState<ChatRoomResponseDetail | null>(null);
    const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // WebSocket Hook
    const { subscribeToRoom, unsubscribeFromRoom, sendGroupMessage, sendPrivateMessage, isConnected } = useChatWebSocket({
        token,
        onMessageReceived: (newMsg) => {
            // Only update if it belongs to current room
            if (newMsg.roomId !== roomId) return;

            setMessages(prev => {
                // 1. Check if we already have this exact message ID (deduplication)
                if (prev.some(m => m.id === newMsg.id)) {
                    return prev;
                }

                // 2. If it's my message, try to find the optimistic version and replace it
                if (newMsg.senderId === user?.id) {
                    // Find optimistic message (last one usually)
                    // We look for one with isOptimistic flag AND matching content
                    const optIndex = [...prev].reverse().findIndex(m => (m as any).isOptimistic && m.content === newMsg.content);

                    if (optIndex !== -1) {
                        const realIndex = prev.length - 1 - optIndex;
                        const newArr = [...prev];
                        newArr[realIndex] = newMsg; // Replace optimistic with real
                        return newArr;
                    }
                }

                // 3. Otherwise just append
                return [...prev, newMsg];
            });
        }
    });

    const fetchRoomData = async () => {
        setLoading(true);
        try {
            const [roomRes, historyRes] = await Promise.all([
                chatService.getChatRoomDetail(roomId).catch(() => null), // Catch 404 or other errors
                chatService.getChatHistory(roomId, 0, 20).catch(() => null)
            ]);

            if (roomRes && roomRes.code === 1000) {
                setRoom(roomRes.data);
            } else if (initialTargetUser && user) {
                // DRAFT MODE: Room doesn't exist yet, but we have target info.
                // Create a temporary room state so UI renders.
                setRoom({
                    id: roomId,
                    chatName: `${initialTargetUser.firstName} ${initialTargetUser.lastName}`,
                    type: 'PRIVATE',
                    imgUrl: initialTargetUser.imgUrl,
                    memberIds: [user.id!, initialTargetUser.id!],
                    members: [user as UserResponse, initialTargetUser]
                });
            }

            if (historyRes && historyRes.code === 1000) {
                const items = historyRes.data.items || [];
                // API returns [Newest...Oldest].
                // We want [Oldest...Newest] for proper chat display (Newest at bottom).
                setMessages(items.reverse());
                setHasMore(historyRes.data.pageNo < historyRes.data.totalPage - 1);
            } else {
                setMessages([]);
                setHasMore(false);
            }
        } catch (e) {
            console.error("Error fetching room data:", e);
        } finally {
            setLoading(false);
        }
    };

    // 1. Fetch Room Data
    useEffect(() => {
        fetchRoomData();
    }, [roomId]);

    // 2. Subscribe to WebSocket Room
    useEffect(() => {
        if (roomId && isConnected) {
            subscribeToRoom(roomId);
        }
        return () => {
            if (roomId) unsubscribeFromRoom(roomId);
        };
    }, [roomId, isConnected, subscribeToRoom, unsubscribeFromRoom]);

    // 3. Auto-scroll on new message
    useEffect(() => {
        if (messages.length > 0) {
            // Use setTimeout to allow DOM to render
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !room) return;

        setIsUploading(true);
        try {
            let uploadedMedia;
            if (file.type.startsWith('image/')) {
                uploadedMedia = await mediaService.uploadImage(file);
            } else if (file.type.startsWith('video/')) {
                uploadedMedia = await mediaService.uploadVideo(file);
            } else {
                alert("Unsupported file type");
                return;
            }

            if (uploadedMedia && uploadedMedia.url) {
                const msgContent = inputText.trim() || "Sent an attachment";
                const imgUrl = uploadedMedia.url;

                // Optimistic Update for Media
                const tempId = Date.now().toString();
                const optimisticMsg: ChatMessageResponse & { isOptimistic: boolean } = {
                    id: tempId,
                    roomId: room.id,
                    senderId: user?.id || '',
                    content: msgContent,
                    contentImgUrl: imgUrl,
                    timestamp: new Date().toISOString(),
                    sendFirstName: user?.firstName || 'Me',
                    sendLastName: user?.lastName || '',
                    senderAvatar: user?.imgUrl,
                    recipientIds: [],
                    isOptimistic: true
                };
                setMessages(prev => [...prev, optimisticMsg]);

                if (room.type === 'GROUP') {
                    sendGroupMessage(roomId, msgContent, imgUrl);
                } else if (room.type === 'PRIVATE') {
                    const recipient = room.members?.find(m => m.id !== user?.id);
                    if (recipient && recipient.id) {
                        sendPrivateMessage(recipient.id, msgContent, imgUrl);
                    }
                }

                // Clear input if we used it as caption
                if (inputText.trim()) setInputText('');
            }

        } catch (error) {
            console.error("Failed to upload file:", error);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !room) return;

        // OPTIMISTIC UPDATE: Add message immediately to UI
        const tempId = Date.now().toString();
        const optimisticMsg: ChatMessageResponse & { isOptimistic: boolean } = {
            id: tempId,
            roomId: room.id,
            senderId: user?.id || '',
            content: inputText,
            timestamp: new Date().toISOString(),
            sendFirstName: user?.firstName || 'Me',
            sendLastName: user?.lastName || '',
            senderAvatar: user?.imgUrl,
            recipientIds: [],
            isOptimistic: true
        };
        setMessages(prev => [...prev, optimisticMsg]);

        if (room.type === 'GROUP') {
            sendGroupMessage(roomId, inputText);
        } else if (room.type === 'PRIVATE') {
            // Find the other person (recipient)
            const recipient = room.members?.find(m => m.id !== user?.id);

            if (recipient && recipient.id) {
                sendPrivateMessage(recipient.id, inputText);
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
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                    />
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
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
