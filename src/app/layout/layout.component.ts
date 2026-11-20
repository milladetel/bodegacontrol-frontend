import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ProductoService } from '../core/api.services';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  auth = inject(AuthService);
  private productoService = inject(ProductoService);
  private router = inject(Router);

  totalAlertas = signal(0);
  menuAbierto = signal(false);

  ngOnInit(): void {
    this.cargarAlertas();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuAbierto.set(false);
      this.cargarAlertas();
    });
  }

  private cargarAlertas(): void {
    this.productoService.alertas().subscribe({ next: a => this.totalAlertas.set(a.length), error: () => {} });
  }
}
