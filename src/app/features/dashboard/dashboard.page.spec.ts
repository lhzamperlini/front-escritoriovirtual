import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';
import { AuthService } from '../../core/auth/auth.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { WorkspaceContextService } from '../../core/workspace/workspace-context.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UserProfile } from '../../core/auth/user-profile.model';
import { WorkspaceDto, WorkspaceRole } from '../../core/workspace/workspace.model';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  let workspacesServiceMock: any;
  let workspaceContextMock: any;
  let routerMock: any;

  const mockProfile: UserProfile = {
    isAuthenticated: true,
    name: 'Desenvolvedor Belmiro',
    email: 'belmiro@curitiba.pr.gov.br',
    claims: { sub: '123-abc' }
  };

  const mockWorkspace: WorkspaceDto = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Matriz Digital',
    slug: 'matriz-digital',
    createdAt: new Date().toISOString(),
    userRole: WorkspaceRole.Owner,
    membersCount: 3
  };

  const mockAuthService = {
    currentUser: signal<UserProfile | null>(mockProfile),
    isAuthenticated: signal(true),
    isLoading: signal(false),
    checkAuth: () => of(mockProfile),
    logout: () => {}
  };

  beforeEach(async () => {
    workspacesServiceMock = {
      getUserWorkspaces: () => of([mockWorkspace]),
      createInvite: () => of({
        id: 'inv-1',
        workspaceId: mockWorkspace.id,
        workspaceName: mockWorkspace.name,
        code: 'INV123',
        role: WorkspaceRole.Member,
        createdAt: new Date().toISOString(),
        isActive: true
      })
    };

    workspaceContextMock = {
      currentWorkspace: signal<WorkspaceDto | null>(mockWorkspace),
      activeWorkspaceId: signal<string | null>(mockWorkspace.id),
      isOwnerOrAdmin: signal<boolean>(true),
      setWorkspace: vi.fn(),
      clearWorkspace: vi.fn()
    };

    routerMock = {
      navigate: vi.fn(() => Promise.resolve(true))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: WorkspacesService, useValue: workspacesServiceMock },
        { provide: WorkspaceContextService, useValue: workspaceContextMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dashboard page', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle claims visibility', () => {
    expect(component['showClaims']()).toBe(false);
    component.toggleClaims();
    expect(component['showClaims']()).toBe(true);
  });

  it('should change user status', () => {
    component.setStatus('focus');
    expect(component['currentStatus']()).toBe('focus');
  });

  it('should toggle workspace switcher', () => {
    expect(component.isSwitcherOpen()).toBe(false);
    component.toggleSwitcher();
    expect(component.isSwitcherOpen()).toBe(true);
  });

  it('should generate invite and set generatedInvite signal', () => {
    component.openInviteModal();
    expect(component.isInviteModalOpen()).toBe(true);

    component.generateInvite();
    expect(component.generatedInvite()?.code).toBe('INV123');
  });
});
