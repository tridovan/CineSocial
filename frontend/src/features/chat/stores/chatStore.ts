import { create } from 'zustand';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
}

interface ChatState {
    messages: Message[];
    addMessage: (message: Message) => void;
    setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setMessages: (messages) => set({ messages }),
}));
