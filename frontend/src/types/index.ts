export interface Category {
  id: number;
  name: string;
  createdAt: string;
  _count?: { products: number; subcategories: number };
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  category?: Category;
  createdAt: string;
  _count?: { products: number };
}

export interface Location {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface UnitOfMeasure {
  id: number;
  name: string;
  symbol: string;
  createdAt: string;
  _count?: { products: number };
}

export interface Supplier {
  id: number;
  name: string;
  contactInfo?: string | null;
  createdAt: string;
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  photo?: string | null;
  categoryId: number;
  category: Category;
  subcategoryId?: number | null;
  subcategory?: Subcategory | null;
  locationId?: number | null;
  location?: Location | null;
  supplierId?: number | null;
  supplier?: Supplier | null;
  unitOfMeasureId: number;
  unitOfMeasure: UnitOfMeasure;
  quantity: number;
  purchasePrice?: number | null;
  lowStockThreshold: number;
  barcode?: string | null;
  link?: string | null;
  notes?: string | null;
  isLowStock?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  product?: { id: number; name: string; photo?: string | null };
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason?: string | null;
  previousQuantity: number;
  newQuantity: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  productId: number;
  product?: { id: number; name: string; photo?: string | null; quantity: number };
  type: 'LOW_STOCK';
  message: string;
  read: boolean;
  sentViaEmail: boolean;
  sentViaTelegram: boolean;
  createdAt: string;
}

export interface AppSettings {
  id: number;
  enableEmailNotifications: boolean;
  emailSmtpHost: string;
  emailSmtpPort: number;
  emailSmtpUser: string;
  emailSmtpPass: string;
  emailFrom: string;
  emailTo: string;
  enableTelegramNotifications: boolean;
  telegramBotToken: string;
  telegramChatId: string;
  backupEnabled: boolean;
  backupCronSchedule: string;
  lowStockCheckCronSchedule: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockCount: number;
  totalCategories: number;
  totalValue: number;
  unreadNotifications: number;
  recentMovements: StockMovement[];
  categoryDistribution: { name: string; count: number }[];
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  [key: string]: any;
}
