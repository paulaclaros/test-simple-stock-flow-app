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

    const response = await fetch(`${BASE_URL}/products/${id}/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new ApiError(response.status, 'Error al subir imagen');
    }

    return response.json();
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
