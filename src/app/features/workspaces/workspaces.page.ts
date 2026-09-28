import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { WorkspaceContextService } from '../../core/workspace/workspace-context.service';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDto, WorkspaceRole } from '../../core/workspace/workspace.model';

@Component({
  selector: 'app-workspaces',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workspaces.page.html',
  styleUrls: ['./workspaces.page.scss']
})
export class WorkspacesPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly workspaceContext = inject(WorkspaceContextService);
  protected readonly workspacesService = inject(WorkspacesService);
  private readonly router = inject(Router);

  public readonly workspaces = signal<WorkspaceDto[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly searchTerm = signal<string>('');

  // Modals state
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isJoinModalOpen = signal<boolean>(false);

  // Form states
  public newWorkspaceName = '';
  public newWorkspaceSlug = '';
  public inviteCode = '';
  public formError = signal<string | null>(null);
  public isSubmitting = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadWorkspaces();
  }

  public loadWorkspaces(): void {
    this.isLoading.set(true);
    this.workspacesService.getUserWorkspaces().subscribe({
      next: list => {
        this.workspaces.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public filteredWorkspaces(): WorkspaceDto[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.workspaces();
    return this.workspaces().filter(w =>
      w.name.toLowerCase().includes(term) || w.slug.toLowerCase().includes(term)
    );
  }

  public selectWorkspace(workspace: WorkspaceDto): void {
    this.workspaceContext.setWorkspace(workspace);
    this.router.navigate(['/dashboard']);
  }

  public openCreateModal(): void {
    this.newWorkspaceName = '';
    this.newWorkspaceSlug = '';
    this.formError.set(null);
    this.isCreateModalOpen.set(true);
  }

  public closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
    this.formError.set(null);
  }

  public onNameChange(): void {
    this.newWorkspaceSlug = this.newWorkspaceName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  public submitCreateWorkspace(): void {
    if (!this.newWorkspaceName.trim()) {
      this.formError.set('O nome do Workspace é obrigatório.');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.workspacesService.createWorkspace(this.newWorkspaceName, this.newWorkspaceSlug).subscribe({
      next: created => {
        this.isSubmitting.set(false);
        this.closeCreateModal();
        this.selectWorkspace(created);
      },
      error: err => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Falha ao criar o Workspace. Verifique se o slug já está em uso.';
        this.formError.set(msg);
      }
    });
  }

  public openJoinModal(): void {
    this.inviteCode = '';
    this.formError.set(null);
    this.isJoinModalOpen.set(true);
  }

  public closeJoinModal(): void {
    this.isJoinModalOpen.set(false);
    this.formError.set(null);
  }

  public submitJoinWorkspace(): void {
    if (!this.inviteCode.trim()) {
      this.formError.set('Por favor, informe o código do convite.');
      return;
    }

    this.isSubmitting.set(true);
    this.formError.set(null);

    this.workspacesService.joinByInvite(this.inviteCode.trim()).subscribe({
      next: workspace => {
        this.isSubmitting.set(false);
        this.closeJoinModal();
        this.selectWorkspace(workspace);
      },
      error: err => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Convite inválido ou expirado.';
        this.formError.set(msg);
      }
    });
  }

  public getRoleName(role?: WorkspaceRole): string {
    switch (role) {
      case WorkspaceRole.Owner: return 'Proprietário';
      case WorkspaceRole.Admin: return 'Administrador';
      case WorkspaceRole.Member: return 'Membro';
      case WorkspaceRole.Guest: return 'Convidado';
      default: return 'Membro';
    }
  }

  public logout(): void {
    this.workspaceContext.clearWorkspace();
    this.authService.logout();
  }
}
