import { AuthRepositoryPort, ProductRepositoryPort, ReportRepositoryPort, SaleRepositoryPort } from '../ports';
import { Product, Sale, SalesReport, User, AuthResponse, PagedResult } from '../../domain/types';

/**
 * Casos de Uso del Frontend (Anillo 2 - Application).
 * Desacoplados de React, del DOM y de la red directa.
 */
export class BrowseCatalogUseCase {
  constructor(private productRepo: ProductRepositoryPort) {}
  execute(page?: number, size?: number, categoryId?: string, search?: string): Promise<PagedResult<Product>> {
    return this.productRepo.list(page, size, categoryId, search);
  }
}

export class CheckoutSaleUseCase {
  constructor(private saleRepo: SaleRepositoryPort) {}
  execute(items: { productId: string; quantity: number }[]): Promise<Sale> {
    return this.saleRepo.create(items);
  }
}

export class ViewSalesReportUseCase {
  constructor(private reportRepo: ReportRepositoryPort) {}
  execute(from?: string, to?: string): Promise<SalesReport> {
    return this.reportRepo.getSalesReport(from, to);
  }
}

export class LoginUseCase {
  constructor(private authRepo: AuthRepositoryPort) {}
  execute(username: string, password: string): Promise<AuthResponse> {
    return this.authRepo.login(username, password);
  }
}
