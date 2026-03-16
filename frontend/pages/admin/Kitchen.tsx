import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { Clock, RefreshCcw, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';

const Kitchen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [historyDate, setHistoryDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  const fetchOrders = async () => {
    const allOrders = await ApiService.getOrders();
    setOrders(allOrders);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    await ApiService.updateOrderStatus(id, newStatus);
    fetchOrders();
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PAID: return 'text-purple-600 font-bold'; // New Status for Kitchen
      case OrderStatus.PREPARING: return 'text-orange-500 font-bold';
      case OrderStatus.READY: return 'text-forest font-bold';
      case OrderStatus.SERVED: return 'text-stone-500 font-bold line-through';
      default: return 'text-stone-500';
    }
  };

  const getFilteredOrders = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let viewOrders: Order[] = [];

    if (activeTab === 'ACTIVE') {
      // ACTIVE: Show orders from TODAY.
      // Include PAID, PREPARING, READY, AND SERVED (if today).
      viewOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        orderDate.setHours(0, 0, 0, 0);
        const isToday = orderDate.getTime() === today.getTime();

        // Keep all status active for kitchen display if it is today
        return isToday;
      });

      // Sort: Active items top, Served items bottom.
      // Within each group, keep chronological order based on timestamp.
      viewOrders.sort((a, b) => {
        if (a.status === OrderStatus.SERVED && b.status !== OrderStatus.SERVED) return 1;
        if (a.status !== OrderStatus.SERVED && b.status === OrderStatus.SERVED) return -1;
        // Secondary Sort: Use existing timestamp logic (Newest First based on how mock data is returned, or a-b for Oldest First)
        // Mock data returns newest first (b-a). 
        // To keep "berurutan sesuai order time", we usually want Oldest First (FIFO) for kitchen, or Newest First. 
        // We'll respect the input order or simple timestamp diff.
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

    } else {
      // HISTORY: Show orders from SELECTED DATE (Not Today) that are SERVED (or all for that day)
      if (!historyDate) return [];
      const selectedDate = new Date(historyDate);
      selectedDate.setHours(0, 0, 0, 0);

      viewOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        orderDate.setHours(0, 0, 0, 0);

        const isDateMatch = orderDate.getTime() === selectedDate.getTime();
        // For history tab, we mainly care about completed/served work from previous days
        const isCompleted = o.status === OrderStatus.SERVED;

        return isDateMatch && isCompleted;
      });
    }
    return viewOrders;
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="h-full flex flex-col pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">Kitchen Display</h2>
          <p className="text-stone-500">Manage order preparation.</p>
        </div>
        <button onClick={fetchOrders} className="p-2 bg-white rounded-full shadow hover:rotate-180 transition-transform">
          <RefreshCcw size={20} className="text-forest" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-stone-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'ACTIVE' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
        >
          Active Orders (Today)
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 px-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'HISTORY' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
        >
          Kitchen History
        </button>
      </div>

      {/* Date Picker for History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white p-4 rounded-xl border border-stone-200 mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="flex flex-col w-full md:w-auto">
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
          <div className="hidden md:block h-10 border-l border-stone-200 mx-2"></div>
          <p className="text-sm text-stone-500">
            Showing served orders for <span className="font-bold text-charcoal">{new Date(historyDate).toLocaleDateString()}</span>
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex-1 flex flex-col">
        {/* Header Row - Hidden on Mobile */}
        <div className="hidden md:grid grid-cols-12 bg-stone-50 p-4 border-b border-stone-200 font-bold text-stone-500 text-sm uppercase tracking-wider shrink-0">
          <div className="col-span-2">Order Time</div>
          <div className="col-span-1">Table</div>
          <div className="col-span-5">Items</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Order Rows */}
        <div className="overflow-y-auto flex-1 divide-y divide-stone-100">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-400 italic">
              {activeTab === 'ACTIVE' ? 'No active orders' : 'No history found for this date'}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className={`flex flex-col md:grid md:grid-cols-12 p-4 items-start transition-colors gap-3 md:gap-0 ${order.status === OrderStatus.SERVED ? 'bg-stone-50/50' : 'hover:bg-stone-50'}`}>

                {/* Mobile Header: Time & Table */}
                <div className="flex md:hidden w-full justify-between items-center border-b border-stone-100 pb-2 mb-1">
                  <div className="flex items-center gap-2 text-stone-600 font-bold text-sm">
                    <Clock size={16} />
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <span className="bg-charcoal text-white px-3 py-1 rounded font-bold text-sm">
                    #{order.tableId}
                  </span>
                </div>

                {/* Desktop Time */}
                <div className="hidden md:flex col-span-2 items-center gap-2 text-stone-600">
                  <Clock size={16} />
                  <span>
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block col-span-1">
                  <span className="bg-charcoal text-white px-3 py-1 rounded font-bold text-sm">
                    #{order.tableId}
                  </span>
                </div>

                {/* Items */}
                <div className="w-full md:col-span-5 md:pr-4">
                  <ul className="space-y-1">
                    {order.items.map((item, idx) => (
                      <li key={idx} className={`text-charcoal font-medium text-sm flex flex-col ${order.status === OrderStatus.SERVED ? 'opacity-50' : ''}`}>
                        <div className="flex items-start">
                          <span className="font-bold text-forest mr-2 shrink-0">{item.quantity}x</span>
                          <span>{item.name}</span>
                        </div>
                        {/* Modifiers */}
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="pl-6 text-xs text-stone-500 space-y-0.5 mt-1">
                            {item.selectedModifiers.map((mod, mIdx) => (
                              <div key={mIdx}>+ {mod.name}</div>
                            ))}
                          </div>
                        )}
                        {/* Notes */}
                        {item.notes && (
                          <div className="pl-6 text-xs text-terracotta italic mt-1 bg-yellow-50 p-1 rounded inline-block">
                            "{item.notes}"
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div data-testid="order-id" className="text-[10px] text-stone-400 font-mono mt-1">
                    {order.id}
                  </div>
                  {order.customerName && <p className="text-xs text-stone-400 mt-2">Note: Guest {order.customerName}</p>}
                </div>

                {/* Status & Action Mobile Wrapper */}
                <div className="flex justify-between items-center w-full md:hidden pt-2 border-t border-stone-100 mt-1">
                  <div className={`uppercase text-sm tracking-wide ${getStatusColor(order.status)}`}>
                    {order.status === OrderStatus.PAID ? 'NEW ORDER' : order.status}
                  </div>
                  {/* Mobile Action Buttons */}
                  {order.status === OrderStatus.PAID && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.PREPARING)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold animate-pulse"
                    >
                      START COOK
                    </button>
                  )}
                  {order.status === OrderStatus.PREPARING && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.READY)}
                      className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold"
                    >
                      MARK READY
                    </button>
                  )}
                  {order.status === OrderStatus.READY && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.SERVED)}
                      className="px-4 py-2 bg-forest text-white rounded-lg text-xs font-bold"
                    >
                      SERVE
                    </button>
                  )}
                </div>

                {/* Desktop Status */}
                <div className={`hidden md:block col-span-2 uppercase text-sm tracking-wide ${getStatusColor(order.status)}`}>
                  {order.status === OrderStatus.PAID ? 'NEW ORDER' : order.status}
                </div>

                {/* Desktop Action */}
                <div className="hidden md:block col-span-2 text-right">
                  {order.status === OrderStatus.PAID && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.PREPARING)}
                      className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold hover:bg-purple-200 animate-pulse"
                    >
                      START COOK
                    </button>
                  )}
                  {order.status === OrderStatus.PREPARING && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.READY)}
                      className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-200"
                    >
                      READY
                    </button>
                  )}
                  {order.status === OrderStatus.READY && (
                    <button
                      onClick={() => updateStatus(order.id, OrderStatus.SERVED)}
                      className="px-4 py-2 bg-forest text-white rounded-lg text-xs font-bold hover:bg-forest/90"
                    >
                      SERVE
                    </button>
                  )}
                  {order.status === OrderStatus.SERVED && (
                    <span className="text-xs text-stone-400 flex items-center justify-end gap-1">
                      <CheckCircle2 size={14} /> Served
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Kitchen;