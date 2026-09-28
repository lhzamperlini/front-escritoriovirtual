import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { WorkspacesService } from './workspaces.service';
import { WorkspaceDto, WorkspaceRole } from '../../core/workspace/workspace.model';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let httpMock: HttpTestingController;

  const mockWorkspace: WorkspaceDto = {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Escritório Alfa',
    slug: 'escritorio-alfa',
    createdAt: new Date().toISOString(),
    userRole: WorkspaceRole.Owner,
    membersCount: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WorkspacesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(WorkspacesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch user workspaces', () => {
    service.getUserWorkspaces().subscribe(workspaces => {
      expect(workspaces.length).toBe(1);
      expect(workspaces[0]).toEqual(mockWorkspace);
    });

    const req = httpMock.expectOne('/api/workspaces');
    expect(req.request.method).toBe('GET');
    req.flush([mockWorkspace]);
  });

  it('should create a workspace', () => {
    service.createWorkspace('Escritório Alfa', 'escritorio-alfa').subscribe(created => {
      expect(created).toEqual(mockWorkspace);
    });

    const req = httpMock.expectOne('/api/workspaces');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Escritório Alfa', slug: 'escritorio-alfa' });
    req.flush(mockWorkspace);
  });

  it('should join workspace by invite code', () => {
    service.joinByInvite('INVITE123').subscribe(workspace => {
      expect(workspace).toEqual(mockWorkspace);
    });

    const req = httpMock.expectOne('/api/workspaces/invites/INVITE123/join');
    expect(req.request.method).toBe('POST');
    req.flush(mockWorkspace);
  });
});
