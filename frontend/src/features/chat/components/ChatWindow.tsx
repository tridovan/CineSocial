import { Send } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';

export const ChatWindow = () => {
    const { messages } = useChatStore();

    return (
        <div className="flex flex-col h-[500px] bg-bg-card rounded-xl border border-white/10">
            <div className="p-4 border-b border-white/10 font-bold">Chat</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg max-w-[80%] ${msg.senderId === 'me' ? 'bg-brand-red' : 'bg-gray-700'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-white/10 flex gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-800 rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button className="bg-brand-gold text-black p-2 rounded-full hover:bg-yellow-400">
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};
