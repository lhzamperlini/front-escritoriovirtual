import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { WorkspaceContextService } from '../../core/workspace/workspace-context.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceDto, WorkspaceRole, WorkspaceInviteDto } from '../../core/workspace/workspace.model';

import { AvatarCustomizerComponent } from '../avatar/avatar-customizer.component';
import { AvatarService } from '../avatar/avatar.service';

type UserStatus = 'available' | 'focus' | 'in_meeting' | 'away';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AvatarCustomizerComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly workspaceContext = inject(WorkspaceContextService);
  protected readonly workspacesService = inject(WorkspacesService);
  protected readonly avatarService = inject(AvatarService);
  private readonly router = inject(Router);

  public readonly isAvatarModalOpen = signal<boolean>(false);

  protected readonly currentStatus = signal<UserStatus>('available');
  protected readonly showClaims = signal<boolean>(false);

  // Workspaces switcher
  public readonly userWorkspaces = signal<WorkspaceDto[]>([]);
  public readonly isSwitcherOpen = signal<boolean>(false);

  // Invite modal
  public readonly isInviteModalOpen = signal<boolean>(false);
  public inviteRole: WorkspaceRole = WorkspaceRole.Member;
  public inviteEmail = '';
  public inviteExpiration = 7;
  public generatedInvite = signal<WorkspaceInviteDto | null>(null);
  public isGeneratingInvite = signal<boolean>(false);
  public inviteCopied = signal<boolean>(false);
  public inviteError = signal<string | null>(null);

  public ngOnInit(): void {
    this.loadWorkspacesAndInit();
  }

  public loadWorkspacesAndInit(): void {
    this.workspacesService.getUserWorkspaces().subscribe({
      next: workspaces => {
        this.userWorkspaces.set(workspaces);
        if (workspaces.length === 0) {
          this.router.navigate(['/workspaces']);
          return;
        }

        const current = this.workspaceContext.currentWorkspace();
        if (!current) {
          this.workspaceContext.setWorkspace(workspaces[0]);
        } else {
          // Refresh current workspace info if changed
          const fresh = workspaces.find(w => w.id === current.id);
          if (fresh) {
            this.workspaceContext.setWorkspace(fresh);
          } else {
            this.workspaceContext.setWorkspace(workspaces[0]);
          }
        }
      },
      error: () => {
        // Handle error silently or navigate to workspaces
      }
    });
  }

  public toggleSwitcher(): void {
    this.isSwitcherOpen.update(v => !v);
  }

  public selectWorkspace(ws: WorkspaceDto): void {
    this.workspaceContext.setWorkspace(ws);
    this.isSwitcherOpen.set(false);
  }

  public goToLobby(): void {
    this.router.navigate(['/workspaces']);
  }

  public setStatus(status: UserStatus): void {
    this.currentStatus.set(status);
  }

  public toggleClaims(): void {
    this.showClaims.update(v => !v);
  }

  public openInviteModal(): void {
    this.inviteRole = WorkspaceRole.Member;
    this.inviteEmail = '';
    this.inviteExpiration = 7;
    this.generatedInvite.set(null);
    this.inviteCopied.set(false);
    this.inviteError.set(null);
    this.isInviteModalOpen.set(true);
  }

  public closeInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  public generateInvite(): void {
    const ws = this.workspaceContext.currentWorkspace();
    if (!ws) return;

    this.isGeneratingInvite.set(true);
    this.inviteError.set(null);

    this.workspacesService.createInvite(ws.id, this.inviteRole, this.inviteEmail, this.inviteExpiration).subscribe({
      next: invite => {
        this.isGeneratingInvite.set(false);
        this.generatedInvite.set(invite);
      },
      error: err => {
        this.isGeneratingInvite.set(false);
        this.inviteError.set(err.error?.message || 'Falha ao gerar o convite.');
      }
    });
  }

  public getInviteFullUrl(code: string): string {
    return `${window.location.origin}/invite/${code}`;
  }

  public copyInviteUrl(): void {
    const invite = this.generatedInvite();
    if (!invite) return;

    const url = this.getInviteFullUrl(invite.code);
    navigator.clipboard.writeText(url).then(() => {
      this.inviteCopied.set(true);
      setTimeout(() => this.inviteCopied.set(false), 2500);
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

  public openAvatarCustomizer(): void {
    this.isAvatarModalOpen.set(true);
  }

  public closeAvatarCustomizer(): void {
    this.isAvatarModalOpen.set(false);
  }

  public logout(): void {
    this.workspaceContext.clearWorkspace();
    this.authService.logout();
  }
}
