import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChefHat, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '../../services/api';
import { Order, OrderStatus as OrderStatusType } from '../../types';

const OrderStatus: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Get Table ID from Local Storage
    const tableId = localStorage.getItem('restaurant_table_id');

    const loadOrders = async () => {
        if (!tableId) {
            setIsLoading(false);
            return;
        }
        const data = await ApiService.getCustomerOrders(tableId);
        // Sort: Active orders first, then by date desc
        const sorted = data.sort((a, b) => {
            const isActiveA = a.status !== OrderStatusType.PAID && a.status !== OrderStatusType.SERVED;
            const isActiveB = b.status !== OrderStatusType.PAID && b.status !== OrderStatusType.SERVED;
            if (isActiveA === isActiveB) return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            return isActiveA ? -1 : 1;
        });
        setOrders(sorted);
        setIsLoading(false);
    };

    useEffect(() => {
        loadOrders();

        // REAL-TIME SYNC: Refresh when orders or tables are updated
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'restaurant_app_orders' || e.key?.startsWith('table_session_')) {
                loadOrders();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        // Fallback polling
        const interval = setInterval(loadOrders, 10000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [tableId]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-beige text-forest">Loading status...</div>;
    }

    return (
        <div className="min-h-screen bg-beige flex flex-col">
            <header className="bg-forest text-beige px-6 py-4 shadow-lg rounded-b-2xl sticky top-0 z-10">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <button onClick={() => navigate('/menu')} className="p-1 hover:bg-white/10 rounded-full">
                        <ArrowLeft />
                    </button>
                    <h1 className="font-serif text-xl font-bold">Status Pesanan</h1>
                </div>
            </header>

            <main className="flex-1 px-4 py-6 w-full max-w-lg mx-auto">
                {!tableId || orders.length === 0 ? (
                    <div className="text-center py-12 text-stone-500">
                        <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Belum ada pesanan aktif.</p>
                        <button
                            onClick={() => navigate('/menu')}
                            className="mt-4 text-forest font-bold underline"
                        >
                            Pesan Sekarang
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {orders.map((order) => (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-4 border-b border-dashed border-stone-200 pb-3">
                                        <div>
                                            <div className="font-bold text-charcoal">Order #{order.id}</div>
                                            <div className="text-xs text-stone-400">{new Date(order.timestamp).toLocaleTimeString()}</div>
                                        </div>
                                        <OrderStatusBadge status={order.status} />
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex flex-col text-sm border-b border-stone-100 pb-2 last:border-0">
                                                <div className="flex justify-between">
                                                    <div className="flex gap-2">
                                                        <span className="font-bold text-stone-600">{item.quantity}x</span>
                                                        <span className="text-charcoal font-medium">{item.name}</span>
                                                    </div>
                                                    <span className="text-stone-500">Rp {(item.finalPrice * item.quantity).toLocaleString('id-ID')}</span>
                                                </div>
                                                {/* Modifiers */}
                                                {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                                                    <div className="pl-7 text-xs text-stone-500 mt-1">
                                                        {item.selectedModifiers.map((mod, mIdx) => (
                                                            <span key={mIdx} className="block">+ {mod.name}</span>
                                                        ))}
                                                    </div>
                                                )}
                                                {/* Notes */}
                                                {item.notes && (
                                                    <div className="pl-7 text-xs text-terracotta italic mt-1">
                                                        Note: "{item.notes}"
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2 text-sm">
                                        <span className="text-stone-500">Total</span>
                                        <span className="font-bold text-forest text-lg">Rp {order.total.toLocaleString('id-ID')}</span>
                                    </div>

                                    {/* STATUS TRACKER */}
                                    <div className="mt-6 bg-stone-50 rounded-lg p-3 relative overflow-hidden">
                                        <div className="flex justify-between relative z-10">
                                            <StatusStep current={order.status} step={OrderStatusType.PENDING} label="Pending" icon={<Clock size={14} />} />
                                            <StatusStep current={order.status} step={OrderStatusType.PAID} label="Paid" icon={<CheckCircle2 size={14} />} />
                                            <StatusStep current={order.status} step={OrderStatusType.PREPARING} label="Cooking" icon={<ChefHat size={14} />} />
                                            <StatusStep current={order.status} step={OrderStatusType.SERVED} label="Served" icon={<CheckCircle2 size={14} />} />
                                        </div>
                                        {/* Progress Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
                                        <div
                                            className="absolute top-1/2 left-0 h-0.5 bg-forest -translate-y-1/2 z-0 transition-all duration-1000"
                                            style={{ width: getProgressWidth(order.status) }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
};

// Helper Components for Status UI
const OrderStatusBadge: React.FC<{ status: OrderStatusType }> = ({ status }) => {
    const styles = {
        [OrderStatusType.PENDING]: "bg-yellow-100 text-yellow-700",
        [OrderStatusType.PAID]: "bg-blue-100 text-blue-700",
        [OrderStatusType.PREPARING]: "bg-orange-100 text-orange-700 animate-pulse",
        [OrderStatusType.READY]: "bg-green-100 text-green-700",
        [OrderStatusType.SERVED]: "bg-stone-100 text-stone-500",
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-stone-100'}`}>
            {status}
        </span>
    );
};

const StatusStep: React.FC<{ current: OrderStatusType, step: OrderStatusType, label: string, icon: React.ReactNode }> = ({ current, step, label, icon }) => {
    const isCompleted = getStepWeight(current) >= getStepWeight(step);
    const isCurrent = current === step;

    return (
        <div className={`flex flex-col items-center gap-1 transition-colors ${isCompleted ? 'text-forest' : 'text-stone-300'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10 ${isCompleted ? 'border-forest bg-forest text-white' : 'border-stone-200'}`}>
                {icon}
            </div>
            <span className={`text-[10px] font-bold uppercase ${isCurrent ? 'text-forest' : 'text-stone-400'}`}>{label}</span>
        </div>
    );
};

const getStepWeight = (status: OrderStatusType) => {
    switch (status) {
        case OrderStatusType.PENDING: return 1;
        case OrderStatusType.PAID: return 2;
        case OrderStatusType.PREPARING: return 3;
        case OrderStatusType.READY: return 4;
        case OrderStatusType.SERVED: return 5;
        default: return 0;
    }
};

const getProgressWidth = (status: OrderStatusType) => {
    switch (status) {
        case OrderStatusType.PENDING: return '10%';
        case OrderStatusType.PAID: return '35%';
        case OrderStatusType.PREPARING: return '60%';
        case OrderStatusType.READY: return '85%';
        case OrderStatusType.SERVED: return '100%';
        default: return '0%';
    }
};

export default OrderStatus;
