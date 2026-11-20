import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { VentaService, mensajeError } from '../../core/api.services';
import { Venta } from '../../core/models';

@Component({
  selector: 'app-venta-lista',
  imports: [CurrencyPipe, DatePipe, FormsModule, RouterLink],
  templateUrl: './venta-lista.component.html'
})
export class VentaListaComponent implements OnInit {
  private ventaService = inject(VentaService);

  ventas = signal<Venta[]>([]);
  seleccionada = signal<Venta | null>(null);
  error = signal<string | null>(null);
  cargando = signal(true);
  desde = '';
  hasta = '';

  totalPeriodo = computed(() => this.ventas().reduce((s, v) => s + v.total, 0));

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.ventaService.listar(this.desde, this.hasta).subscribe({
      next: v => { this.ventas.set(v); this.error.set(null); this.cargando.set(false); },
      error: (e: HttpErrorResponse) => { this.error.set(mensajeError(e)); this.cargando.set(false); }
    });
  }

  limpiar(): void {
    this.desde = '';
    this.hasta = '';
    this.cargar();
  }

  verDetalle(v: Venta): void {
    this.ventaService.obtener(v.id).subscribe(d => this.seleccionada.set(d));
  }
}
