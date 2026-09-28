import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WorkspaceDto,
  WorkspaceMemberDto,
  WorkspaceInviteDto,
  WorkspaceInviteDetailsDto,
  WorkspaceRole
} from '../../core/workspace/workspace.model';

@Injectable({
  providedIn: 'root'
})
export class WorkspacesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/workspaces';

  public getUserWorkspaces(): Observable<WorkspaceDto[]> {
    return this.http.get<WorkspaceDto[]>(this.baseUrl);
  }

  public getWorkspaceById(id: string): Observable<WorkspaceDto> {
    return this.http.get<WorkspaceDto>(`${this.baseUrl}/${id}`);
  }

  public getWorkspaceBySlug(slug: string): Observable<WorkspaceDto> {
    return this.http.get<WorkspaceDto>(`${this.baseUrl}/slug/${slug}`);
  }

  public createWorkspace(name: string, slug?: string): Observable<WorkspaceDto> {
    return this.http.post<WorkspaceDto>(this.baseUrl, {
      name: name.trim(),
      slug: slug?.trim() || null
    });
  }

  public getMembers(workspaceId: string): Observable<WorkspaceMemberDto[]> {
    return this.http.get<WorkspaceMemberDto[]>(`${this.baseUrl}/${workspaceId}/members`);
  }

  public createInvite(
    workspaceId: string,
    role: WorkspaceRole = WorkspaceRole.Member,
    email?: string,
    expirationDays: number = 7
  ): Observable<WorkspaceInviteDto> {
    return this.http.post<WorkspaceInviteDto>(`${this.baseUrl}/${workspaceId}/invites`, {
      role,
      email: email?.trim() || null,
      expirationDays
    });
  }

  public getInviteDetails(code: string): Observable<WorkspaceInviteDetailsDto> {
    return this.http.get<WorkspaceInviteDetailsDto>(`${this.baseUrl}/invites/${encodeURIComponent(code)}`);
  }

  public joinByInvite(code: string): Observable<WorkspaceDto> {
    return this.http.post<WorkspaceDto>(`${this.baseUrl}/invites/${encodeURIComponent(code)}/join`, {});
  }

  public updateMemberRole(workspaceId: string, userId: string, role: WorkspaceRole): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${workspaceId}/members/${userId}/role`, { role });
  }

  public removeMember(workspaceId: string, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${workspaceId}/members/${userId}`);
  }
}
