import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { IngresoService, ProductoService, mensajeError } from '../../core/api.services';
import { ToastService } from '../../core/toast.service';
import { Ingreso, Producto } from '../../core/models';

@Component({
  selector: 'app-ingreso-stock',
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './ingreso-stock.component.html'
})
export class IngresoStockComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private ingresoService = inject(IngresoService);
  private toast = inject(ToastService);

  productos = signal<Producto[]>([]);
  ingresos = signal<Ingreso[]>([]);
  error = signal<string | null>(null);
  guardando = signal(false);

  form = this.fb.group({
    productoId: [null as number | null, Validators.required],
    cantidad: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10000)]],
    observacion: ['', Validators.maxLength(150)]
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.productoService.listar().subscribe(p => this.productos.set(p));
    this.ingresoService.listar().subscribe(i => this.ingresos.set(i));
  }

  productoSeleccionado(): Producto | undefined {
    return this.productos().find(p => p.id === Number(this.form.value.productoId));
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  registrar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    this.ingresoService.registrar(Number(v.productoId), Number(v.cantidad), v.observacion || null).subscribe({
      next: i => {
        this.toast.mostrar(`Ingreso registrado: ${i.producto} pasó de ${i.stockAnterior} a ${i.stockNuevo} unidades`);
        this.form.reset();
        this.guardando.set(false);
        this.cargar();
      },
      error: (e: HttpErrorResponse) => { this.error.set(mensajeError(e)); this.guardando.set(false); }
    });
  }
}
