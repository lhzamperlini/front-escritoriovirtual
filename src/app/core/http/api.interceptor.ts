import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { WorkspaceContextService } from '../workspace/workspace-context.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const workspaceContext = inject(WorkspaceContextService);
  const activeWorkspaceId = workspaceContext.activeWorkspaceId();

  let headers = req.headers;
  if (activeWorkspaceId && !headers.has('X-Workspace-Id')) {
    headers = headers.set('X-Workspace-Id', activeWorkspaceId);
  }

  const reqWithCredentials = req.clone({
    headers,
    withCredentials: true
  });

  return next(reqWithCredentials);
};
