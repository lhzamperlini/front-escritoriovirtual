import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { MapCanvasComponent } from './map-canvas.component';
import { MapService } from '../map.service';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { ChatService } from '../../chat/chat.service';
import { WebRtcService } from '../../../core/webrtc/webrtc.service';
import { WhiteboardService } from '../../../core/whiteboard/whiteboard.service';
import { FURNITURE_CATALOG } from '../map.model';

describe('MapCanvasComponent', () => {
  let component: MapCanvasComponent;
  let fixture: ComponentFixture<MapCanvasComponent>;
  let mapService: MapService;

  beforeEach(async () => {
    const mockChatService = {
      isDrawerOpen: signal(false),
      channels: signal([]),
      activeChannelId: signal(null),
      activeMessages: signal([]),
      unreadCounts: signal({}),
      proximityBubbles: signal([]),
      activeChannel: signal(null),
      totalUnread: signal(0),
      loadChannels: () => of([]),
      selectChannel: () => of([]),
      sendMessage: () => of(null),
      sendProximity: () => Promise.resolve(),
      openDirectChat: () => of(null),
      joinZoneChat: () => of(null),
      toggleDrawer: () => {},
      openDrawer: () => {},
      closeDrawer: () => {}
    };

    const mockWebRtcService = {
      activeRoomName: signal(null),
      isMicMuted: signal(false),
      isCameraOff: signal(true),
      isScreenSharing: signal(false),
      peers: signal([]),
      visiblePeers: signal([]),
      nearbyVideoPeers: signal([]),
      activeScreenShares: signal([]),
      requestToken: () => of({ token: 't', roomName: 'r', liveKitUrl: 'url', identity: 'id', fullName: 'fn' }),
      updatePeerProximity: () => {},
      toggleMic: () => {},
      toggleCamera: () => {},
      toggleScreenShare: () => {}
    };

    const mockWhiteboardService = {
      isModalOpen: signal(false),
      activeBoard: signal(null),
      activeZoneId: signal(null),
      isSaving: signal(false),
      deltaReceived$: new Subject(),
      openWhiteboard: vi.fn(),
      closeWhiteboard: vi.fn(),
      saveSnapshot: () => of(null),
      broadcastPatch: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [MapCanvasComponent],
      providers: [
        MapService,
        WorkspaceContextService,
        { provide: ChatService, useValue: mockChatService },
        { provide: WebRtcService, useValue: mockWebRtcService },
        { provide: WhiteboardService, useValue: mockWhiteboardService },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapCanvasComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it('should create MapCanvasComponent', () => {
    expect(component).toBeTruthy();
    expect(component.activeTool()).toBe('select');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditMode()).toBe(false);
    component.toggleEdit();
    expect(component.isEditMode()).toBe(true);
  });

  it('should adjust zoom levels', () => {
    const initial = component.zoom();
    component.zoomIn();
    expect(component.zoom()).toBeGreaterThan(initial);
    component.zoomOut();
    expect(component.zoom()).toBe(initial);
  });

  it('should change tools and furniture selection', () => {
    component.setTool('place_furniture');
    expect(component.activeTool()).toBe('place_furniture');

    component.setFurniture(FURNITURE_CATALOG[1]);
    expect(component.selectedFurniture().id).toBe(FURNITURE_CATALOG[1].id);
  });

  it('should rotate furniture', () => {
    expect(component.selectedRotation()).toBe(0);
    component.rotateFurniture();
    expect(component.selectedRotation()).toBe(90);
  });

  it('should place furniture on grid click when tool is place_furniture', () => {
    component.toggleEdit();
    component.setTool('place_furniture');
    component.onGridCellClick(15, 20);

    const objects = component.draftObjects();
    expect(objects.length).toBeGreaterThan(0);
    expect(objects[objects.length - 1].coordX).toBe(15);
    expect(objects[objects.length - 1].coordY).toBe(20);
  });

  it('should change user status', () => {
    component.presenceService.currentMapId.set('map-1');
    component.presenceService.myPresence.set({
      userId: 'test-user',
      mapId: 'map-1',
      x: 32,
      y: 32,
      gridX: 1,
      gridY: 1,
      status: 'available',
      lastHeartbeat: Date.now()
    });

    component.changeUserStatus('focus');
    expect(component.presenceService.myPresence()?.status).toBe('focus');
  });

  it('should handle keyboard navigation WASD', () => {
    component.presenceService.currentMapId.set('map-1');
    component.presenceService.myPresence.set({
      userId: 'test-user',
      mapId: 'map-1',
      x: 32,
      y: 32,
      gridX: 1,
      gridY: 1,
      status: 'available',
      lastHeartbeat: Date.now()
    });

    const keyEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
    component.onKeyDown(keyEvent);

    expect(component.presenceService.myPresence()?.gridX).toBe(2);
    expect(component.presenceService.myPresence()?.x).toBe(64);
  });

  it('should block movement into locked MeetingRoom and trigger knock prompt', () => {
    component.presenceService.currentMapId.set('map-1');
    component.presenceService.myPresence.set({
      userId: 'test-user',
      mapId: 'map-1',
      x: 32,
      y: 32,
      gridX: 1,
      gridY: 1,
      status: 'available',
      lastHeartbeat: Date.now()
    });

    component.draftZones.set([
      {
        name: 'Sala Diretoria',
        zoneType: 'MeetingRoom',
        startX: 2,
        startY: 1,
        endX: 5,
        endY: 5
      }
    ]);

    // Lock the room
    component.roomAccessService.lockedRooms.set(new Map([['Sala Diretoria', { isLocked: true }]]));

    const keyEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
    component.onKeyDown(keyEvent);

    // Movement blocked: avatar stays at gridX 1
    expect(component.presenceService.myPresence()?.gridX).toBe(1);
    expect(component.roomAccessService.activeKnockPrompt()?.zoneName).toBe('Sala Diretoria');
  });

  it('should allow movement into locked MeetingRoom if user is Owner/Admin', () => {
    component.presenceService.currentMapId.set('map-1');
    component.presenceService.myPresence.set({
      userId: 'test-user',
      mapId: 'map-1',
      x: 32,
      y: 32,
      gridX: 1,
      gridY: 1,
      status: 'available',
      lastHeartbeat: Date.now()
    });

    component.draftZones.set([
      {
        name: 'Sala Diretoria',
        zoneType: 'MeetingRoom',
        startX: 2,
        startY: 1,
        endX: 5,
        endY: 5
      }
    ]);

    // Lock the room
    component.roomAccessService.lockedRooms.set(new Map([['Sala Diretoria', { isLocked: true }]]));

    // User is Admin
    component.workspaceContext.setWorkspace({
      id: 'ws-1',
      name: 'Workspace Test',
      slug: 'ws-test',
      userRole: 1 as any, // Owner
      membersCount: 5,
      createdAt: new Date().toISOString()
    });

    const keyEvent = new KeyboardEvent('keydown', { code: 'KeyD' });
    component.onKeyDown(keyEvent);

    // Master Key: avatar enters room
    expect(component.presenceService.myPresence()?.gridX).toBe(2);
  });
});
