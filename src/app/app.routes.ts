import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductoListaComponent } from './pages/producto-lista/producto-lista.component';
import { ProductoFormComponent } from './pages/producto-form/producto-form.component';
import { VentaNuevaComponent } from './pages/venta-nueva/venta-nueva.component';
import { VentaListaComponent } from './pages/venta-lista/venta-lista.component';
import { IngresoStockComponent } from './pages/ingreso-stock/ingreso-stock.component';
import { AlertaStockComponent } from './pages/alerta-stock/alerta-stock.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión | BodegaControl' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard | BodegaControl' },
      { path: 'productos', component: ProductoListaComponent, title: 'Productos | BodegaControl' },
      { path: 'productos/nuevo', component: ProductoFormComponent, canActivate: [adminGuard], title: 'Nuevo producto | BodegaControl' },
      { path: 'productos/:id/editar', component: ProductoFormComponent, canActivate: [adminGuard], title: 'Editar producto | BodegaControl' },
      { path: 'ventas/nueva', component: VentaNuevaComponent, title: 'Nueva venta | BodegaControl' },
      { path: 'ventas', component: VentaListaComponent, title: 'Historial de ventas | BodegaControl' },
      { path: 'ingresos', component: IngresoStockComponent, canActivate: [adminGuard], title: 'Ingreso de stock | BodegaControl' },
      { path: 'alertas', component: AlertaStockComponent, title: 'Alertas | BodegaControl' }
    ]
  },
  { path: '**', redirectTo: '' }
];
