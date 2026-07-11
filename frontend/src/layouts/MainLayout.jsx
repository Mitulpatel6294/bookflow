import { Outlet } from 'react-router-dom';

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary-600">BookFlow</h1>
                    <nav>
                        <a href="/admin/login" className="text-gray-500 hover:text-primary-600 text-sm font-medium">Admin Portal</a>
                    </nav>
                </div>
            </header>
            <main className="flex-grow bg-gray-50">
                <Outlet />
            </main>
            <footer className="bg-gray-800 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p>&copy; {new Date().getFullYear()} BookFlow. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
