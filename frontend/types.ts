
export interface Modifier {
  id: string;
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number; // 0=Optional, 1=Required
  maxSelection: number; // 1=Single(Radio), >1=Multi(Checkbox)
  options: Modifier[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  modifierGroups?: ModifierGroup[];
}

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for this specific item in cart (variant)
  quantity: number;
  selectedModifiers: Modifier[];
  notes?: string;
  finalPrice: number; // Base + Modifiers
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  PAID = 'PAID',
}

export interface Order {
  id: string;
  tableId: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  timestamp: Date;
  customerName?: string;
  paymentMethod?: 'CASH' | 'CARD' | 'QRIS' | null;
  prepTimeMinutes?: number; // Added for analytics
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
}

// --- NEW ANALYTICS TYPES ---

export type TimeRange = '1W' | '1M' | '6M' | '1Y' | 'YTD';

export interface DashboardStats {
  revenue: { current: number; previous: number };
  orders: { current: number; previous: number };
  activeTables: number;
  totalTables: number;
  avgPrepTime: { current: number; previous: number }; // in minutes
}

export interface ChartDataPoint {
  name: string;
  sales: number;
  date: string;
}

export interface ReportData {
  generatedAt: Date;
  period: { start: Date; end: Date };
  type: 'SALES' | 'LOGS';
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    canceledOrders: number;
  };
  topItems?: { name: string; quantity: number; revenue: number }[];
  orders?: Order[];
}

// --- AUTH & SETTINGS TYPES ---

export type Role = 'manager' | 'admin' | 'kitchen' | 'cashier';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  password?: string; // Only used for updates
}

export interface Category {
  id: string;
  name: string;
}

export interface LocationConfig {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}
