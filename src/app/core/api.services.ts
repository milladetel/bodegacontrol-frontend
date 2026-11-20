import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiError, Dashboard, Ingreso, Opcion, Producto, ProductoRequest, Venta, VentaRequest } from './models';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);

  listar(filtros: { buscar?: string; categoria?: string; estado?: string } = {}): Observable<Producto[]> {
    let params = new HttpParams();
    Object.entries(filtros).forEach(([k, v]) => { if (v) params = params.set(k, v); });
    return this.http.get<Producto[]>(`${API}/productos`, { params });
  }
  obtener(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${API}/productos/${id}`);
  }
  crear(p: ProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(`${API}/productos`, p);
  }
  actualizar(id: number, p: ProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${API}/productos/${id}`, p);
  }
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/productos/${id}`);
  }
  alertas(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${API}/productos/alertas`);
  }
  categorias(): Observable<Opcion[]> {
    return this.http.get<Opcion[]>(`${API}/categorias`);
  }
}

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);

  registrar(v: VentaRequest): Observable<Venta> {
    return this.http.post<Venta>(`${API}/ventas`, v);
  }
  listar(desde?: string, hasta?: string): Observable<Venta[]> {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<Venta[]>(`${API}/ventas`, { params });
  }
  obtener(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${API}/ventas/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class IngresoService {
  private http = inject(HttpClient);

  registrar(productoId: number, cantidad: number, observacion: string | null): Observable<Ingreso> {
    return this.http.post<Ingreso>(`${API}/ingresos`, { productoId, cantidad, observacion });
  }
  listar(): Observable<Ingreso[]> {
    return this.http.get<Ingreso[]>(`${API}/ingresos`);
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  resumen(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API}/dashboard`);
  }
}

/** Convierte un error HTTP en un mensaje legible usando el formato ApiError del backend. */
export function mensajeError(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.';
  const body = err.error as ApiError | null;
  return body?.mensaje ?? 'Ocurrió un error inesperado.';
}
