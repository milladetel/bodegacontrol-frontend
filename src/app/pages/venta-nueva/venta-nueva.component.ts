import { Component, ElementRef, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ProductoService, VentaService, mensajeError } from '../../core/api.services';
import { ToastService } from '../../core/toast.service';
import { MetodoPago, Producto, Venta } from '../../core/models';

interface LineaCarrito {
  producto: Producto;
  cantidad: number;
}

@Component({
  selector: 'app-venta-nueva',
  imports: [CurrencyPipe, FormsModule, RouterLink],
  templateUrl: './venta-nueva.component.html'
})
export class VentaNuevaComponent implements OnInit {
  @ViewChild('buscador') buscador?: ElementRef<HTMLInputElement>;

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private toast = inject(ToastService);

  catalogo = signal<Producto[]>([]);
  carrito = signal<LineaCarrito[]>([]);
  texto = signal('');
  cantidad = 1;
  metodoPago = signal<MetodoPago>('EFECTIVO');
  montoRecibido = signal<number | null>(null);
  aviso = signal<string | null>(null);
  error = signal<string | null>(null);
  procesando = signal(false);
  ventaConfirmada = signal<Venta | null>(null);

  sugerencias = computed(() => {
    const t = this.texto().trim().toLowerCase();
    if (!t) return [];
    return this.catalogo()
      .filter(p => p.nombre.toLowerCase().includes(t) || p.codigo.toLowerCase().includes(t))
      .slice(0, 6);
  });

  total = computed(() => this.carrito().reduce((s, l) => s + l.producto.precioVenta * l.cantidad, 0));
  vuelto = computed(() => {
    const m = this.montoRecibido();
    return m == null ? 0 : Math.max(0, m - this.total());
  });
  puedeConfirmar = computed(() => {
    if (this.carrito().length === 0 || this.procesando()) return false;
    if (this.metodoPago() === 'EFECTIVO') {
      const m = this.montoRecibido();
      return m != null && m >= this.total();
    }
    return true;
  });

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  private cargarCatalogo(): void {
    this.productoService.listar().subscribe(p => this.catalogo.set(p));
    setTimeout(() => this.buscador?.nativeElement.focus());
  }

  agregar(p?: Producto): void {
    const producto = p ?? this.sugerencias()[0];
    this.aviso.set(null);
    if (!producto) return;
    const cant = Math.max(1, Math.floor(this.cantidad || 1));
    const enCarrito = this.carrito().find(l => l.producto.id === producto.id)?.cantidad ?? 0;
    if (producto.stock <= 0) {
      this.aviso.set(`${producto.nombre} está agotado.`);
      return;
    }
    if (enCarrito + cant > producto.stock) {
      this.aviso.set(`Stock insuficiente para ${producto.nombre}: disponible ${producto.stock}, en carrito ${enCarrito}.`);
      return;
    }
    if (enCarrito > 0) {
      this.carrito.update(c => c.map(l => l.producto.id === producto.id ? { ...l, cantidad: l.cantidad + cant } : l));
    } else {
      this.carrito.update(c => [...c, { producto, cantidad: cant }]);
    }
    this.limpiarBuscador();
  }

  private limpiarBuscador(): void {
    this.texto.set('');
    this.cantidad = 1;
    if (this.buscador) {
      this.buscador.nativeElement.value = '';
      this.buscador.nativeElement.focus();
    }
  }

  cambiarCantidad(linea: LineaCarrito, valor: number): void {
    const cant = Math.min(Math.max(1, Math.floor(valor || 1)), linea.producto.stock);
    this.carrito.update(c => c.map(l => l.producto.id === linea.producto.id ? { ...l, cantidad: cant } : l));
  }

  quitar(linea: LineaCarrito): void {
    this.carrito.update(c => c.filter(l => l !== linea));
  }

  confirmar(): void {
    if (!this.puedeConfirmar()) return;
    this.procesando.set(true);
    this.error.set(null);
    this.ventaService.registrar({
      items: this.carrito().map(l => ({ productoId: l.producto.id, cantidad: l.cantidad })),
      metodoPago: this.metodoPago(),
      montoRecibido: this.metodoPago() === 'EFECTIVO' ? this.montoRecibido() : null
    }).subscribe({
      next: v => {
        this.ventaConfirmada.set(v);
        this.procesando.set(false);
        this.toast.mostrar(`Venta ${v.numero} registrada por S/ ${v.total.toFixed(2)}`);
      },
      error: (e: HttpErrorResponse) => {
        this.procesando.set(false);
        this.error.set(mensajeError(e));
        this.cargarCatalogo();
      }
    });
  }

  nuevaVenta(): void {
    this.carrito.set([]);
    this.montoRecibido.set(null);
    this.metodoPago.set('EFECTIVO');
    this.ventaConfirmada.set(null);
    this.error.set(null);
    this.cargarCatalogo();
  }
}
