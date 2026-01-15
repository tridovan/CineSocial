import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, MessageCircle, Heart, Search, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NotificationListener } from '@/features/notifications/components/NotificationListener';

const Sidebar = () => {
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 h-screen bg-bg-card border-r border-gray-200 fixed left-0 top-0 hidden md:flex flex-col p-4 shadow-sm z-50">
            <div className="text-2xl font-bold text-brand-red mb-8 tracking-widest pl-2">
                CINESOCIAL
            </div>
            <nav className="flex flex-col gap-2 flex-1">
                <NavLink to="/" icon={<Home size={24} />} label="Home" />
                <NavLink to="/search" icon={<Search size={24} />} label="Search" />
                <NavLink to="/notifications" icon={<Bell size={24} />} label="Notifications" />
                <NavLink to="/messages" icon={<MessageCircle size={24} />} label="Messages" />
                <NavLink to="/profile" icon={<User size={24} />} label="Profile" />
            </nav>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-gray-600 hover:text-brand-red hover:bg-gray-100 transition-colors mt-auto p-3 rounded-lg border-t border-gray-100"
            >
                <LogOut size={24} /> <span className="font-medium">Logout</span>
            </button>
        </aside>
    );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <Link to={to} className="flex items-center gap-3 text-gray-600 hover:bg-gray-100 hover:text-brand-red p-3 rounded-lg transition-all font-medium">
        {icon} <span>{label}</span>
    </Link>
);

const AppLayout = () => {
    const location = useLocation();
    const { isAuthenticated, fetchProfile, user } = useAuthStore();
    const isAuthPage = ['/login', '/register', '/authenticate'].includes(location.pathname);

    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchProfile();
        }
    }, [isAuthenticated, fetchProfile, user]);

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-bg-dark flex items-center justify-center p-4">
                <Outlet />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-dark text-gray-900 font-sans">
            <Sidebar />
            <main className="md:ml-64 min-h-screen">
                <div className="max-w-4xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
