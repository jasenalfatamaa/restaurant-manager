import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { CreditCard, Banknote, Search, Check, AlertCircle, Smartphone, X, Loader2, Calendar, ChevronDown } from 'lucide-react';

const POS: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<'TODAY' | 'HISTORY'>('TODAY');
    const [historyDate, setHistoryDate] = useState<string>(() => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    });

    const [highlightId, setHighlightId] = useState<string | null>(null);

    // State for Confirmation Popup
    const [paymentConfirmation, setPaymentConfirmation] = useState<{
        orderId: string;
        method: 'CASH' | 'CARD';
        total: number;
    } | null>(null);

    const fetchOrders = async () => {
        const data = await ApiService.getOrders();
        setOrders(data);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Background polling fallback

        // REAL-TIME SYNC: Listen for storage changes from other tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'restaurant_app_orders' || e.key === 'restaurant_app_tables') {
                fetchOrders();
            }
        };
        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const initiatePayment = (orderId: string, method: 'CASH' | 'CARD', total: number) => {
        setPaymentConfirmation({ orderId, method, total });
    };

    const confirmPayment = async () => {
        if (!paymentConfirmation) return;

        await ApiService.updateOrderStatus(
            paymentConfirmation.orderId,
            OrderStatus.PAID,
            paymentConfirmation.method
        );

        setHighlightId(paymentConfirmation.orderId);
        setPaymentConfirmation(null);
        fetchOrders();
        setTimeout(() => setHighlightId(null), 2000);
    };

    // --- Filtering Logic ---

    const getFilteredOrders = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let viewOrders: Order[] = [];

        if (activeTab === 'TODAY') {
            // Show ALL orders from TODAY (Pending, Paid, Served, etc.)
            viewOrders = orders.filter(o => {
                const orderDate = new Date(o.timestamp);
                orderDate.setHours(0, 0, 0, 0);
                return orderDate.getTime() === today.getTime();
            });
        } else {
            // HISTORY: Show orders from SELECTED DATE (Not Today) that are completed (Paid/Served)
            if (!historyDate) return [];
            const selectedDate = new Date(historyDate);
            selectedDate.setHours(0, 0, 0, 0);

            viewOrders = orders.filter(o => {
                const orderDate = new Date(o.timestamp);
                orderDate.setHours(0, 0, 0, 0);

                const isDateMatch = orderDate.getTime() === selectedDate.getTime();
                const isCompleted = o.status === OrderStatus.PAID || o.status === OrderStatus.SERVED;
                const isNotToday = orderDate.getTime() !== today.getTime();

                return isDateMatch && isCompleted && isNotToday;
            });
        }

        // Apply Search Filter
        if (search) {
            return viewOrders.filter(o =>
                o.id.toLowerCase().includes(search.toLowerCase()) ||
                o.tableId.toString().includes(search)
            );
        }
        return viewOrders;
    };

    const filteredOrders = getFilteredOrders();

    return (
        <div className="relative pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="font-serif text-3xl font-bold text-charcoal">Cashier Station</h2>
                    <p className="text-stone-500">Manage payments and confirm customer orders.</p>
                </div>

                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            className="w-full pl-10 pr-4 py-2 bg-white text-charcoal rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-forest/20 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-stone-200 mb-6">
                <button
                    onClick={() => setActiveTab('TODAY')}
                    className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'TODAY' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Active Orders (Today)
                </button>
                <button
                    onClick={() => setActiveTab('HISTORY')}
                    className={`pb-3 px-4 font-bold text-sm transition-colors ${activeTab === 'HISTORY' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
                >
                    Order History
                </button>
            </div>

            {/* Date Picker for History */}
            {activeTab === 'HISTORY' && (
                <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex items-center gap-4 shadow-sm">
                    <div className="flex flex-col">
                        <label className="text-xs font-bold text-stone-500 uppercase mb-1">Select Date</label>
                        <div className="relative w-full md:w-auto bg-white border border-stone-200 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest">
                            <input
                                type="date"
                                className="w-full pl-10 pr-10 py-2 bg-transparent text-charcoal outline-none rounded-lg cursor-pointer relative z-10"
                                value={historyDate}
                                onChange={(e) => setHistoryDate(e.target.value)}
                                max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]} // Max yesterday
                            />
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                        </div>
                    </div>
                    <div className="h-10 border-l border-stone-200 mx-2"></div>
                    <p className="text-sm text-stone-500">
                        Showing completed orders for <span className="font-bold text-charcoal">{new Date(historyDate).toLocaleDateString()}</span>
                    </p>
                </div>
            )}

            {/* Order List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                        <p className="text-stone-400 font-medium">
                            {activeTab === 'TODAY' ? 'No active orders for today.' : 'No history found for this date.'}
                        </p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className={`
                bg-white p-6 rounded-xl border flex flex-col md:flex-row justify-between items-center transition-all duration-500
                ${order.status === OrderStatus.PAID || order.status === OrderStatus.SERVED ? 'opacity-80' : 'shadow-md shadow-stone-200'}
                ${highlightId === order.id ? 'ring-2 ring-green-500 bg-green-50' : 'border-stone-100'}
                ${order.status !== OrderStatus.PAID && order.status !== OrderStatus.SERVED && order.paymentMethod ? 'border-l-8 border-l-terracotta' : ''}
                `}
                        >
                            {/* Order Info */}
                            <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                                <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${order.status === OrderStatus.PAID || order.status === OrderStatus.SERVED ? 'bg-stone-200 text-stone-500' : 'bg-charcoal text-beige'}`}>
                                    <span className="text-xs uppercase">Table</span>
                                    <span className="text-2xl font-bold">{order.tableId}</span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg text-charcoal">{order.id}</h4>
                                        {order.status !== OrderStatus.PAID && order.status !== OrderStatus.SERVED && order.paymentMethod && (
                                            <span className="text-[10px] bg-terracotta text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                                                ACTION NEEDED
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-stone-500">
                                        {order.items.length} items • {new Date(order.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div className="mt-1 font-serif text-xl font-bold text-forest">
                                        Rp {order.total.toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full md:w-auto justify-end">
                                {['PAID', 'PREPARING', 'READY', 'SERVED'].includes(order.status) ? (
                                    <div className="flex items-center gap-2 text-green-700 font-bold px-6 py-3 bg-green-100 rounded-lg w-full md:w-auto justify-center">
                                        <Check size={20} /> PAID ({order.paymentMethod})
                                    </div>
                                ) : (
                                    // Logic for Pending Orders
                                    order.paymentMethod === 'QRIS' ? (
                                        <div className="flex items-center gap-4 bg-blue-50 p-2 pr-4 rounded-xl border border-blue-100 w-full md:w-auto">
                                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg text-blue-600">
                                                <Loader2 size={24} className="animate-spin" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-blue-800 font-bold uppercase">System Verification</div>
                                                <div className="text-sm text-charcoal">Waiting for QRIS...</div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Manual Payment Buttons
                                        <>
                                            <button
                                                onClick={() => initiatePayment(order.id, 'CASH', order.total)}
                                                className="flex-1 md:flex-none flex flex-col items-center justify-center p-3 w-24 rounded-lg border-2 border-stone-200 hover:border-forest hover:bg-forest/5 text-stone-600 hover:text-forest transition-all"
                                            >
                                                <Banknote size={20} className="mb-1" />
                                                <span className="text-[10px] font-bold">CASH</span>
                                            </button>
                                            <button
                                                onClick={() => initiatePayment(order.id, 'CARD', order.total)}
                                                className="flex-1 md:flex-none flex flex-col items-center justify-center p-3 w-24 rounded-lg border-2 border-stone-200 hover:border-terracotta hover:bg-terracotta/5 text-stone-600 hover:text-terracotta transition-all"
                                            >
                                                <CreditCard size={20} className="mb-1" />
                                                <span className="text-[10px] font-bold">CARD</span>
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* CONFIRMATION POPUP */}
            {paymentConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setPaymentConfirmation(null)}
                    />
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setPaymentConfirmation(null)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 
                        ${paymentConfirmation.method === 'CASH' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {paymentConfirmation.method === 'CASH' ? <Banknote size={32} /> : <CreditCard size={32} />}
                            </div>

                            <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">
                                Confirm {paymentConfirmation.method === 'CASH' ? 'Cash' : 'Card'} Payment?
                            </h3>

                            <p className="text-stone-500 mb-6 text-sm">
                                Total Amount: <span className="font-bold text-charcoal text-lg">Rp {paymentConfirmation.total.toLocaleString('id-ID')}</span>
                            </p>

                            <div className="bg-stone-50 p-3 rounded-lg border border-stone-200 text-left text-xs text-stone-500 w-full mb-6">
                                <div className="flex gap-2">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    <p>
                                        {paymentConfirmation.method === 'CASH'
                                            ? "Pastikan uang tunai sudah diterima dan jumlahnya sesuai."
                                            : "Pastikan transaksi di mesin EDC sudah BERHASIL (Approved)."
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setPaymentConfirmation(null)}
                                    className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmPayment}
                                    className="flex-1 py-3 bg-forest text-beige rounded-xl font-bold hover:bg-forest/90 shadow-lg"
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;