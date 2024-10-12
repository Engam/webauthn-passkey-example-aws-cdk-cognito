import { Routes } from '@angular/router';
import { authenticationGuard } from './guards/authentication.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./routes/home-route/home-route.component').then(c => c.HomeRouteComponent), canActivate: [authenticationGuard] },
  { path: 'login', loadComponent: () => import('./routes/login-route/login-route.component').then(c => c.LoginRouteComponent) },
];
