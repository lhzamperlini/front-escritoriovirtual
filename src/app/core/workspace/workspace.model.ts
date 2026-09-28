export enum WorkspaceRole {
  Owner = 1,
  Admin = 2,
  Member = 3,
  Guest = 4
}

export interface WorkspaceDto {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  userRole?: WorkspaceRole;
  membersCount: number;
}

export interface WorkspaceMemberDto {
  userId: string;
  fullName: string;
  email: string;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceInviteDto {
  id: string;
  workspaceId: string;
  workspaceName: string;
  code: string;
  email?: string;
  role: WorkspaceRole;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface WorkspaceInviteDetailsDto {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  role: WorkspaceRole;
  inviterName: string;
  isValid: boolean;
  errorMessage?: string;
}
