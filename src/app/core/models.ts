export type Rol = 'ADMIN' | 'CAJERO';
export type EstadoStock = 'DISPONIBLE' | 'STOCK_BAJO' | 'AGOTADO';
export type MetodoPago = 'EFECTIVO' | 'BILLETERA_DIGITAL';

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: Rol;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  usuario: Usuario;
}

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  categoriaEtiqueta: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento: string | null;
  estado: EstadoStock;
  porVencer: boolean;
}

export interface ProductoRequest {
  codigo: string;
  nombre: string;
  categoria: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  fechaVencimiento: string | null;
}

export interface Opcion {
  valor: string;
  etiqueta: string;
}

export interface DetalleVenta {
  productoId: number;
  codigo: string;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number;
  numero: string;
  fecha: string;
  cajero: string;
  metodoPago: MetodoPago;
  total: number;
  montoRecibido: number;
  vuelto: number;
  items: number;
  detalles?: DetalleVenta[];
}

export interface VentaRequest {
  items: { productoId: number; cantidad: number }[];
  metodoPago: MetodoPago;
  montoRecibido: number | null;
}

export interface Ingreso {
  id: number;
  productoId: number;
  codigo: string;
  producto: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  observacion: string | null;
  usuario: string;
  fecha: string;
}

export interface Dashboard {
  ventasHoy: number;
  operacionesHoy: number;
  ticketPromedio: number;
  ventasMes: number;
  valorInventario: number;
  totalProductos: number;
  productosStockBajo: number;
  productosAgotados: number;
  productosPorVencer: number;
  alertas: Producto[];
  ultimasVentas: Venta[];
}

/** Formato de error que devuelve el backend (GlobalExceptionHandler). */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  mensaje: string;
  ruta: string;
  errores?: Record<string, string>;
}
