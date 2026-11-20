import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastService } from './core/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast show align-items-center text-bg-{{ t.tipo }} border-0 mb-2" role="alert">
          <div class="d-flex">
            <div class="toast-body">{{ t.mensaje }}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" (click)="toastService.cerrar(t.id)"></button>
          </div>
        </div>
      }
    </div>
  `
})
export class AppComponent {
  toastService = inject(ToastService);
}
