import { Routes } from '@angular/router';
import { RegisterPage } from './pages/register/register.page';

export const routes: Routes = [
  {
    path: 'register',
    component: RegisterPage
  },
  {
    path: '',
    redirectTo: 'register',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'add-movimiento',
    loadComponent: () => import('./pages/add-movimiento/add-movimiento.page').then( m => m.AddMovimientoPage)
  },
  {
    path: 'movimientos',
    loadComponent: () => import('./pages/movimientos/movimientos.page').then( m => m.MovimientosPage)
  }
];