import { Category, Product, Sale, SalesReport, User, AuthResponse, PagedResult } from '../../domain/types';

export interface ProductRepositoryPort {
  list(page?: number, size?: number, categoryId?: string, search?: string): Promise<PagedResult<Product>>;
  getById(id: string): Promise<Product>;
  create(data: Omit<Product, 'id' | 'imageUrl' | 'isActive'>): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
  uploadImage(id: string, file: File): Promise<string>;
}

export interface SaleRepositoryPort {
  list(page?: number, size?: number): Promise<PagedResult<Sale>>;
  getById(id: string): Promise<Sale>;
  create(items: { productId: string; quantity: number }[]): Promise<Sale>;
}

export interface ReportRepositoryPort {
  getSalesReport(from?: string, to?: string): Promise<SalesReport>;
}

export interface AuthRepositoryPort {
  login(username: string, password: string): Promise<AuthResponse>;
  register(data: { username: string; password: string; fullName: string; role: 'seller' }): Promise<User>;
}
