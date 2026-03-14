import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Plus, Minus, X, Check, Search, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApiService } from '../../services/api';
import { Product, Modifier } from '../../types';
import { useCart } from '../../context/CartContext';

const Menu: React.FC = () => {
  const navigate = useNavigate();
  const { cart, addToCart, removeLastInstance, addLastInstance, updateCartItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSession, setHasSession] = useState(false);

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Modifier[]>([]);
  const [modalNotes, setModalNotes] = useState("");
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);



  useEffect(() => {
    const checkSession = async () => {
      const tableId = localStorage.getItem('restaurant_table_id') || '1';
      const sessionOrders = await ApiService.getCustomerOrders(tableId);
      setHasSession(sessionOrders.length > 0);
    };

    const loadData = async () => {
      const data = await ApiService.getProducts();
      setProducts(data);
      const cats = Array.from(new Set(data.map(p => p.category)));
      setCategories(["All", ...cats]);
      checkSession();
    };
    loadData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'restaurant_app_orders' || e.key?.startsWith('table_session_')) {
        checkSession();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Updated Filter Logic: Category + Search
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to get quantity of specific product in cart
  const getProductQtyInCart = (productId: number) => {
    return cart.filter(item => item.id === productId).reduce((acc, item) => acc + item.quantity, 0);
  };

  // Modal Logic
  const openModal = (product: Product) => {
    setSelectedProduct(product);

    // Check if product is already in cart
    const existingItems = cart.filter(item => item.id === product.id);
    if (existingItems.length > 0) {
      // Edit the LAST added instance
      const lastItem = existingItems[existingItems.length - 1];
      setSelectedModifiers(lastItem.selectedModifiers);
      setModalQuantity(lastItem.quantity);
      setModalNotes(lastItem.notes || "");
      setEditingCartItemId(lastItem.cartItemId);
    } else {
      // New Item
      setModalQuantity(1);
      setSelectedModifiers([]);
      setModalNotes("");
      setEditingCartItemId(null);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const toggleModifier = (groupMax: number, modifier: Modifier) => {
    if (groupMax === 1) {
      // Radio behavior
      const group = selectedProduct?.modifierGroups?.find(g => g.options.some(o => o.id === modifier.id));
      if (group) {
        const otherOptionIds = group.options.map(o => o.id);
        const withoutOthers = selectedModifiers.filter(m => !otherOptionIds.includes(m.id));
        setSelectedModifiers([...withoutOthers, modifier]);
      }
    } else {
      // Checkbox behavior
      const exists = selectedModifiers.find(m => m.id === modifier.id);
      if (exists) {
        setSelectedModifiers(selectedModifiers.filter(m => m.id !== modifier.id));
      } else {
        setSelectedModifiers([...selectedModifiers, modifier]);
      }
    }
  };

  const handleAddToCartFromModal = () => {
    if (selectedProduct) {
      if (editingCartItemId) {
        updateCartItem(editingCartItemId, selectedModifiers, modalQuantity, modalNotes);
      } else {
        addToCart(selectedProduct, modalQuantity, selectedModifiers, modalNotes);
      }
      closeModal();
    }
  };

  const handleAddAnotherVariant = () => {
    setEditingCartItemId(null);
    setSelectedModifiers([]);
    setModalQuantity(1);
    setModalNotes("");
  };

  const isSelectionValid = () => {
    if (!selectedProduct?.modifierGroups) return true;
    return selectedProduct.modifierGroups.every(group => {
      if (group.minSelection === 0) return true;
      const count = selectedModifiers.filter(m => group.options.some(o => o.id === m.id)).length;
      return count >= group.minSelection;
    });
  };

  const currentPrice = selectedProduct
    ? (selectedProduct.price + selectedModifiers.reduce((acc, m) => acc + m.price, 0)) * modalQuantity
    : 0;

  return (
    <div className="min-h-screen bg-beige flex flex-col mb-0">

      {/* WRAPPER FOR STICKY HEADER & SEARCH BAR */}
      <div className="sticky top-0 z-40 bg-beige">

        {/* Header */}
        <header className="bg-forest text-beige px-6 py-4 shadow-lg shadow-stone-400/20 rounded-b-2xl relative z-20">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <ChevronLeft />
              <h1 className="font-serif text-xl font-bold tracking-wide">Rustic Roots</h1>
            </div>
            <div className="flex items-center gap-3">
              {hasSession && (
                <button
                  onClick={() => navigate('/order-status')}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-beige"
                  title="Track My Order"
                >
                  <Clock size={24} />
                </button>
              )}
              <button
                onClick={() => navigate('/checkout')}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ShoppingBag size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-terracotta text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-forest">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Search Bar & Category Dropdown */}
        <div className="px-4 py-4 md:px-6 bg-beige/95 backdrop-blur-sm relative z-10">
          <div className="flex gap-3 max-w-7xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Cari menu favoritmu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-xl border border-stone-300 focus:border-forest focus:ring-1 focus:ring-forest outline-none bg-white text-charcoal shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-terracotta"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="relative shrink-0 w-1/3 md:w-48">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 rounded-xl border border-stone-300 bg-white text-forest font-bold shadow-sm focus:border-forest outline-none cursor-pointer truncate"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-forest">
                <Filter size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <main className="flex-1 px-4 md:px-6 pb-24 max-w-7xl mx-auto w-full pt-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <p className="font-serif text-xl italic mb-2">Oops!</p>
            <p>Menu tidak ditemukan.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredProducts.map((product) => {
                const qty = getProductQtyInCart(product.id);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id}
                    onClick={() => openModal(product)}
                    className="bg-white rounded-xl overflow-hidden shadow-sm shadow-stone-300 border border-stone-100 group flex flex-col h-full cursor-pointer"
                  >
                    <div
                      className="relative h-32 md:h-40 overflow-hidden cursor-pointer w-full"
                      onClick={() => openModal(product)}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    </div>

                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h3 className="font-serif text-sm md:text-base font-bold text-forest leading-tight line-clamp-2 mb-2">{product.name}</h3>
                      <p className="text-xs text-stone-500 line-clamp-2 mb-3">{product.description}</p>

                      <div className="mt-auto">
                        <div className="font-sans font-semibold text-terracotta text-sm mb-2 md:mb-3">
                          Rp {(product.price).toLocaleString('id-ID')}
                        </div>

                        {qty === 0 ? (
                          <button
                            onClick={() => openModal(product)}
                            className="w-full py-2 rounded-lg bg-beige border border-forest text-forest font-bold text-xs hover:bg-forest hover:text-beige transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus size={14} />
                            <span className="hidden md:inline">ADD TO ORDER</span>
                            <span className="md:hidden">ADD</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-forest rounded-lg p-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); removeLastInstance(product.id); }}
                              className="w-8 h-7 flex items-center justify-center bg-white/10 text-beige hover:bg-white/20 rounded"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="font-bold text-beige text-sm">{qty}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); addLastInstance(product); }}
                              className="w-8 h-7 flex items-center justify-center bg-white/10 text-beige hover:bg-white/20 rounded"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {(cartCount > 0 || hasSession) && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 px-6 z-50 flex flex-col gap-3 pointer-events-none"
          >
            {hasSession && (
              <button
                onClick={() => navigate('/order-status')}
                className="pointer-events-auto w-full max-w-md mx-auto bg-white border-2 border-forest text-forest shadow-xl rounded-xl p-3 flex justify-center items-center gap-2 font-bold text-sm hover:bg-stone-50 transition-colors"
              >
                <Clock size={16} />
                TRACK MY ORDER STATUS
              </button>
            )}

            {cartCount > 0 && (
              <button
                onClick={() => navigate('/checkout')}
                className="pointer-events-auto w-full max-w-md mx-auto bg-forest text-beige shadow-2xl shadow-forest/40 rounded-xl p-4 flex justify-between items-center hover:bg-forest/95 transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {cartCount}
                  </div>
                  <span className="font-serif font-semibold">View Order</span>
                </div>
                <span className="font-bold text-lg">Checkout &rarr;</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRODUCT DETAIL MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#F9F7F0] w-full max-w-lg md:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="h-48 md:h-56 relative shrink-0">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button onClick={closeModal} className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-md transition">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-serif text-2xl font-bold text-forest">{selectedProduct.name}</h2>
                  <div className="text-xl font-bold text-terracotta">Rp {selectedProduct.price.toLocaleString('id-ID')}</div>
                </div>
                <p className="text-stone-500 font-light mb-6 text-sm leading-relaxed">{selectedProduct.description}</p>

                {selectedProduct.modifierGroups?.map(group => (
                  <div key={group.id} className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-charcoal text-sm uppercase tracking-wide">{group.name}</h3>
                      <span className="text-xs bg-stone-200 text-stone-600 px-2 py-0.5 rounded">{group.maxSelection === 1 ? 'Select 1' : 'Optional'}</span>
                    </div>
                    <div className="space-y-2">
                      {group.options.map(option => {
                        const isSelected = selectedModifiers.some(m => m.id === option.id);
                        return (
                          <label key={option.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-forest bg-forest/5 shadow-sm' : 'border-stone-200 bg-white hover:bg-stone-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-forest bg-forest text-white' : 'border-stone-300'}`}>
                                {isSelected && <Check size={12} />}
                              </div>
                              <input type="checkbox" className="hidden" checked={isSelected} onChange={() => toggleModifier(group.maxSelection, option)} />
                              <span className={`text-sm ${isSelected ? 'font-bold text-forest' : 'text-stone-600'}`}>{option.name}</span>
                            </div>
                            {option.price > 0 && <span className="text-xs text-stone-400 font-medium">+{option.price.toLocaleString('id-ID')}</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Notes Input */}
                <div className="mb-6">
                  <h3 className="font-bold text-charcoal text-sm uppercase tracking-wide mb-2">Catatan (Optional)</h3>
                  <textarea
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="Contoh: Jangan terlalu pedas, saus dipisah..."
                    className="w-full p-3 rounded-lg border border-stone-200 bg-white text-charcoal text-sm focus:border-forest focus:ring-1 focus:ring-forest outline-none resize-none h-24"
                    maxLength={150}
                  />
                </div>
              </div>

              <div className="p-6 bg-white border-t border-stone-200 shrink-0 space-y-3">
                {editingCartItemId && (
                  <button
                    onClick={handleAddAnotherVariant}
                    className="w-full py-2 text-forest border border-forest rounded-xl font-bold text-sm hover:bg-forest/5 transition-colors"
                  >
                    + ADD ANOTHER VARIANT
                  </button>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center bg-stone-100 rounded-xl p-1">
                    <button onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-white rounded-lg shadow-sm transition"><Minus size={18} /></button>
                    <span className="w-10 text-center font-bold text-lg">{modalQuantity}</span>
                    <button onClick={() => setModalQuantity(modalQuantity + 1)} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-white rounded-lg shadow-sm transition"><Plus size={18} /></button>
                  </div>
                  <button
                    onClick={handleAddToCartFromModal}
                    disabled={!isSelectionValid()}
                    className={`flex-1 text-beige py-3.5 rounded-xl font-bold text-lg shadow-xl flex justify-center items-center px-6 transition-all
                      ${isSelectionValid() ? 'bg-forest shadow-forest/20 hover:bg-forest/90 hover:-translate-y-1' : 'bg-stone-300 shadow-none cursor-not-allowed'}
                    `}
                  >
                    <span>{editingCartItemId ? 'UPDATE ORDER' : 'ADD ORDER'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;