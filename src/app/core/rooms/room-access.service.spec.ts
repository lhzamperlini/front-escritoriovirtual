import { TestBed } from '@angular/core/testing';
import { RoomAccessService } from './room-access.service';
import { OfficeHubService } from '../signalr/office-hub.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Subject } from 'rxjs';

describe('RoomAccessService', () => {
  let service: RoomAccessService;
  let mockHubService: any;

  beforeEach(() => {
    mockHubService = {
      roomLockToggled$: new Subject(),
      knockRequested$: new Subject(),
      knockResponded$: new Subject(),
      toggleRoomLock: vi.fn(),
      knockRoom: vi.fn(),
      respondKnock: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        RoomAccessService,
        { provide: OfficeHubService, useValue: mockHubService }
      ]
    });

    service = TestBed.inject(RoomAccessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('canEnterRoom should return true when room is not locked', () => {
    const canEnter = service.canEnterRoom('zone-1', false, 'user-123');
    expect(canEnter).toBe(true);
  });

  it('canEnterRoom should return true for Admin/Owner even if room is locked (Master Key)', () => {
    mockHubService.roomLockToggled$.next({ zoneId: 'zone-1', isLocked: true, lockedByUserId: 'host-1' });

    const canEnter = service.canEnterRoom('zone-1', true, 'visitor-1');
    expect(canEnter).toBe(true);
  });

  it('canEnterRoom should return false for regular user when room is locked', () => {
    mockHubService.roomLockToggled$.next({ zoneId: 'zone-1', isLocked: true, lockedByUserId: 'host-1' });

    const canEnter = service.canEnterRoom('zone-1', false, 'visitor-1');
    expect(canEnter).toBe(false);
  });

  it('canEnterRoom should return true if user is the host who locked the room', () => {
    mockHubService.roomLockToggled$.next({ zoneId: 'zone-1', isLocked: true, lockedByUserId: 'host-1' });

    const canEnter = service.canEnterRoom('zone-1', false, 'host-1');
    expect(canEnter).toBe(true);
  });

  it('canEnterRoom should return true after knock is approved', () => {
    mockHubService.roomLockToggled$.next({ zoneId: 'zone-1', isLocked: true, lockedByUserId: 'host-1' });
    mockHubService.knockResponded$.next({ zoneId: 'zone-1', approved: true });

    const canEnter = service.canEnterRoom('zone-1', false, 'visitor-1');
    expect(canEnter).toBe(true);
  });

  it('toggleRoomLock should invoke hubService and update state', () => {
    service.toggleRoomLock('map-1', 'zone-1', false);
    expect(mockHubService.toggleRoomLock).toHaveBeenCalledWith('map-1', 'zone-1', true);
    expect(service.isRoomLocked('zone-1')).toBe(true);
  });

  it('respondKnock should notify hub and remove knock request from list', () => {
    mockHubService.knockRequested$.next({ zoneId: 'zone-1', applicantUserId: 'guest-1', applicantName: 'Carlos' });
    expect(service.incomingKnocks().length).toBe(1);

    service.respondKnock('zone-1', 'guest-1', true);
    expect(mockHubService.respondKnock).toHaveBeenCalledWith('zone-1', 'guest-1', true);
    expect(service.incomingKnocks().length).toBe(0);
  });
});
