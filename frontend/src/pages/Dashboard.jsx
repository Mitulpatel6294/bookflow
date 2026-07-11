import { useQuery } from '@tanstack/react-query';
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

function StatCard({ title, value, color }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4 border border-gray-100">
            <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold`}>
                {value}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
}
