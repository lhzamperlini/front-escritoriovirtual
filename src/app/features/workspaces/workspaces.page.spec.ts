import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkspacesPage } from './workspaces.page';
import { WorkspacesService } from './workspaces.service';
import { AuthService } from '../../core/auth/auth.service';
import { WorkspaceContextService } from '../../core/workspace/workspace-context.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { WorkspaceDto, WorkspaceRole } from '../../core/workspace/workspace.model';

describe('WorkspacesPage', () => {
  let component: WorkspacesPage;
  let fixture: ComponentFixture<WorkspacesPage>;
  let workspacesServiceMock: any;
  let routerMock: any;
  let workspaceContextMock: any;
  let authServiceMock: any;

  const mockWorkspaces: WorkspaceDto[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Empresa Principal',
      slug: 'empresa-principal',
      createdAt: new Date().toISOString(),
      userRole: WorkspaceRole.Owner,
      membersCount: 5
    }
  ];

  beforeEach(async () => {
    workspacesServiceMock = {
      getUserWorkspaces: () => of(mockWorkspaces),
      createWorkspace: (name: string, slug?: string) => of({
        id: '22222222-2222-2222-2222-222222222222',
        name,
        slug: slug || 'novo',
        createdAt: new Date().toISOString(),
        userRole: WorkspaceRole.Owner,
        membersCount: 1
      }),
      joinByInvite: (code: string) => of({
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Workspace Convite',
        slug: 'convite',
        createdAt: new Date().toISOString(),
        userRole: WorkspaceRole.Member,
        membersCount: 2
      })
    };

    routerMock = {
      navigate: () => Promise.resolve(true)
    };

    workspaceContextMock = {
      setWorkspace: () => {},
      clearWorkspace: () => {},
      currentWorkspace: () => null
    };

    authServiceMock = {
      currentUser: () => ({ name: 'Test User', email: 'test@example.com' }),
      logout: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [WorkspacesPage],
      providers: [
        { provide: WorkspacesService, useValue: workspacesServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: WorkspaceContextService, useValue: workspaceContextMock },
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspacesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load workspaces on init', () => {
    expect(component).toBeTruthy();
    expect(component.workspaces().length).toBe(1);
    expect(component.workspaces()[0].name).toBe('Empresa Principal');
  });

  it('should filter workspaces by search term', () => {
    component.searchTerm.set('Principal');
    expect(component.filteredWorkspaces().length).toBe(1);

    component.searchTerm.set('Inexistente');
    expect(component.filteredWorkspaces().length).toBe(0);
  });

  it('should generate slug on name change', () => {
    component.newWorkspaceName = 'Café & Tecnologia Ltda';
    component.onNameChange();
    expect(component.newWorkspaceSlug).toBe('cafe-tecnologia-ltda');
  });

  it('should select workspace and navigate to dashboard', () => {
    const navSpy = vi.spyOn(routerMock, 'navigate');
    const setWkSpy = vi.spyOn(workspaceContextMock, 'setWorkspace');

    component.selectWorkspace(mockWorkspaces[0]);

    expect(setWkSpy).toHaveBeenCalledWith(mockWorkspaces[0]);
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
