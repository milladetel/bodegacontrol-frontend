import { Component, input } from '@angular/core';
import { Producto } from '../core/models';

/** Muestra el estado del stock con texto y color (no solo color, por accesibilidad). */
@Component({
  selector: 'app-estado-badge',
  template: `
    @switch (producto().estado) {
      @case ('AGOTADO') { <span class="badge text-bg-danger">Agotado</span> }
      @case ('STOCK_BAJO') { <span class="badge text-bg-warning">Stock bajo</span> }
      @default { <span class="badge text-bg-success">Disponible</span> }
    }
    @if (producto().porVencer) { <span class="badge text-bg-dark ms-1">Por vencer</span> }
  `
})
export class EstadoBadgeComponent {
  producto = input.required<Producto>();
}
