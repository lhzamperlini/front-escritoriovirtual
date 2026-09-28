import { TestBed } from '@angular/core/testing';
import { PresenceService } from './presence.service';
import { OfficeHubService } from '../signalr/office-hub.service';
import { of, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PresenceService', () => {
  let service: PresenceService;
  let hubServiceMock: any;

  beforeEach(() => {
    hubServiceMock = {
      isConnected: { set: vi.fn(), get: () => true },
      currentMapPresences$: new Subject<any[]>(),
      userJoined$: new Subject<any>(),
      userLeft$: new Subject<string>(),
      userMoved$: new Subject<any>(),
      statusChanged$: new Subject<any>(),
      avatarUpdated$: new Subject<any>(),
      startConnection: vi.fn().mockResolvedValue(undefined),
      joinMap: vi.fn().mockResolvedValue(undefined),
      leaveMap: vi.fn().mockResolvedValue(undefined),
      moveStart: vi.fn().mockResolvedValue(undefined),
      moveStop: vi.fn().mockResolvedValue(undefined),
      changeStatus: vi.fn().mockResolvedValue(undefined),
      heartbeat: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      providers: [
        PresenceService,
        { provide: OfficeHubService, useValue: hubServiceMock }
      ]
    });

    service = TestBed.inject(PresenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should join map and initialize presence', async () => {
    await service.joinMap('ws-1', 'map-1', 100, 200);

    expect(hubServiceMock.joinMap).toHaveBeenCalledWith('ws-1', 'map-1', 100, 200);
    expect(service.currentMapId()).toBe('map-1');
    expect(service.myPresence()?.x).toBe(100);
    expect(service.myPresence()?.y).toBe(200);

    service.stopHeartbeat();
  });

  it('should update remote users when userJoined$ fires', () => {
    service.myUserId.set('user-local');

    hubServiceMock.userJoined$.next({
      userId: 'user-remote',
      fullName: 'Remote Colleague',
      mapId: 'map-1',
      x: 64,
      y: 96,
      gridX: 2,
      gridY: 3,
      status: 'available',
      lastHeartbeat: 123456
    });

    const remotes = service.remoteUsers();
    expect(remotes.length).toBe(1);
    expect(remotes[0].userId).toBe('user-remote');
    expect(remotes[0].fullName).toBe('Remote Colleague');
  });

  it('should remove user when userLeft$ fires', () => {
    hubServiceMock.userJoined$.next({
      userId: 'user-to-leave',
      mapId: 'map-1',
      x: 0,
      y: 0,
      gridX: 0,
      gridY: 0,
      status: 'available',
      lastHeartbeat: 123456
    });

    expect(service.allUsers().length).toBe(1);

    hubServiceMock.userLeft$.next('user-to-leave');
    expect(service.allUsers().length).toBe(0);
  });

  it('should update movement when userMoved$ fires', () => {
    hubServiceMock.userJoined$.next({
      userId: 'user-moving',
      mapId: 'map-1',
      x: 32,
      y: 32,
      gridX: 1,
      gridY: 1,
      status: 'available',
      lastHeartbeat: 123456
    });

    hubServiceMock.userMoved$.next({
      userId: 'user-moving',
      x: 64,
      y: 64,
      gridX: 2,
      gridY: 2,
      direction: 'right',
      isMoving: false
    });

    const user = service.allUsers().find(u => u.userId === 'user-moving');
    expect(user?.x).toBe(64);
    expect(user?.direction).toBe('right');
  });
});
