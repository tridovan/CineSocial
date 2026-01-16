import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, MessageCircle, Search, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { NotificationListener } from '@/features/notifications/components/NotificationListener';
import { getFullMediaUrl } from '@/config/media';

const Sidebar = () => {
    const { logout, user } = useAuthStore();
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

            <div className="mt-auto border-t border-gray-100 pt-4">
                {user && (
                    <div className="flex items-center gap-3 px-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border border-gray-200">
                            {user.imgUrl ? (
                                <img
                                    src={getFullMediaUrl(user.imgUrl)}
                                    alt={user.firstName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to default icon if image fails
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 ${user.imgUrl ? 'hidden' : ''}`}>
                                <User size={20} />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 text-gray-600 hover:text-brand-red hover:bg-gray-100 transition-colors p-3 rounded-lg"
                >
                    <LogOut size={24} /> <span className="font-medium">Logout</span>
                </button>
            </div>
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
            <NotificationListener />
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
