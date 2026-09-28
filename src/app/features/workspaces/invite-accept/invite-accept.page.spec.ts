import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InviteAcceptPage } from './invite-accept.page';
import { WorkspacesService } from '../workspaces.service';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { WorkspaceInviteDetailsDto, WorkspaceRole } from '../../../core/workspace/workspace.model';

describe('InviteAcceptPage', () => {
  let component: InviteAcceptPage;
  let fixture: ComponentFixture<InviteAcceptPage>;
  let workspacesServiceMock: any;
  let routerMock: any;
  let workspaceContextMock: any;

  const mockDetails: WorkspaceInviteDetailsDto = {
    workspaceId: '11111111-1111-1111-1111-111111111111',
    workspaceName: 'Acme Studios',
    workspaceSlug: 'acme-studios',
    role: WorkspaceRole.Member,
    inviterName: 'Alice Admin',
    isValid: true
  };

  beforeEach(async () => {
    workspacesServiceMock = {
      getInviteDetails: (code: string) => of(mockDetails),
      joinByInvite: (code: string) => of({
        id: mockDetails.workspaceId,
        name: mockDetails.workspaceName,
        slug: mockDetails.workspaceSlug,
        createdAt: new Date().toISOString(),
        userRole: mockDetails.role,
        membersCount: 4
      })
    };

    routerMock = {
      navigate: () => Promise.resolve(true)
    };

    workspaceContextMock = {
      setWorkspace: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [InviteAcceptPage],
      providers: [
        { provide: WorkspacesService, useValue: workspacesServiceMock },
        { provide: WorkspaceContextService, useValue: workspaceContextMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'code' ? 'VALID123' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InviteAcceptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load invite details on init', () => {
    expect(component).toBeTruthy();
    expect(component.inviteCode()).toBe('VALID123');
    expect(component.inviteDetails()?.workspaceName).toBe('Acme Studios');
    expect(component.isLoading()).toBe(false);
  });

  it('should accept invite and navigate to dashboard', () => {
    const setWkSpy = vi.spyOn(workspaceContextMock, 'setWorkspace');
    const navSpy = vi.spyOn(routerMock, 'navigate');

    component.acceptInvite();

    expect(setWkSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
