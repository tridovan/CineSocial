import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<div className="text-center p-10">Home Feed (Coming Soon)</div>} />
                <Route path="/login" element={<div>Login Page</div>} />
                <Route path="/register" element={<div>Register Page</div>} />
                <Route path="/profile" element={<div>User Profile</div>} />
                <Route path="/search" element={<div>Search Page</div>} />
                <Route path="/notifications" element={<div>Notifications</div>} />
                <Route path="/messages" element={<div>Messages</div>} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
