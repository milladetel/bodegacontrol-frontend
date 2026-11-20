import { Component, OnInit, inject, input, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductoService, mensajeError } from '../../core/api.services';
import { ToastService } from '../../core/toast.service';
import { ApiError, Opcion, ProductoRequest } from '../../core/models';

/** La fecha de vencimiento no puede ser pasada. */
function fechaNoPasada(c: AbstractControl): ValidationErrors | null {
  if (!c.value) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  return c.value < hoy ? { fechaPasada: true } : null;
}

/** El precio de venta no puede ser menor al de compra. */
function preciosValidos(g: AbstractControl): ValidationErrors | null {
  const compra = Number(g.get('precioCompra')?.value);
  const venta = Number(g.get('precioVenta')?.value);
  return compra > 0 && venta > 0 && venta < compra ? { precioMenor: true } : null;
}

@Component({
  selector: 'app-producto-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent implements OnInit {
  /** Llega desde la ruta /productos/:id/editar (withComponentInputBinding). */
  id = input<string>();

  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private toast = inject(ToastService);
  private router = inject(Router);

  categorias = signal<Opcion[]>([]);
  guardando = signal(false);
  error = signal<string | null>(null);
  erroresServidor = signal<Record<string, string>>({});

  form = this.fb.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{3,15}$/)]],
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    categoria: ['', Validators.required],
    precioCompra: [null as number | null, [Validators.required, Validators.min(0.01)]],
    precioVenta: [null as number | null, [Validators.required, Validators.min(0.01)]],
    stock: [0 as number | null, [Validators.required, Validators.min(0)]],
    stockMinimo: [5 as number | null, [Validators.required, Validators.min(0)]],
    fechaVencimiento: ['' as string | null, fechaNoPasada]
  }, { validators: preciosValidos });

  get esEdicion(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    this.productoService.categorias().subscribe(c => this.categorias.set(c));
    if (this.esEdicion) {
      this.productoService.obtener(Number(this.id())).subscribe({
        next: p => this.form.patchValue({ ...p, fechaVencimiento: p.fechaVencimiento ?? '' }),
        error: (e: HttpErrorResponse) => this.error.set(mensajeError(e))
      });
    }
  }

  invalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && (c.touched || c.dirty);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    this.error.set(null);
    this.erroresServidor.set({});
    const v = this.form.getRawValue();
    const datos: ProductoRequest = {
      codigo: v.codigo!, nombre: v.nombre!, categoria: v.categoria!,
      precioCompra: Number(v.precioCompra), precioVenta: Number(v.precioVenta),
      stock: Number(v.stock), stockMinimo: Number(v.stockMinimo),
      fechaVencimiento: v.fechaVencimiento || null
    };
    const peticion = this.esEdicion
      ? this.productoService.actualizar(Number(this.id()), datos)
      : this.productoService.crear(datos);

    peticion.subscribe({
      next: p => {
        this.toast.mostrar(`Producto ${p.codigo} ${this.esEdicion ? 'actualizado' : 'registrado'} correctamente`);
        this.router.navigate(['/productos']);
      },
      error: (e: HttpErrorResponse) => {
        this.guardando.set(false);
        this.error.set(mensajeError(e));
        this.erroresServidor.set((e.error as ApiError)?.errores ?? {});
      }
    });
  }
}
