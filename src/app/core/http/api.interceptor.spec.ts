import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './api.interceptor';
import { HttpClient } from '@angular/common/http';
import { WorkspaceContextService } from '../workspace/workspace-context.service';
import { WorkspaceRole } from '../workspace/workspace.model';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let workspaceContext: WorkspaceContextService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        WorkspaceContextService
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    workspaceContext = TestBed.inject(WorkspaceContextService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should add withCredentials to true', () => {
    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.has('X-Workspace-Id')).toBe(false);
  });

  it('should add X-Workspace-Id header when workspace is selected', () => {
    const workspaceId = '9f074d81-807e-4ee2-bb53-61fc0f8d1672';
    workspaceContext.setWorkspace({
      id: workspaceId,
      name: 'Acme',
      slug: 'acme',
      createdAt: new Date().toISOString(),
      userRole: WorkspaceRole.Member,
      membersCount: 2
    });

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.headers.get('X-Workspace-Id')).toBe(workspaceId);
  });
});
