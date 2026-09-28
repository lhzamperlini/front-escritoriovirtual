import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/login/login.routes').then(m => m.loginRoutes)
  },
  {
    path: 'workspaces',
    canActivate: [authGuard],
    loadChildren: () => import('./features/workspaces/workspaces.routes').then(m => m.workspacesRoutes)
  },
  {
    path: 'invite/:code',
    canActivate: [authGuard],
    loadComponent: () => import('./features/workspaces/invite-accept/invite-accept.page').then(m => m.InviteAcceptPage)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
