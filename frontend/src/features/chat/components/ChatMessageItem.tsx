import { useAuthStore } from '@/features/auth/stores/authStore';
import type { ChatMessageResponse } from '../types';
import { getFullMediaUrl } from '@/config/media';
import { format } from 'date-fns';

interface ChatMessageItemProps {
    message: ChatMessageResponse;
    showAvatar?: boolean;
}

export const ChatMessageItem = ({ message, showAvatar = true }: ChatMessageItemProps) => {
    const { user } = useAuthStore();
    const isMe = user?.id === message.senderId;

    return (
        <div className={`flex gap-2 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
            {/* Avatar (only for others) */}
            {!isMe && (
                <div className={`w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ${!showAvatar ? 'invisible' : ''}`}>
                    <img
                        src={getFullMediaUrl(message.senderAvatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sendFirstName || 'User')}&background=random`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Name (only group chats usually, but helpful if not me) */}
                {!isMe && showAvatar && (
                    <span className="text-xs text-gray-500 ml-1 mb-1">
                        {message.sendFirstName} {message.sendLastName}
                    </span>
                )}

                {/* Bubble */}
                {message.content && (
                    <div
                        className={`px-4 py-2 rounded-2xl text-sm break-words ${isMe
                            ? 'bg-brand-red text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                            }`}
                    >
                        {message.content}
                    </div>
                )}

                {/* Attachment (Image or Video) */}
                {message.contentImgUrl && (
                    <div className="mt-1 rounded-xl overflow-hidden border border-gray-200">
                        {/\.(mp4|webm|ogg|mov)$/i.test(message.contentImgUrl) ? (
                            <video
                                src={getFullMediaUrl(message.contentImgUrl)}
                                controls
                                className="max-w-xs max-h-64 object-cover"
                            />
                        ) : (
                            <img
                                src={getFullMediaUrl(message.contentImgUrl)}
                                alt="Attachment"
                                className="max-w-xs max-h-64 object-cover"
                            />
                        )}
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {format(new Date(message.timestamp), 'HH:mm')}
                </span>
            </div>
        </div>
    );
};
