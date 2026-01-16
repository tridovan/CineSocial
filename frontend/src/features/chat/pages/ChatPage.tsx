import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatRoomList } from '../components/ChatRoomList';
import { ChatWindow } from '../components/ChatWindow';
import { MessageCircle } from 'lucide-react';

export const ChatPage = () => {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [initialTargetUser, setInitialTargetUser] = useState<any>(null); // To pass to specific ChatWindow
    const location = useLocation();

    useEffect(() => {
        if (location.state?.roomId) {
            setSelectedRoomId(location.state.roomId);
            if (location.state.targetUser) {
                setInitialTargetUser(location.state.targetUser);
            }
        }
    }, [location.state]);

    return (
        <div className="flex h-[calc(100vh-64px)] -m-4 md:-m-8 bg-gray-50 overflow-hidden">
            {/* Sidebar List */}
            <div className={`${selectedRoomId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200 bg-white h-full`}>
                <ChatRoomList
                    onSelectRoom={setSelectedRoomId}
                    activeRoomId={selectedRoomId || undefined}
                />
            </div>

            {/* Main Chat Area */}
            <div className={`flex-1 flex flex-col h-full bg-white ${!selectedRoomId && 'hidden md:flex'}`}>
                {selectedRoomId ? (
                    <ChatWindow
                        roomId={selectedRoomId}
                        onBack={() => setSelectedRoomId(null)}
                        initialTargetUser={initialTargetUser}
                    />
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-8 text-center bg-gray-50/50">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={48} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-500">Your Messages</h3>
                        <p className="max-w-xs mx-auto mt-2">Send photos and private messages to your friends or groups.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
