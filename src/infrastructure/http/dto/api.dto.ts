/**
 * DTOs de Contrato de API (Anillo 3 - Infraestructura HTTP).
 * Mapean 1:1 contra api-contract.md en formato camelCase estricto.
 */

export interface ProductDto {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CreateProductRequestDto {
  name: string;
  categoryId: string;
  price: number;
  stock: number;
}

export interface UpdateProductRequestDto {
  name: string;
  categoryId: string;
  price: number;
  stock: number;
}

export interface SaleItemRequestDto {
  productId: string;
  quantity: number;
}

export interface PlaceSaleRequestDto {
  items: SaleItemRequestDto[];
}

export interface SaleItemResponseDto {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleResponseDto {
  id: string;
  soldAt: string;
  soldByUsername: string;
  total: number;
  items: SaleItemResponseDto[];
}

export interface SalesReportRowDto {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  totalAmount: number;
}

export interface SalesReportResponseDto {
  from: string;
  to: string;
  currency: string;
  totalSales: number;
  grandTotal: number;
  items: SalesReportRowDto[];
}
