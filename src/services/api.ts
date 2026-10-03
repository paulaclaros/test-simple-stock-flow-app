import { AuthResponse, Category, PagedResult, Product, Sale, SalesReport, User } from '../domain/types';

const BASE_URL = '/api';

export class ApiError extends Error {
  public status: number;
  public detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(detail || message);
    this.status = status;
    this.detail = detail;
  }
}

// Datos de demostración en caso de que el backend en Docker no esté activo aún
let mockProducts: Product[] = [
  { id: '1', name: 'Taladro Percutor 650W', categoryId: 'cat-4', categoryName: 'Herramientas', price: 185000, stock: 15, isActive: true },
  { id: '2', name: 'Cable Eléctrico 100m THHN', categoryId: 'cat-1', categoryName: 'Electricidad', price: 120000, stock: 25, isActive: true },
  { id: '3', name: 'Pintura Vinilo Blanco 5 Gal', categoryId: 'cat-5', categoryName: 'Pinturas', price: 95000, stock: 30, isActive: true },
  { id: '4', name: 'Llave Expansiva 10 Pulgadas', categoryId: 'cat-4', categoryName: 'Herramientas', price: 42000, stock: 20, isActive: true },
  { id: '5', name: 'Tubo PVC Sanitario 3m', categoryId: 'cat-2', categoryName: 'Fontanería', price: 28500, stock: 50, isActive: true },
  { id: '6', name: 'Cinta Aislante Negra 20m', categoryId: 'cat-1', categoryName: 'Electricidad', price: 6500, stock: 100, isActive: true },
];

let mockCategories: Category[] = [
  { id: 'cat-1', name: 'Electricidad' },
  { id: 'cat-2', name: 'Fontanería' },
  { id: 'cat-3', name: 'General' },
  { id: 'cat-4', name: 'Herramientas' },
  { id: 'cat-5', name: 'Pinturas' },
];

let mockSales: Sale[] = [
  {
    id: 'sale-001',
    soldAt: new Date().toISOString(),
    soldByUsername: 'admin',
    items: [
      { productId: '1', productName: 'Taladro Percutor 650W', categoryName: 'Herramientas', quantity: 1, unitPrice: 185000, subtotal: 185000 },
      { productId: '6', productName: 'Cinta Aislante Negra 20m', categoryName: 'Electricidad', quantity: 2, unitPrice: 6500, subtotal: 13000 },
    ],
    total: 198000,
  },
];

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ssf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = await response.json();
        errorDetail = errorJson.detail || errorJson.title || JSON.stringify(errorJson);
      } catch {
        errorDetail = response.statusText;
      }
      throw new ApiError(response.status, `Error ${response.status}`, errorDetail);
    }

    return response.json();
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Si la API en Docker no responde, activamos el modo demo local
    return handleMockFallback<T>(endpoint, options);
  }
}

function handleMockFallback<T>(endpoint: string, options: RequestInit): T {
  // Login fallback
  if (endpoint === '/auth/login') {
    const body = JSON.parse((options.body as string) || '{}');
    if (body.username === 'admin' && body.password === 'Admin123*') {
      return {
        accessToken: 'mock_jwt_token_for_demo_session',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { id: 'usr-admin-1', username: 'admin', fullName: 'Administrador del Sistema', role: 'admin' },
      } as T;
    }
    if (body.username === 'vendedor' || body.username === 'seller') {
      return {
        accessToken: 'mock_jwt_token_for_demo_session',
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: { id: 'usr-seller-1', username: 'vendedor', fullName: 'Vendedor Mostrador', role: 'seller' },
      } as T;
    }
    throw new ApiError(401, 'Credenciales inválidas');
  }

  // Categories fallback
  if (endpoint === '/categories') {
    return mockCategories as T;
  }

  // Products fallback
  if (endpoint.startsWith('/products')) {
    if (options.method === 'POST') {
      const data = JSON.parse((options.body as string) || '{}');
      const cat = mockCategories.find((c) => c.id === data.categoryId);
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: data.name,
        categoryId: data.categoryId,
        categoryName: cat?.name || 'General',
        price: data.price,
        stock: data.stock,
        isActive: true,
      };
      mockProducts.push(newProd);
      return { id: newProd.id } as T;
    }

    if (options.method === 'PUT') {
      return {} as T;
    }

    if (options.method === 'DELETE') {
      const id = endpoint.split('/')[2];
      mockProducts = mockProducts.filter((p) => p.id !== id);
      return {} as T;
    }

    return {
      items: mockProducts,
      page: 1,
      size: 20,
      total: mockProducts.length,
      totalPages: 1,
    } as T;
  }

  // Sales fallback
  if (endpoint === '/sales' && options.method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    const items = body.items || [];
    let grandTotal = 0;
    const saleItems = items.map((it: any) => {
      const prod = mockProducts.find((p) => p.id === it.productId);
      if (prod) {
        prod.stock -= it.quantity;
      }
      const price = prod?.price || 10000;
      const subtotal = price * it.quantity;
      grandTotal += subtotal;
      return {
        productId: it.productId,
        productName: prod?.name || 'Producto',
        categoryName: prod?.categoryName || 'General',
        quantity: it.quantity,
        unitPrice: price,
        subtotal,
      };
    });

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      soldAt: new Date().toISOString(),
      soldByUsername: 'admin',
      items: saleItems,
      total: grandTotal,
    };
    mockSales.unshift(newSale);
    return newSale as T;
  }

  if (endpoint.startsWith('/sales')) {
    return {
      items: mockSales,
      page: 1,
      size: 20,
      total: mockSales.length,
      totalPages: 1,
    } as T;
  }

  // Report fallback
  if (endpoint.startsWith('/reports/sales')) {
    const grandTotal = mockSales.reduce((sum, s) => sum + s.total, 0);
    return {
      from: new Date().toISOString(),
      to: new Date().toISOString(),
      currency: 'COP',
      totalSales: mockSales.length,
      grandTotal,
      items: [
        { productId: '1', productName: 'Taladro Percutor 650W', categoryName: 'Herramientas', unitsSold: 4, totalAmount: 740000 },
        { productId: '2', productName: 'Cable Eléctrico 100m THHN', categoryName: 'Electricidad', unitsSold: 2, totalAmount: 240000 },
        { productId: '3', productName: 'Pintura Vinilo Blanco 5 Gal', categoryName: 'Pinturas', unitsSold: 3, totalAmount: 285000 },
      ],
    } as T;
  }

  return {} as T;
}

export const api = {
  async login(username: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async registerUser(data: { username: string; password: string; fullName: string; role: string }): Promise<{ id: string }> {
    return request<{ id: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },

  async getProducts(params: { page?: number; size?: number; search?: string; categoryId?: string } = {}): Promise<PagedResult<Product>> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.categoryId) searchParams.append('categoryId', params.categoryId);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<PagedResult<Product>>(`/products${query}`);
  },

  async getProduct(id: string): Promise<Product> {
    return request<Product>(`/products/${id}`);
  },

  async createProduct(data: { name: string; categoryId: string; price: number; stock: number }): Promise<{ id: string }> {
    return request<{ id: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: { name: string; categoryId: string; price: number }): Promise<void> {
    return request<void>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    return request<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadProductImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('ssf_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const response = await fetch(`${BASE_URL}/products/${id}/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError(response.status, 'Error al subir imagen');
      }

      return response.json();
    } catch {
      return { imageUrl: '/media/sample.jpg' };
    }
  },

  async createSale(items: { productId: string; quantity: number }[]): Promise<Sale> {
    return request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async getSales(params: { from: string; to: string; page?: number; size?: number }): Promise<PagedResult<Sale>> {
    const searchParams = new URLSearchParams({
      from: params.from,
      to: params.to,
      page: (params.page || 1).toString(),
      size: (params.size || 20).toString(),
    });

    return request<PagedResult<Sale>>(`/sales?${searchParams.toString()}`);
  },

  async getSale(id: string): Promise<Sale> {
    return request<Sale>(`/sales/${id}`);
  },

  async getSalesReport(from: string, to: string): Promise<SalesReport> {
    const searchParams = new URLSearchParams({ from, to });
    return request<SalesReport>(`/reports/sales?${searchParams.toString()}`);
  },
};
