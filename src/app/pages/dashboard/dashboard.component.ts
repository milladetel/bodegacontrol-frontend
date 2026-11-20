import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService, mensajeError } from '../../core/api.services';
import { AuthService } from '../../core/auth.service';
import { Dashboard } from '../../core/models';
import { EstadoBadgeComponent } from '../../shared/estado-badge.component';

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, RouterLink, EstadoBadgeComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  auth = inject(AuthService);

  datos = signal<Dashboard | null>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.dashboardService.resumen().subscribe({
      next: d => this.datos.set(d),
      error: (e: HttpErrorResponse) => this.error.set(mensajeError(e))
    });
  }
}
