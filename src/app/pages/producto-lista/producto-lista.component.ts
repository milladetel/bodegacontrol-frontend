import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime } from 'rxjs';
import { ProductoService, mensajeError } from '../../core/api.services';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { Opcion, Producto } from '../../core/models';
import { EstadoBadgeComponent } from '../../shared/estado-badge.component';

@Component({
  selector: 'app-producto-lista',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink, EstadoBadgeComponent],
  templateUrl: './producto-lista.component.html'
})
export class ProductoListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  productos = signal<Producto[]>([]);
  categorias = signal<Opcion[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  buscar = '';
  categoria = '';
  estado = '';
  private busqueda$ = new Subject<void>();

  ngOnInit(): void {
    this.productoService.categorias().subscribe(c => this.categorias.set(c));
    this.busqueda$.pipe(debounceTime(300)).subscribe(() => this.cargar());
    this.cargar();
  }

  onBuscar(): void {
    this.busqueda$.next();
  }

  cargar(): void {
    this.cargando.set(true);
    this.productoService.listar({ buscar: this.buscar, categoria: this.categoria, estado: this.estado }).subscribe({
      next: p => { this.productos.set(p); this.cargando.set(false); this.error.set(null); },
      error: (e: HttpErrorResponse) => { this.error.set(mensajeError(e)); this.cargando.set(false); }
    });
  }

  limpiar(): void {
    this.buscar = '';
    this.categoria = '';
    this.estado = '';
    this.cargar();
  }

  eliminar(p: Producto): void {
    if (!confirm(`¿Dar de baja el producto "${p.nombre}"? Dejará de mostrarse en el catálogo.`)) return;
    this.productoService.eliminar(p.id).subscribe({
      next: () => { this.toast.mostrar('Producto dado de baja'); this.cargar(); },
      error: (e: HttpErrorResponse) => this.toast.mostrar(mensajeError(e), 'danger')
    });
  }
}
