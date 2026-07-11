const fs = require('fs');
const path = require('path');

const files = {
    'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
`,
    'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
`,
    '.env': `VITE_API_BASE_URL=http://localhost:8000/api/v1
`,
    'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext.tsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
`,
    'src/App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
        </Route>
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
`,
    'src/services/api.ts': `import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
});

export default api;
`,
    'src/contexts/AuthContext.tsx': `import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type AuthContextType = {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    const login = (newToken: string) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
        }
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
`,
    'src/layouts/MainLayout.tsx': `import { Outlet } from 'react-router-dom';

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
`,
    'src/layouts/AdminLayout.tsx': `import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
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
`,
    'src/pages/NotFound.tsx': `import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Page not found</p>
            <Link to="/" className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 transition-colors">
                Go back home
            </Link>
        </div>
    );
}
`,
    'src/pages/Home.tsx': `import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';

const bookingSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(5, "Phone is required"),
    appointment_date: z.string().min(1, "Date is required"),
    appointment_time: z.string().min(1, "Time is required"),
    message: z.string().optional()
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Home() {
    // Fetch Settings
    const { data, isLoading, isError } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data.data;
        }
    });

    const settings = data || {
        business_name: 'BookFlow Demo',
        email: 'info@demo.com',
        phone: '+1 234 567 890',
        address: '123 Default Street',
        opening_time: '09:00',
        closing_time: '17:00'
    };

    const { register, handleSubmit, reset, formState: { errors } } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema)
    });

    const mutation = useMutation({
        mutationFn: async (data: BookingFormData) => {
            const res = await api.post('/appointments', data);
            return res.data;
        },
        onSuccess: () => {
            alert('Appointment booked successfully!');
            reset();
        },
        onError: () => {
            alert('Failed to book appointment. Please try again.');
        }
    });

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-primary-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Welcome to {settings.business_name}</h1>
                    <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                        Book your appointment easily online. We are open from {settings.opening_time} to {settings.closing_time}.
                    </p>
                </div>
            </section>

            {/* Content Area */}
            <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
                    <div className="space-y-4 text-gray-600">
                        <p><strong>Email:</strong> {settings.email}</p>
                        <p><strong>Phone:</strong> {settings.phone}</p>
                        <p><strong>Address:</strong> {settings.address}</p>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input {...register('name')} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" {...register('email')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" {...register('phone')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" {...register('appointment_date')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                                {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input type="time" {...register('appointment_time')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                                {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                            <textarea {...register('message')} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2"></textarea>
                        </div>
                        <button type="submit" disabled={mutation.isPending} className="w-full bg-primary-600 text-white font-semibold py-3 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50">
                            {mutation.isPending ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
`,
    'src/pages/AdminLogin.tsx': `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useState } from 'react';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

type LoginData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data: LoginData) => {
        try {
            setError('');
            const res = await api.post('/login', data);
            if (res.data.success && res.data.token) {
                login(res.data.token);
                navigate('/admin');
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && <div className="bg-red-50 text-red-500 p-3 rounded">{error}</div>}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input {...register('email')} type="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input {...register('password')} type="password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">
                                {isSubmitting ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
`,
    'src/pages/Dashboard.tsx': `import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: async () => {
            const res = await api.get('/dashboard');
            return res.data.data;
        }
    });

    if (isLoading) return <div>Loading dashboard...</div>;

    const stats = data || {};

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Appointments" value={stats.total_appointments} color="bg-blue-500" />
                <StatCard title="Pending" value={stats.pending_appointments} color="bg-yellow-500" />
                <StatCard title="Approved" value={stats.approved_appointments} color="bg-green-500" />
                <StatCard title="Today's" value={stats.today_appointments} color="bg-purple-500" />
            </div>
        </div>
    );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 border border-gray-100">
            <div className={\`w-12 h-12 rounded-full \${color} flex items-center justify-center text-white font-bold\`}>
                {value}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
`,
    'src/pages/Appointments.tsx': `import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export default function Appointments() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['appointments', search, statusFilter],
        queryFn: async () => {
            const res = await api.get('/appointments', {
                params: { search, status: statusFilter }
            });
            return res.data.data; // Assuming paginated structure { data: [...] } from Laravel Resource
        }
    });

    const updateStatusMut = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: string }) => {
            await api.patch(\`/appointments/\${id}\`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    });

    const deleteMut = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(\`/appointments/\${id}\`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-bold text-gray-800">Appointments</h2>
                
                <div className="flex space-x-4">
                    <input 
                        type="text" 
                        placeholder="Search name, email..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-10 text-gray-500">Loading appointments...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Date & Time</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.data?.length > 0 ? (
                                data.data.map((apt: any) => (
                                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                                        <td className="p-4">
                                            <p className="font-medium text-gray-900">{apt.name}</p>
                                            <p className="text-gray-500">{apt.email}</p>
                                            <p className="text-gray-500">{apt.phone}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-gray-900">{apt.appointment_date}</p>
                                            <p className="text-gray-500">{apt.appointment_time}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={\`px-2 py-1 rounded-full text-xs font-medium \${
                                                apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }\`}>
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-2">
                                            {apt.status === 'pending' && (
                                                <>
                                                    <button onClick={() => updateStatusMut.mutate({ id: apt.id, status: 'approved' })} className="text-green-600 hover:text-green-800">Approve</button>
                                                    <button onClick={() => updateStatusMut.mutate({ id: apt.id, status: 'rejected' })} className="text-red-600 hover:text-red-800">Reject</button>
                                                </>
                                            )}
                                            <button onClick={() => { if(confirm('Are you sure?')) deleteMut.mutate(apt.id); }} className="text-gray-500 hover:text-gray-700">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-4 text-center text-gray-500">No appointments found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
`,
    'src/pages/Settings.tsx': `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useEffect } from 'react';

export default function Settings() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: async () => {
            const res = await api.get('/settings');
            return res.data.data;
        }
    });

    const { register, handleSubmit, reset } = useForm();

    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data, reset]);

    const mutation = useMutation({
        mutationFn: async (formData: any) => {
            const res = await api.put('/settings', formData);
            return res.data;
        },
        onSuccess: () => {
            alert('Settings updated successfully');
            queryClient.invalidateQueries({ queryKey: ['adminSettings'] });
        }
    });

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-3xl">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Business Settings</h2>
            
            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input {...register('business_name')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input {...register('email')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input {...register('phone')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input {...register('address')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opening Time (HH:mm)</label>
                        <input type="time" {...register('opening_time')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Closing Time (HH:mm)</label>
                        <input type="time" {...register('closing_time')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                </div>

                <div className="pt-4 border-t">
                    <button type="submit" disabled={mutation.isPending} className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">
                        {mutation.isPending ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    const fullPath = path.join(__dirname, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}
console.log("Frontend generated successfully");
