import { Outlet, Link } from 'react-router-dom';
import { Home, User, MessageCircle, Heart, Search, Bell } from 'lucide-react';

const Sidebar = () => (
    <aside className="w-64 h-screen bg-bg-card border-r border-gray-800 fixed left-0 top-0 hidden md:flex flex-col p-4">
        <div className="text-2xl font-bold text-brand-red mb-8 tracking-widest">
            CINESOCIAL
        </div>
        <nav className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 text-gray-300 hover:text-brand-gold transition-colors">
                <Home size={24} /> <span>Feed</span>
            </Link>
            <Link to="/search" className="flex items-center gap-3 text-gray-300 hover:text-brand-gold transition-colors">
                <Search size={24} /> <span>Search</span>
            </Link>
            <Link to="/notifications" className="flex items-center gap-3 text-gray-300 hover:text-brand-gold transition-colors">
                <Bell size={24} /> <span>Notifications</span>
            </Link>
            <Link to="/messages" className="flex items-center gap-3 text-gray-300 hover:text-brand-gold transition-colors">
                <MessageCircle size={24} /> <span>Messages</span>
            </Link>
            <Link to="/profile" className="flex items-center gap-3 text-gray-300 hover:text-brand-gold transition-colors">
                <User size={24} /> <span>Profile</span>
            </Link>
        </nav>
    </aside>
);

const AppLayout = () => {
    return (
        <div className="min-h-screen bg-bg-dark text-white">
            <Sidebar />
            <main className="md:ml-64 min-h-screen p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
