import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspacesService } from '../workspaces.service';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { WorkspaceInviteDetailsDto, WorkspaceRole } from '../../../core/workspace/workspace.model';

@Component({
  selector: 'app-invite-accept',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invite-accept.page.html',
  styleUrls: ['./invite-accept.page.scss']
})
export class InviteAcceptPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly workspaceContext = inject(WorkspaceContextService);

  public readonly inviteCode = signal<string>('');
  public readonly inviteDetails = signal<WorkspaceInviteDetailsDto | null>(null);
  public readonly isLoading = signal<boolean>(true);
  public readonly isJoining = signal<boolean>(false);
  public readonly errorMessage = signal<string | null>(null);

  public ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.errorMessage.set('Código de convite não informado.');
      this.isLoading.set(false);
      return;
    }

    this.inviteCode.set(code);
    this.loadInvite(code);
  }

  public loadInvite(code: string): void {
    this.isLoading.set(true);
    this.workspacesService.getInviteDetails(code).subscribe({
      next: details => {
        this.isLoading.set(false);
        this.inviteDetails.set(details);
        if (!details.isValid) {
          this.errorMessage.set(details.errorMessage || 'Convite inválido ou expirado.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Não foi possível carregar as informações do convite.');
      }
    });
  }

  public acceptInvite(): void {
    const code = this.inviteCode();
    if (!code) return;

    this.isJoining.set(true);
    this.errorMessage.set(null);

    this.workspacesService.joinByInvite(code).subscribe({
      next: workspace => {
        this.isJoining.set(false);
        this.workspaceContext.setWorkspace(workspace);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.isJoining.set(false);
        this.errorMessage.set(err.error?.message || 'Falha ao aceitar o convite.');
      }
    });
  }

  public goToLobby(): void {
    this.router.navigate(['/workspaces']);
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
}
