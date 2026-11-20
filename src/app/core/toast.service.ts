import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  tipo: 'success' | 'danger' | 'warning' | 'info';
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  mostrar(mensaje: string, tipo: Toast['tipo'] = 'success'): void {
    const id = ++this.seq;
    this.toasts.update(t => [...t, { id, tipo, mensaje }]);
    setTimeout(() => this.cerrar(id), 4000);
  }

  cerrar(id: number): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }
}
