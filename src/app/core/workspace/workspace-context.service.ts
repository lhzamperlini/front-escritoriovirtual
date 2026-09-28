import { Injectable, signal, computed } from '@angular/core';
import { WorkspaceDto, WorkspaceRole } from './workspace.model';

const STORAGE_KEY = 'ev_active_workspace';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceContextService {
  private readonly _currentWorkspace = signal<WorkspaceDto | null>(this.loadFromStorage());

  public readonly currentWorkspace = computed(() => this._currentWorkspace());
  public readonly activeWorkspaceId = computed(() => this._currentWorkspace()?.id ?? null);
  public readonly isOwnerOrAdmin = computed(() => {
    const role = this._currentWorkspace()?.userRole;
    return role === WorkspaceRole.Owner || role === WorkspaceRole.Admin;
  });

  public setWorkspace(workspace: WorkspaceDto): void {
    this._currentWorkspace.set(workspace);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // Storage unavailable or disabled
    }
  }

  public clearWorkspace(): void {
    this._currentWorkspace.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
  }

  private loadFromStorage(): WorkspaceDto | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }
}
