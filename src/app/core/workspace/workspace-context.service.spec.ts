import { TestBed } from '@angular/core/testing';
import { WorkspaceContextService } from './workspace-context.service';
import { WorkspaceDto, WorkspaceRole } from './workspace.model';

describe('WorkspaceContextService', () => {
  let service: WorkspaceContextService;

  const mockWorkspace: WorkspaceDto = {
    id: '9f074d81-807e-4ee2-bb53-61fc0f8d1672',
    name: 'Tech Corp',
    slug: 'tech-corp',
    createdAt: new Date().toISOString(),
    userRole: WorkspaceRole.Owner,
    membersCount: 3
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceContextService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created and start with null when storage is empty', () => {
    expect(service).toBeTruthy();
    expect(service.currentWorkspace()).toBeNull();
    expect(service.activeWorkspaceId()).toBeNull();
  });

  it('should set workspace and update signals', () => {
    service.setWorkspace(mockWorkspace);

    expect(service.currentWorkspace()).toEqual(mockWorkspace);
    expect(service.activeWorkspaceId()).toBe(mockWorkspace.id);
    expect(service.isOwnerOrAdmin()).toBe(true);
  });

  it('should clear workspace and update storage', () => {
    service.setWorkspace(mockWorkspace);
    expect(service.currentWorkspace()).not.toBeNull();

    service.clearWorkspace();
    expect(service.currentWorkspace()).toBeNull();
    expect(service.activeWorkspaceId()).toBeNull();
  });
});
