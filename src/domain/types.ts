export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface SaleItem {
  id?: string;
  productId: string;
  productName?: string;
  categoryName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface Sale {
  id: string;
  soldAt: string;
  soldByUserId?: string;
  soldByUsername: string;
  items: SaleItem[];
  total: number;
}

export interface SalesReportItem {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  totalAmount: number;
}

export interface SalesReport {
  from: string;
  to: string;
  currency: string;
  totalSales: number;
  grandTotal: number;
  items: SalesReportItem[];
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'seller';
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}
