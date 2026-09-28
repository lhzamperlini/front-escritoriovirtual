import { Routes } from '@angular/router';

export const workspacesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workspaces.page').then(m => m.WorkspacesPage)
  },
  {
    path: 'join/:code',
    loadComponent: () => import('./invite-accept/invite-accept.page').then(m => m.InviteAcceptPage)
  }
];
