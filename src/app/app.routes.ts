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
  }
];


// import { Routes } from '@angular/router';

// export const routes: Routes = [
//   {
//     path: 'home',
//     loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
//   },
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full',
//   },
//   {
//     path: '',
//     redirectTo: 'register',
//     pathMatch: 'full',
//     // path: 'register',
//     // loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage)
//   },
// ];
