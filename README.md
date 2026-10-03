# test-simple-stock-flow-app

> **Prueba Técnica SDD · Ficha ADSO 3413974**  
> **Aprendiz:** Paula Claros ([`paulaclaros`](https://github.com/paulaclaros))  
> **Tecnología:** React 18 + TypeScript + Vite (Arquitectura en Capas equivalente a Onion)  
> **Fecha:** 2026-10-03  

---

## 📌 1. Descripción del Frontend

Este repositorio contiene la **Single Page Application (SPA)** de *Simple Stock Flow*, construida en **React 18** con **TypeScript** y empaquetada con **Vite**.

La aplicación implementa los 4 anillos concéntricos equivalentes a la Arquitectura Cebolla (Onion) definidos en `ARQUITECTURA-ONION.md`:
* **`domain/` (Anillo 1):** Modelos puros y entidades del carrito (`Product`, `Sale`, `SaleItem`, `Category`, `User`).
* **`application/` (Anillo 2):** Casos de uso desacoplados del DOM (`BrowseCatalogUseCase`, `CheckoutSaleUseCase`, `ViewSalesReportUseCase`, `LoginUseCase`) y contratos de puertos.
* **`infrastructure/` (Anillo 3):** Cliente HTTP con Axios/Fetch y DTOs tipados en estricto `camelCase` (`api.dto.ts`).
* **`features/` o componentes UI (Anillo 4):** Vistas interactivas de presentación.

---

## 🌟 2. Módulos y Funcionalidades Implementadas

1. **Autenticación y Control de Roles:**
   - Login con tokens JWT Bearer (`POST /api/auth/login`).
   - Soporte para roles `admin` y `seller`.
2. **Catálogo de Productos (HU-01 y HU-02):**
   - Listado reactivo con filtros por categoría y búsqueda en tiempo real.
   - Indicador visual de disponibilidad y alertas de stock bajo.
   - Operaciones de administrador: Crear producto, editar precio/stock y dar de baja lógica (**RN-08**).
3. **Punto de Venta / Carrito (HU-04, RN-01, RN-04, RN-05):**
   - Carrito de compras con cálculo automático de subtotales y total general (**RN-12**).
   - Bloqueo en tiempo real: impide vender cantidades mayores al stock existente (**RN-01**).
   - Impide duplicar productos en la misma orden de venta (**RN-05**).
   - Descuento atómico del stock al confirmar la venta.
4. **Historial de Ventas (HU-05):**
   - Tabla paginada de facturas con vendedor, fecha y total.
   - Modal interactivo con el detalle congelado de la venta (precio y nombre congelados según **RN-06**).
5. **Reporte de Ventas (HU-06):**
   - Selector de rango de fechas (`from` y `to`).
   - Métricas clave: Total de ingresos, total de unidades vendidas y número de transacciones.
   - Desglose por producto con ingresos y unidades.

---

## 🚀 3. Cómo Ejecutar Localmente

### Modo Desarrollo
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```
La aplicación estará disponible inmediatamente en: **[http://localhost:4200/](http://localhost:4200/)**

### Credenciales de Demostración
* **Administrador:** Usuario `admin` / Contraseña `admin123`
* **Vendedor:** Usuario `seller` / Contraseña `seller123`

### Construcción para Producción
```bash
npm run build
```
Genera la carpeta optimizada `dist/` para ser servida por el servidor Nginx en el contenedor Docker.
