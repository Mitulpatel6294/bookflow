import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLayout() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link to="/admin" className="block px-4 py-2 rounded-md hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-colors">Dashboard</Link>
                    <Link to="/admin/appointments" className="block px-4 py-2 rounded-md hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-colors">Appointments</Link>
                    <Link to="/admin/settings" className="block px-4 py-2 rounded-md hover:bg-primary-50 text-gray-700 hover:text-primary-600 transition-colors">Settings</Link>
                </nav>
                <div className="p-4 border-t">
                    <button onClick={handleLogout} className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors">Logout</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
