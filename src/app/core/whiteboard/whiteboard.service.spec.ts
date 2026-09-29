import { TestBed } from '@angular/core/testing';
import { WhiteboardService } from './whiteboard.service';
import { OfficeHubService } from '../signalr/office-hub.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Subject } from 'rxjs';

describe('WhiteboardService', () => {
  let service: WhiteboardService;
  let httpMock: HttpTestingController;
  let mockHubService: any;

  beforeEach(() => {
    mockHubService = {
      whiteboardUpdated$: new Subject(),
      broadcastWhiteboardUpdate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WhiteboardService,
        { provide: OfficeHubService, useValue: mockHubService }
      ]
    });

    service = TestBed.inject(WhiteboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isModalOpen()).toBe(false);
  });

  it('openWhiteboard should open modal and fetch board from API', () => {
    service.openWhiteboard('ws-1', 'zone-1');
    expect(service.isModalOpen()).toBe(true);
    expect(service.activeZoneId()).toBe('zone-1');

    const req = httpMock.expectOne('/api/workspaces/ws-1/whiteboards?zoneId=zone-1');
    expect(req.request.method).toBe('GET');

    req.flush({
      id: 'board-1',
      workspaceId: 'ws-1',
      zoneId: 'zone-1',
      name: 'Quadro da Sala',
      documentData: '{"elements": []}',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    expect(service.activeBoard()?.id).toBe('board-1');
  });

  it('saveSnapshot should send PUT request and update activeBoard', () => {
    service.saveSnapshot('board-1', '{"elements": [{"type":"pen"}]}').subscribe((updated) => {
      expect(updated.id).toBe('board-1');
      expect(service.activeBoard()?.documentData).toBe('{"elements": [{"type":"pen"}]}');
    });

    const req = httpMock.expectOne('/api/whiteboards/board-1');
    expect(req.request.method).toBe('PUT');
    req.flush({
      id: 'board-1',
      workspaceId: 'ws-1',
      name: 'Quadro da Sala',
      documentData: '{"elements": [{"type":"pen"}]}',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
  });

  it('broadcastPatch should call hubService.broadcastWhiteboardUpdate', () => {
    const patch = { action: 'clear' as const };
    service.broadcastPatch('zone-1', patch);
    expect(mockHubService.broadcastWhiteboardUpdate).toHaveBeenCalledWith('zone-1', patch);
  });

  it('incoming whiteboardUpdated event should emit through deltaReceived$', () => {
    let received: any = null;
    service.deltaReceived$.subscribe(val => received = val);

    mockHubService.whiteboardUpdated$.next({
      zoneId: 'zone-1',
      patch: { action: 'clear' }
    });

    expect(received).toEqual({
      zoneId: 'zone-1',
      patch: { action: 'clear' }
    });
  });
});
