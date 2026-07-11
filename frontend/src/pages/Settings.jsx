import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
        mutationFn: async (formData) => {
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
