import { Order, OrderStatus, Product, Table, ModifierGroup, DashboardStats, ChartDataPoint, TimeRange, ReportData, User, Category, Role, LocationConfig } from '../types';

// --- SHARED MODIFIER GROUPS ---

const COFFEE_MODIFIERS: ModifierGroup[] = [
  {
    id: 'sugar',
    name: 'Sugar Level',
    minSelection: 1,
    maxSelection: 1,
    options: [
      { id: 'sug-1', name: 'Normal Sugar', price: 0 },
      { id: 'sug-2', name: 'Less Sugar', price: 0 },
      { id: 'sug-3', name: 'No Sugar', price: 0 },
    ]
  },
  {
    id: 'milk',
    name: 'Milk Option',
    minSelection: 0,
    maxSelection: 1,
    options: [
      { id: 'milk-1', name: 'Oat Milk', price: 10000 },
      { id: 'milk-2', name: 'Almond Milk', price: 10000 },
      { id: 'milk-3', name: 'Soy Milk', price: 10000 },
    ]
  }
];

const FOOD_ADDONS: ModifierGroup[] = [
  {
    id: 'extra',
    name: 'Add-ons',
    minSelection: 0,
    maxSelection: 5,
    options: [
      { id: 'egg', name: 'Sunny Side Egg', price: 5000 },
      { id: 'cheese', name: 'Extra Cheese', price: 8000 },
      { id: 'bacon', name: 'Beef Bacon', price: 12000 },
    ]
  }
];

const SIDE_DISHES: ModifierGroup[] = [
  {
    id: 'side',
    name: 'Select Side',
    minSelection: 1,
    maxSelection: 1,
    options: [
      { id: 'side-1', name: 'Mashed Potato', price: 0 },
      { id: 'side-2', name: 'French Fries', price: 0 },
      { id: 'side-3', name: 'Fresh Salad', price: 0 },
      { id: 'side-4', name: 'Truffle Fries', price: 15000 },
    ]
  }
];

const STEAK_DONENESS: ModifierGroup[] = [
  {
    id: 'doneness',
    name: 'Doneness',
    minSelection: 1,
    maxSelection: 1,
    options: [
      { id: 'done-1', name: 'Medium Rare', price: 0 },
      { id: 'done-2', name: 'Medium', price: 0 },
      { id: 'done-3', name: 'Medium Well', price: 0 },
      { id: 'done-4', name: 'Well Done', price: 0 },
    ]
  }
];

// --- MOCK DATA ---

// --- LOCAL STORAGE HELPERS ---
const STORAGE_KEYS = {
  ORDERS: 'restaurant_app_orders',
  PRODUCTS: 'restaurant_app_products',
  TABLES: 'restaurant_app_tables',
  CATEGORIES: 'restaurant_app_categories',
  USERS: 'restaurant_app_users',
  LOCATION: 'restaurant_app_location'
};

const loadFromStorage = <T>(key: string, defaultData: T): T => {
  try {
    const serialized = localStorage.getItem(key);
    if (!serialized) return defaultData;

    // Handle Date objects revival for Orders
    return JSON.parse(serialized, (key, value) => {
      if (key === 'timestamp' || key === 'generatedAt') return new Date(value);
      if (key === 'start' || key === 'end') return new Date(value);
      return value;
    });
  } catch (e) {
    console.warn(`Failed to load ${key} from storage`, e);
    return defaultData;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage`, e);
  }
};

// Intialize Data with Storage or Defaults
let MOCK_CATEGORIES: Category[] = loadFromStorage(STORAGE_KEYS.CATEGORIES, [
  { id: 'cat-1', name: 'Breakfast' },
  { id: 'cat-2', name: 'Starters' },
  { id: 'cat-3', name: 'Mains' },
  { id: 'cat-4', name: 'Beverages' },
  { id: 'cat-5', name: 'Dessert' },
]);

let MOCK_USERS: User[] = loadFromStorage(STORAGE_KEYS.USERS, [
  { id: 'usr-1', username: 'manager', name: 'Mr. Manager', role: 'manager', password: '123' },
  { id: 'usr-2', username: 'admin', name: 'Admin Staff', role: 'admin', password: '123' },
  { id: 'usr-3', username: 'kitchen', name: 'Head Chef', role: 'kitchen', password: '123' },
  { id: 'usr-4', username: 'cashier', name: 'Cashier 01', role: 'cashier', password: '123' },
]);

// Default Location
let MOCK_LOCATION_CONFIG: LocationConfig = loadFromStorage(STORAGE_KEYS.LOCATION, {
  latitude: -6.175392,
  longitude: 106.827153,
  radiusMeters: 500,
  isActive: false // Default off
});

// Initialize Tables
let DEFAULT_TABLES: Table[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  capacity: 4,
  status: (i + 1) === 4 ? 'OCCUPIED' : 'AVAILABLE'
}));

let MOCK_TABLES: Table[] = loadFromStorage(STORAGE_KEYS.TABLES, DEFAULT_TABLES);

let DEFAULT_PRODUCTS: Product[] = [
  // BREAKFAST
  {
    id: 1,
    name: "Rustic Sourdough Toast",
    description: "House-made sourdough served with artisan jam, cultured butter, and a sprinkle of sea salt.",
    price: 45000,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=800&q=80",
    modifierGroups: FOOD_ADDONS
  },
  {
    id: 12,
    name: "Fluffy Ricotta Pancakes",
    description: "Three fluffy pancakes topped with honeycomb butter, maple syrup, and fresh seasonal berries.",
    price: 65000,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
    modifierGroups: [
      {
        id: 'topping',
        name: 'Extra Topping',
        minSelection: 0,
        maxSelection: 2,
        options: [
          { id: 'top-1', name: 'Vanilla Ice Cream', price: 10000 },
          { id: 'top-2', name: 'Nutella', price: 8000 }
        ]
      }
    ]
  },
  {
    id: 13,
    name: "Classic Eggs Benedict",
    description: "Poached eggs on toasted English muffins with smoked salmon and rich hollandaise sauce.",
    price: 72000,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },

  // STARTERS
  {
    id: 4,
    name: "Green Garden Salad",
    description: "Fresh organic greens, avocado, cherry tomatoes, cucumber, toasted nuts, and lemon vinaigrette.",
    price: 55000,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    modifierGroups: [
      {
        id: 'protein',
        name: 'Add Protein',
        minSelection: 0,
        maxSelection: 1,
        options: [
          { id: 'prot-1', name: 'Grilled Chicken', price: 20000 },
          { id: 'prot-2', name: 'Smoked Salmon', price: 35000 }
        ]
      }
    ]
  },
  {
    id: 10,
    name: "Crispy Calamari",
    description: "Golden fried squid rings served with tartar sauce and a wedge of lemon.",
    price: 60000,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1599488615731-7e512819a6d6?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },
  {
    id: 14,
    name: "Truffle Fries",
    description: "Shoestring fries tossed with truffle oil, parmesan cheese, and parsley.",
    price: 45000,
    category: "Starters",
    image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },

  // MAINS
  {
    id: 2,
    name: "Forest Mushroom Risotto",
    description: "Creamy arborio rice with wild forest mushrooms, thyme, parmesan, and a drizzle of truffle oil.",
    price: 85000,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
    modifierGroups: [
      {
        id: 'truffle',
        name: 'Truffle Intensity',
        minSelection: 1,
        maxSelection: 1,
        options: [
          { id: 't-1', name: 'Normal', price: 0 },
          { id: 't-2', name: 'Extra Truffle Oil', price: 15000 },
        ]
      }
    ]
  },
  {
    id: 3,
    name: "Terracotta Spiced Chicken",
    description: "Roasted chicken thigh marinated in smoked paprika and herbs, served with roasted vegetables.",
    price: 78000,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80",
    modifierGroups: SIDE_DISHES
  },
  {
    id: 7,
    name: "Wagyu Cheeseburger",
    description: "Premium Wagyu beef patty, cheddar cheese, caramelized onions, lettuce, and secret sauce on a brioche bun.",
    price: 110000,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    modifierGroups: [
      ...SIDE_DISHES,
      ...FOOD_ADDONS
    ]
  },
  {
    id: 8,
    name: "Australian Ribeye Steak",
    description: "200g grain-fed Ribeye steak, grilled to perfection, served with garlic butter and choice of side.",
    price: 185000,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=80",
    modifierGroups: [
      ...STEAK_DONENESS,
      ...SIDE_DISHES,
      {
        id: 'sauce',
        name: 'Select Sauce',
        minSelection: 1,
        maxSelection: 1,
        options: [
          { id: 'sauce-1', name: 'Mushroom Sauce', price: 0 },
          { id: 'sauce-2', name: 'Black Pepper', price: 0 },
          { id: 'sauce-3', name: 'Chimichurri', price: 5000 },
        ]
      }
    ]
  },
  {
    id: 9,
    name: "Classic Carbonara",
    description: "Spaghetti with authentic egg yolk sauce, pecorino cheese, and crispy beef bacon (No cream).",
    price: 82000,
    category: "Mains",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },

  // BEVERAGES
  {
    id: 5,
    name: "Hand-Brewed Coffee",
    description: "Single-origin Arabica beans brewed to perfection V60 style. Notes of citrus and floral.",
    price: 35000,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
    modifierGroups: COFFEE_MODIFIERS
  },
  {
    id: 11,
    name: "Iced Matcha Latte",
    description: "Premium ceremonial grade matcha from Uji, Kyoto, served with fresh milk.",
    price: 42000,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=800&q=80",
    modifierGroups: COFFEE_MODIFIERS
  },
  {
    id: 15,
    name: "Tropical Mango Smoothie",
    description: "Fresh mango blended with yogurt, honey, and a hint of mint.",
    price: 45000,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },

  // DESSERT
  {
    id: 6,
    name: "Berry & Fig Tart",
    description: "Seasonal berries and figs on a buttery almond crust with vanilla custard.",
    price: 42000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  },
  {
    id: 16,
    name: "Dark Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla bean ice cream.",
    price: 55000,
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1617305855067-17eb23666b69?auto=format&fit=crop&w=800&q=80",
    modifierGroups: []
  }
];

let MOCK_PRODUCTS: Product[] = loadFromStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);

// --- MOCK ORDERS & HISTORICAL GENERATOR ---

// Helper to generate a year of fake data to support charts and reports
const generateHistoricalOrders = (): Order[] => {
  const orders: Order[] = [];
  const today = new Date();
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  let currentDate = new Date(oneYearAgo);

  while (currentDate < today) { // Change: strictly less than today to avoid overlap
    // Generate 5-15 orders per day
    const ordersToday = Math.floor(Math.random() * 10) + 5;

    for (let i = 0; i < ordersToday; i++) {
      // Pick random product
      const product = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;

      // Random time during opening hours (10am - 10pm)
      const orderTime = new Date(currentDate);
      orderTime.setHours(10 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));

      // Prep time 10-30 mins
      const prepTime = Math.floor(Math.random() * 20) + 10;

      orders.push({
        id: `ORD-${orders.length + 10000}`,
        tableId: Math.floor(Math.random() * 8) + 1,
        items: [{
          ...product,
          cartItemId: `hist-${i}`,
          quantity: quantity,
          selectedModifiers: [],
          finalPrice: product.price
        }],
        total: product.price * quantity,
        status: OrderStatus.SERVED, // CHANGED: Historical orders are SERVED, not PAID
        timestamp: orderTime,
        customerName: `Guest ${i}`,
        paymentMethod: Math.random() > 0.4 ? 'CASH' : 'QRIS',
        prepTimeMinutes: prepTime
      });
    }
    // Next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort descending (newest first)
  return orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Initial Load of Historical Data
// NOTE: We do not store Historical Data in LocalStorage to save space, we regenerate it.
// We only store the "Active" or "Recent" orders + a small subset if needed.
// For simplicity in this Demo, we will load MOCK_ORDERS from storage OR generate defaults.
const loadOrdersSafe = () => {
  const fromStorage = loadFromStorage<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (fromStorage.length > 0) return fromStorage;

  const historical = generateHistoricalOrders();

  // Add some active/recent orders manually to simulate live environment for TODAY
  const activeOrder: Order = {
    id: "ORD-9999",
    tableId: 4,
    items: [
      {
        id: 2,
        name: "Forest Mushroom Risotto",
        description: "Creamy arborio rice...",
        price: 85000,
        category: "Mains",
        image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80",
        quantity: 2,
        cartItemId: 'old-1',
        selectedModifiers: [],
        finalPrice: 85000
      },
      {
        id: 5,
        name: "Hand-Brewed Coffee",
        description: "Single-origin beans...",
        price: 35000,
        category: "Beverages",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        quantity: 2,
        cartItemId: 'old-2',
        selectedModifiers: [],
        finalPrice: 35000
      }
    ],
    total: 240000,
    status: OrderStatus.PREPARING,
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    customerName: "Alex",
    prepTimeMinutes: 0
  };

  const combined = [activeOrder, ...historical];
  // We don't save the full historical set to storage initially to avoid hitting quota immediately
  // We only save changes. But for consistency, let's save the initial state.
  // To avoid quota, let's only save the last 500 orders?
  return combined;
};

let MOCK_ORDERS: Order[] = loadOrdersSafe();

const API_URL = 'http://localhost:8000';

export const ApiService = {
  getProducts: async (): Promise<Product[]> => {
    try {
      return [...MOCK_PRODUCTS];
    } catch (e) {
      console.error("API Error", e);
      return MOCK_PRODUCTS;
    }
  },

  updateProduct: async (updatedProduct: Product): Promise<void> => {
    const index = MOCK_PRODUCTS.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      MOCK_PRODUCTS[index] = updatedProduct;
    } else {
      MOCK_PRODUCTS.push(updatedProduct);
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, MOCK_PRODUCTS);
  },

  submitOrder: async (order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> => {
    const newOrder: Order = {
      ...order,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: OrderStatus.PENDING,
      timestamp: new Date(),
      prepTimeMinutes: 0
    };
    MOCK_ORDERS.unshift(newOrder); // Add to beginning
    // Save only top 500 to storage to be safe
    saveToStorage(STORAGE_KEYS.ORDERS, MOCK_ORDERS.slice(0, 500));

    // Update Table Status to OCCUPIED when order is placed
    const tableIndex = MOCK_TABLES.findIndex(t => t.id === newOrder.tableId);
    if (tableIndex !== -1) {
      MOCK_TABLES[tableIndex].status = 'OCCUPIED';
      saveToStorage(STORAGE_KEYS.TABLES, MOCK_TABLES);
    }

    // Save Order to Table Session for Customer Tracking
    const sessionKey = `table_session_${Number(newOrder.tableId)}`;
    const sessionIds = loadFromStorage<string[]>(sessionKey, []);
    sessionIds.push(newOrder.id);
    saveToStorage(sessionKey, sessionIds);

    // SIMULASI SYSTEM OTOMATIS QRIS
    if (newOrder.paymentMethod === 'QRIS') {
      console.log(`[System] Waiting for QRIS payment callback for ${newOrder.id}...`);
      setTimeout(() => {
        const targetOrder = MOCK_ORDERS.find(o => o.id === newOrder.id);
        if (targetOrder) {
          targetOrder.status = OrderStatus.PAID;
          console.log(`[System] QRIS Payment verified for ${newOrder.id}. Order marked as PAID.`);
          saveToStorage(STORAGE_KEYS.ORDERS, MOCK_ORDERS.slice(0, 500));
        }
      }, 5000); // Simulasi delay 5 detik pembayaran masuk
    }

    return newOrder;
  },

  getOrders: async (): Promise<Order[]> => {
    return [...MOCK_ORDERS];
  },

  getCustomerOrders: async (tableId: number | string): Promise<Order[]> => {
    const sessionKey = `table_session_${Number(tableId)}`;
    const sessionIds = loadFromStorage<string[]>(sessionKey, []);

    // Filter Mock Orders that match these IDs
    return MOCK_ORDERS.filter(o => sessionIds.includes(o.id));
  },

  getOrder: async (id: string): Promise<Order | undefined> => {
    return MOCK_ORDERS.find(o => o.id === id);
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus, paymentMethod?: 'CASH' | 'CARD' | 'QRIS' | null): Promise<void> => {
    const order = MOCK_ORDERS.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (paymentMethod) order.paymentMethod = paymentMethod;

      saveToStorage(STORAGE_KEYS.ORDERS, MOCK_ORDERS.slice(0, 500));
    }
  },

  getTables: async (): Promise<Table[]> => {
    return [...MOCK_TABLES];
  },

  addTable: async (table: Table): Promise<void> => {
    MOCK_TABLES.push(table);
    saveToStorage(STORAGE_KEYS.TABLES, MOCK_TABLES);
  },

  updateTable: async (table: Table): Promise<void> => {
    const idx = MOCK_TABLES.findIndex(t => t.id === table.id);
    if (idx !== -1) {
      MOCK_TABLES[idx] = table;
      saveToStorage(STORAGE_KEYS.TABLES, MOCK_TABLES);
    }
  },

  // NEW METHOD: Manual table clearing
  clearTable: async (id: number | string): Promise<void> => {
    const tableId = Number(id);
    const idx = MOCK_TABLES.findIndex(t => t.id === tableId);
    if (idx !== -1) {
      MOCK_TABLES[idx].status = 'AVAILABLE';
      saveToStorage(STORAGE_KEYS.TABLES, MOCK_TABLES);

      // Reset Customer Session for this table
      localStorage.removeItem(`table_session_${tableId}`);
    }
  },

  deleteTable: async (id: number): Promise<void> => {
    MOCK_TABLES = MOCK_TABLES.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TABLES, MOCK_TABLES);
  },

  // --- ANALYTICS & REPORTS ---

  getDashboardStats: async (): Promise<DashboardStats> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = MOCK_ORDERS.filter(o => o.timestamp >= today && o.timestamp < tomorrow);
    const yesterdayOrders = MOCK_ORDERS.filter(o => o.timestamp >= yesterday && o.timestamp < today);

    const calcTotal = (orders: Order[]) => orders.reduce((sum, o) => sum + o.total, 0);
    const calcAvgPrep = (orders: Order[]) => {
      const paidOrders = orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.SERVED);
      if (paidOrders.length === 0) return 0;
      return Math.round(paidOrders.reduce((sum, o) => sum + (o.prepTimeMinutes || 15), 0) / paidOrders.length);
    };

    // Calculate Active Tables Dynamically based on Status
    const activeTablesCount = MOCK_TABLES.filter(t => t.status === 'OCCUPIED' || t.status === 'RESERVED').length;

    return {
      revenue: {
        current: calcTotal(todayOrders),
        previous: calcTotal(yesterdayOrders)
      },
      orders: {
        current: todayOrders.length,
        previous: yesterdayOrders.length
      },
      activeTables: activeTablesCount, // Updated: Now uses real count
      totalTables: MOCK_TABLES.length, // Updated: Uses real total length
      avgPrepTime: {
        current: calcAvgPrep(todayOrders),
        previous: calcAvgPrep(yesterdayOrders)
      }
    };
  },

  getSalesChartData: async (range: TimeRange): Promise<ChartDataPoint[]> => {
    const now = new Date();
    let startDate = new Date();
    let labelFormat: 'day' | 'month' = 'day';

    switch (range) {
      case '1W': startDate.setDate(now.getDate() - 7); break;
      case '1M': startDate.setMonth(now.getMonth() - 1); break;
      case '6M': startDate.setMonth(now.getMonth() - 6); labelFormat = 'month'; break;
      case '1Y': startDate.setFullYear(now.getFullYear() - 1); labelFormat = 'month'; break;
      case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); labelFormat = 'month'; break;
    }

    // Filter orders within range
    const rangeOrders = MOCK_ORDERS.filter(o => o.timestamp >= startDate);

    // Group By
    const groupedData: Record<string, number> = {};

    rangeOrders.forEach(o => {
      let key = '';
      if (labelFormat === 'day') {
        key = o.timestamp.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      } else {
        key = o.timestamp.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      groupedData[key] = (groupedData[key] || 0) + o.total;
    });

    // Convert to array
    const chartData: ChartDataPoint[] = Object.keys(groupedData).map(key => ({
      name: key,
      sales: groupedData[key],
      date: key
    }));

    return chartData.reverse();
  },

  generateReport: async (type: 'SALES' | 'LOGS', start: Date, end: Date): Promise<ReportData> => {
    // Simulate Backend Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const filteredOrders = MOCK_ORDERS.filter(o =>
      o.timestamp >= start && o.timestamp <= end
    );

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);

    // Calculate Top Items
    const itemCounts: Record<string, { qty: number, rev: number }> = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemCounts[item.name]) itemCounts[item.name] = { qty: 0, rev: 0 };
        itemCounts[item.name].qty += item.quantity;
        itemCounts[item.name].rev += (item.finalPrice * item.quantity);
      });
    });

    const topItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, quantity: data.qty, revenue: data.rev }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      generatedAt: new Date(),
      period: { start, end },
      type,
      summary: {
        totalRevenue,
        totalOrders: filteredOrders.length,
        avgOrderValue: filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0,
        canceledOrders: 0 // Mock
      },
      topItems,
      orders: filteredOrders
    };
  },

  // --- USER & CATEGORY MANAGEMENT ---

  login: async (username: string, password: string): Promise<User | null> => {
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    return user ? { ...user } : null; // Return copy without password ref
  },

  getUsers: async (): Promise<User[]> => {
    return MOCK_USERS.map(({ password, ...u }) => u as User); // Do not return passwords
  },

  upsertUser: async (user: User): Promise<void> => {
    const idx = MOCK_USERS.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      // Update
      MOCK_USERS[idx] = { ...MOCK_USERS[idx], ...user };
      // If password not provided in update, keep old one. If provided, update it.
      if (user.password) MOCK_USERS[idx].password = user.password;
    } else {
      // Create
      MOCK_USERS.push({ ...user, id: `usr-${Date.now()}` });
    }
    saveToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
  },

  deleteUser: async (id: string): Promise<void> => {
    MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, MOCK_USERS);
  },

  getCategories: async (): Promise<Category[]> => {
    return [...MOCK_CATEGORIES];
  },

  upsertCategory: async (category: Category): Promise<void> => {
    const idx = MOCK_CATEGORIES.findIndex(c => c.id === category.id);
    if (idx !== -1) {
      MOCK_CATEGORIES[idx] = category;
    } else {
      MOCK_CATEGORIES.push({ ...category, id: `cat-${Date.now()}` });
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
  },

  deleteCategory: async (id: string): Promise<void> => {
    MOCK_CATEGORIES = MOCK_CATEGORIES.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CATEGORIES, MOCK_CATEGORIES);
  },

  // --- LOCATION SETTINGS ---

  getLocationConfig: async (): Promise<LocationConfig> => {
    return { ...MOCK_LOCATION_CONFIG };
  },

  updateLocationConfig: async (config: LocationConfig): Promise<void> => {
    MOCK_LOCATION_CONFIG = config;
    saveToStorage(STORAGE_KEYS.LOCATION, MOCK_LOCATION_CONFIG);
  },

  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
};