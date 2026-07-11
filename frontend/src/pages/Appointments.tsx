import { useState } from 'react';
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
            await api.patch(`/appointments/${id}`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        }
    });

    const deleteMut = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/appointments/${id}`);
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                apt.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                apt.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
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
