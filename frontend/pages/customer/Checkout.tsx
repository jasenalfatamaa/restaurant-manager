import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, QrCode, CheckCircle2, Loader2, AlertCircle, X, Trash2, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { ApiService } from '../../services/api';
import { Order, OrderStatus } from '../../types';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateItemQuantity, total, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QRIS' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for flow control
  const [showQRModal, setShowQRModal] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  // REAL-TIME SYNC: Listen for PAID status from Cashier Tab
  useEffect(() => {
    if (!submittedOrder || isPaid) return;

    const checkPaidStatus = async () => {
      const order = await ApiService.getOrder(submittedOrder.id);
      if (order && order.status !== OrderStatus.PENDING) {
        setIsPaid(true);
        setShowQRModal(false); // Close QR modal if open
        clearCart();
      }
    };

    // Listen for storage events (Cashier marking as PAID)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'restaurant_orders') {
        checkPaidStatus();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Also poll as fallback
    const interval = setInterval(checkPaidStatus, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [submittedOrder, isPaid, clearCart]);

  const handleSubmitOrder = async () => {
    if (!paymentMethod) return;
    setIsSubmitting(true);

    // Get Persisted Table ID
    const tableIdStr = localStorage.getItem('restaurant_table_id') || '1';
    const tableId = parseInt(tableIdStr);

    // Create the order with PENDING status
    const newOrder: Order = await ApiService.submitOrder({
      tableId: tableId,
      items: cart,
      total: total,
      customerName: "Guest",
      paymentMethod
    });

    setSubmittedOrder(newOrder);
    setIsSubmitting(false);

    // If QRIS, show modal. If CASH, go straight to pending screen logic
    if (paymentMethod === 'QRIS') {
      setShowQRModal(true);
    }
  };

  // DEMO ONLY: Auto-PAID for QRIS after 5 seconds
  useEffect(() => {
    if (showQRModal && submittedOrder && paymentMethod === 'QRIS') {
      const timer = setTimeout(async () => {
        await ApiService.updateOrderStatus(submittedOrder.id, OrderStatus.PAID, 'QRIS');
        // This will be caught by the storage listener above or polling
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showQRModal, submittedOrder, paymentMethod]);

  const handleQRScanComplete = async () => {
    if (submittedOrder) {
      // Manual "Already Paid" button also triggers PAID for better demo feel
      await ApiService.updateOrderStatus(submittedOrder.id, OrderStatus.PAID, 'QRIS');
    }
    setShowQRModal(false);
  };

  // Helper to get current table ID for display
  const currentTableId = localStorage.getItem('restaurant_table_id') || '1';

  // 1. Success Screen (Order PAID and Confirmed)
  if (isPaid) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-stone-200"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest mb-3">Order Confirmed!</h2>
          <p className="text-stone-600 mb-6 font-light">
            Terima kasih! Pembayaran berhasil diverifikasi. Pesanan Anda sedang disiapkan di dapur.
          </p>
          <div className="bg-stone-50 p-4 rounded-lg mb-6 border border-stone-100">
            <p className="text-xs text-stone-400 uppercase tracking-widest">Order ID</p>
            <p className="text-xl font-bold text-charcoal">{submittedOrder?.id}</p>
          </div>
          <button
            onClick={() => navigate('/order-status')}
            className="w-full py-3 bg-forest text-beige rounded-xl font-bold hover:bg-forest/90 transition"
          >
            Track My Order Status
          </button>
        </motion.div>
      </div>
    );
  }

  // 2. Waiting for Payment / Admin Confirmation Screen
  if (submittedOrder && !isPaid && !showQRModal) {
    return (
      <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-stone-200"
        >
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Loader2 size={32} className="animate-spin" />
          </div>

          <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Menunggu Pembayaran</h2>
          <p className="text-stone-500 mb-6 text-sm">
            Order ID: <span className="font-bold">{submittedOrder.id}</span>
          </p>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-6 text-left">
            <div className="flex gap-3 items-start">
              <AlertCircle className="text-terracotta shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-charcoal text-sm">Langkah Selanjutnya:</p>
                <p className="text-sm text-stone-600 mt-1 leading-relaxed">
                  {paymentMethod === 'CASH'
                    ? "Silakan menuju kasir untuk melakukan pembayaran tunai. Pesanan akan diproses setelah pembayaran dikonfirmasi."
                    : "Kami sedang memverifikasi pembayaran QRIS Anda. Mohon tunggu sebentar..."
                  }
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-stone-400 italic mb-6">Halaman ini akan otomatis terupdate setelah pembayaran dikonfirmasi.</p>

          <button
            onClick={() => navigate('/order-status')}
            className="text-forest font-bold text-sm underline"
          >
            Still want to track status while waiting?
          </button>
        </motion.div>
      </div>
    );
  }

  // 3. Main Checkout Form
  return (
    <div className="min-h-screen bg-beige flex flex-col">
      <header className="bg-forest text-beige px-6 py-4 shadow-lg shadow-stone-400/20 rounded-b-2xl mb-6">
        <div className="flex items-center gap-4 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full">
            <ArrowLeft />
          </button>
          <h1 className="font-serif text-xl font-bold">Ringkasan Pesanan</h1>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 w-full max-w-lg mx-auto">
        {/* Receipt Style Card */}
        <div className="bg-white p-6 rounded-t-xl shadow-sm border-x border-t border-stone-200 relative mb-1">
          <div className="text-center border-b border-dashed border-stone-300 pb-4 mb-4">
            <h3 className="font-serif text-2xl font-bold text-charcoal">Rustic Roots</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-xs text-stone-400 uppercase tracking-widest">Table Session</span>
              <span className="bg-forest text-beige text-[10px] px-2 py-0.5 rounded-full font-bold">Table-{currentTableId}</span>
            </div>
          </div>

          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                <div className="flex gap-3">
                  <div className="bg-stone-100 w-8 h-8 flex items-center justify-center rounded text-xs font-bold text-stone-600 shrink-0">
                    {item.quantity}x
                  </div>
                  <div>
                    <span className="text-charcoal font-medium block">{item.name}</span>
                    {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                      <div className="text-[10px] text-stone-500 mt-1 leading-tight">
                        {item.selectedModifiers.map(m => m.name).join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-stone-600 font-bold">{(item.finalPrice * item.quantity).toLocaleString('id-ID')}</span>

                  <div className="flex items-center gap-2">
                    {/* Qty Controls */}
                    <div className="flex items-center bg-stone-50 rounded-lg border border-stone-200 h-8 shadow-sm">
                      <button
                        onClick={() => updateItemQuantity(item.cartItemId, -1)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-forest disabled:opacity-30 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateItemQuantity(item.cartItemId, 1)}
                        className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-forest transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Trash Button */}
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 text-terracotta rounded-lg hover:bg-red-100 transition-colors border border-red-100 shadow-sm"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && <p className="text-center text-stone-400 italic py-4">Cart is empty</p>}
          </div>

          <div className="border-t border-dashed border-stone-300 mt-6 pt-4 flex justify-between items-center font-bold text-lg text-forest">
            <span>Total</span>
            <span>Rp {total.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Jagged Edge Effect */}
        <div
          className="h-4 w-full bg-white bg-repeat-x mb-8"
          style={{
            backgroundImage: "linear-gradient(45deg, transparent 50%, #fff 50%), linear-gradient(-45deg, transparent 50%, #fff 50%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 100%"
          }}
        />

        {/* Payment Methods */}
        <h3 className="font-serif text-lg font-bold text-charcoal mb-4 px-2">Metode Pembayaran</h3>
        <div className="space-y-3 px-2">
          {[
            { id: 'CASH', label: 'Bayar di Kasir', icon: <Banknote size={20} />, desc: 'Bayar tunai di meja kasir' },
            { id: 'QRIS', label: 'QRIS', icon: <QrCode size={20} />, desc: 'Scan QR Code sekarang' },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id as any)}
              className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all duration-200 text-left
                ${paymentMethod === method.id
                  ? 'border-forest bg-forest/5 shadow-md scale-[1.02]'
                  : 'border-white bg-white hover:border-stone-200'}
              `}
            >
              <div className={`p-2 rounded-lg ${paymentMethod === method.id ? 'bg-forest text-beige' : 'bg-stone-100 text-stone-500'}`}>
                {method.icon}
              </div>
              <div>
                <div className="font-bold text-charcoal">{method.label}</div>
                <div className="text-xs text-stone-500">{method.desc}</div>
              </div>
              {paymentMethod === method.id && <div className="ml-auto w-3 h-3 rounded-full bg-forest" />}
            </button>
          ))}
        </div>

        <button
          disabled={!paymentMethod || cart.length === 0 || isSubmitting}
          onClick={handleSubmitOrder}
          className={`
            w-full mt-8 py-4 rounded-xl font-bold text-lg tracking-wide shadow-xl transition-all
            ${!paymentMethod || cart.length === 0
              ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
              : 'bg-terracotta text-white hover:bg-terracotta/90 hover:scale-[1.02]'}
          `}
        >
          {isSubmitting ? 'Memproses...' : 'PROCEED TO PAYMENT'}
        </button>
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowQRModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 text-center"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>

              <h3 className="font-serif text-2xl font-bold text-forest mb-2">Scan to Pay</h3>
              <p className="text-stone-500 mb-6">Total: <span className="font-bold text-charcoal">Rp {total.toLocaleString('id-ID')}</span></p>

              <div className="bg-white p-2 border-2 border-forest rounded-xl inline-block mb-6 shadow-inner">
                {/* Mock QR using API */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PAY-ORDER-${submittedOrder?.id}&color=2D6A4F`}
                  alt="QRIS"
                  className="w-48 h-48"
                />
              </div>

              <div className="text-xs text-stone-400 mb-6 flex justify-center items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/1200px-Logo_QRIS.svg.png" className="h-4" alt="QRIS" />
                <span>Supported by All E-Wallets</span>
              </div>

              <button
                onClick={handleQRScanComplete}
                className="w-full py-3 bg-forest text-beige rounded-xl font-bold hover:bg-forest/90"
              >
                Saya Sudah Bayar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;