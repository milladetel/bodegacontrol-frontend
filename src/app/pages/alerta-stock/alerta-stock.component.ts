import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../core/api.services';
import { AuthService } from '../../core/auth.service';
import { Producto } from '../../core/models';
import { EstadoBadgeComponent } from '../../shared/estado-badge.component';

@Component({
  selector: 'app-alerta-stock',
  imports: [DatePipe, RouterLink, EstadoBadgeComponent],
  template: `
    <div class="page-header">
      <div>
        <h1><i class="bi bi-exclamation-triangle text-warning"></i> Alertas de inventario</h1>
        <p>Productos agotados, con stock bajo o que vencen en los próximos 30 días</p>
      </div>
      @if (auth.esAdmin()) {
        <a class="btn btn-primary" routerLink="/ingresos"><i class="bi bi-box-arrow-in-down"></i> Registrar ingreso</a>
      }
    </div>
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th class="text-center">Stock</th><th class="text-center">Mínimo</th><th>Vencimiento</th><th>Estado</th></tr></thead>
          <tbody>
            @for (p of alertas(); track p.id) {
              <tr>
                <td><span class="badge badge-codigo">{{ p.codigo }}</span></td>
                <td>{{ p.nombre }}</td>
                <td>{{ p.categoriaEtiqueta }}</td>
                <td class="text-center fw-semibold">{{ p.stock }}</td>
                <td class="text-center">{{ p.stockMinimo }}</td>
                <td>{{ p.fechaVencimiento ? (p.fechaVencimiento | date:'dd/MM/yyyy') : '—' }}</td>
                <td><app-estado-badge [producto]="p" /></td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="text-center text-secondary py-4">No hay alertas. ¡Inventario en orden!</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AlertaStockComponent implements OnInit {
  private productoService = inject(ProductoService);
  auth = inject(AuthService);
  alertas = signal<Producto[]>([]);

  ngOnInit(): void {
    this.productoService.alertas().subscribe(a => this.alertas.set(a));
  }
}
