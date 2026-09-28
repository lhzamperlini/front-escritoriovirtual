import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { OfficeHubService } from '../../core/signalr/office-hub.service';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let hubServiceMock: any;

  beforeEach(() => {
    hubServiceMock = {
      channelMessage$: new Subject<any>(),
      proximityMessage$: new Subject<any>(),
      sendProximityMessage: vi.fn().mockResolvedValue(undefined)
    };

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: OfficeHubService, useValue: hubServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isDrawerOpen()).toBe(false);
  });

  it('should toggle drawer state', () => {
    service.toggleDrawer();
    expect(service.isDrawerOpen()).toBe(true);
    service.toggleDrawer();
    expect(service.isDrawerOpen()).toBe(false);
  });

  it('should load channels and select first', () => {
    const mockChannels = [
      { id: 'ch-1', workspaceId: 'ws-1', channelType: 'Global' as const, name: '#geral', createdAt: '', memberCount: 5 }
    ];

    service.loadChannels('ws-1').subscribe();

    const req = httpMock.expectOne('/api/chat/workspaces/ws-1/channels');
    expect(req.request.method).toBe('GET');
    req.flush(mockChannels);

    // Auto-select first channel triggers messages load
    const msgReq = httpMock.expectOne('/api/chat/channels/ch-1/messages');
    expect(msgReq.request.method).toBe('GET');
    msgReq.flush([]);

    expect(service.channels().length).toBe(1);
    expect(service.activeChannelId()).toBe('ch-1');
  });

  it('should receive proximity message bubble and store with 6s expiry', () => {
    hubServiceMock.proximityMessage$.next({
      senderId: 'user-1',
      senderName: 'Bob',
      text: 'Olá pessoal!',
      x: 100,
      y: 100
    });

    const bubbles = service.proximityBubbles();
    expect(bubbles.length).toBe(1);
    expect(bubbles[0].senderName).toBe('Bob');
    expect(bubbles[0].text).toBe('Olá pessoal!');
    expect(bubbles[0].expiresAt).toBeGreaterThan(Date.now());
  });

  it('should receive real-time channel message and append to active messages', () => {
    service.activeChannelId.set('ch-active');

    hubServiceMock.channelMessage$.next({
      channelId: 'ch-active',
      message: {
        id: 'msg-1',
        channelId: 'ch-active',
        senderId: 'u-1',
        senderName: 'Alice',
        content: 'Novas atualizações!',
        createdAt: new Date().toISOString(),
        isRead: false
      }
    });

    expect(service.activeMessages().length).toBe(1);
    expect(service.activeMessages()[0].content).toBe('Novas atualizações!');
  });
});
