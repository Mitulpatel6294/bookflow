import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useState } from 'react';

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
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    // Fetch Settings
    const { data, isLoading } = useQuery({
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
        closing_time: '17:00',
        working_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
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
            setMessage({ type: 'success', text: 'Appointment booked successfully!' });
            reset();
            setTimeout(() => setMessage(null), 5000);
        },
        onError: () => {
            setMessage({ type: 'error', text: 'Failed to book appointment. Please try again.' });
            setTimeout(() => setMessage(null), 5000);
        }
    });

    if (isLoading) return <div className="p-8 text-center min-h-screen flex items-center justify-center text-gray-500">Loading business details...</div>;

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-primary-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Welcome to {settings.business_name}</h1>
                    <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
                        Book your appointment easily online. We are open {settings.working_days?.length ? `${settings.working_days[0]} to ${settings.working_days[settings.working_days.length - 1]}` : 'everyday'} from {settings.opening_time} to {settings.closing_time}.
                    </p>
                </div>
            </section>

            {/* Content Area */}
            <section className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Details</h2>
                    <div className="space-y-4 text-gray-600">
                        <p><strong>Email:</strong> {settings.email}</p>
                        <p><strong>Phone:</strong> {settings.phone}</p>
                        <p><strong>Address:</strong> {settings.address}</p>
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-800 mb-2">Opening Hours</h3>
                            <p>{settings.opening_time} - {settings.closing_time}</p>
                            <p className="text-sm mt-1 text-gray-500">
                                Working Days: {settings.working_days?.join(', ') || 'Monday - Friday'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Booking Form */}
                <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
                    
                    {message && (
                        <div className={`p-4 rounded-md mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input {...register('name')} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" {...register('email')} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-primary-500 focus:border-primary-500" />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" {...register('phone')} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-primary-500 focus:border-primary-500" />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" {...register('appointment_date')} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-primary-500 focus:border-primary-500" />
                                {errors.appointment_date && <p className="text-red-500 text-sm mt-1">{errors.appointment_date.message}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <input type="time" {...register('appointment_time')} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-primary-500 focus:border-primary-500" />
                                {errors.appointment_time && <p className="text-red-500 text-sm mt-1">{errors.appointment_time.message}</p>}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                            <textarea {...register('message')} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
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
