import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import AppLayout from '@/components/layout/AppLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { AuthenticatePage } from '@/features/auth/pages/AuthenticatePage';
import { UserProfile } from '@/features/users/components/UserProfile';
import { FollowingPage } from '@/features/users/pages/FollowingPage';
import { HomePage } from '@/features/posts/pages/HomePage';

const MyProfileRedirect = () => {
    const { user } = useAuthStore();

    if (!user) {
        return <div className="text-center p-10">Loading profile...</div>;
    }

    return <Navigate to={`/users/${user.id}`} replace />;
};

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<div className="flex justify-center pt-10"><LoginForm /></div>} />
                <Route path="/register" element={<div className="flex justify-center pt-10"><RegisterForm /></div>} />
                <Route path="/authenticate" element={<AuthenticatePage />} />
                <Route path="/profile" element={<MyProfileRedirect />} />
                <Route path="/me/following" element={<FollowingPage />} />
                <Route path="/users/:id" element={<UserProfile />} />
                <Route path="/search" element={<div>Search Page</div>} />
                <Route path="/notifications" element={<div>Notifications</div>} />
                <Route path="/messages" element={<div>Messages</div>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
