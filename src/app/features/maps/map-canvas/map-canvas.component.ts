import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../map.service';
import { MapData, MapObject, MapZone, ZoneType, FURNITURE_CATALOG, FurnitureCatalogItem } from '../map.model';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { PresenceService, PresenceState } from '../../../core/presence/presence.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../chat/chat.service';
import { ChatDrawerComponent } from '../../chat/chat-drawer/chat-drawer.component';
import { WebRtcService } from '../../../core/webrtc/webrtc.service';
import { ProximityVideoDockComponent } from '../../webrtc/proximity-video-dock/proximity-video-dock.component';
import { RoomAccessService } from '../../../core/rooms/room-access.service';
import { WhiteboardService } from '../../../core/whiteboard/whiteboard.service';
import { WhiteboardModalComponent } from '../../whiteboard/whiteboard-modal/whiteboard-modal.component';

type EditorTool = 'select' | 'place_furniture' | 'draw_zone' | 'erase';

@Component({
  selector: 'app-map-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatDrawerComponent, ProximityVideoDockComponent, WhiteboardModalComponent],
  templateUrl: './map-canvas.component.html',
  styleUrls: ['./map-canvas.component.scss']
})
export class MapCanvasComponent implements OnInit, OnDestroy {
  protected readonly mapService = inject(MapService);
  public readonly workspaceContext = inject(WorkspaceContextService);
  public readonly presenceService = inject(PresenceService);
  protected readonly authService = inject(AuthService);
  public readonly chatService = inject(ChatService);
  public readonly webrtcService = inject(WebRtcService);
  public readonly roomAccessService = inject(RoomAccessService);
  public readonly whiteboardService = inject(WhiteboardService);

  @ViewChild('viewport', { static: true }) viewportRef!: ElementRef<HTMLDivElement>;

  // Map state
  public readonly currentMap = this.mapService.currentMap;
  public readonly isEditMode = this.mapService.isEditMode;
  public readonly isSaving = this.mapService.isSaving;

  // Viewport navigation
  public readonly zoom = signal<number>(1);
  public readonly panX = signal<number>(0);
  public readonly panY = signal<number>(0);
  public isPanning = false;
  private startPanMouseX = 0;
  private startPanMouseY = 0;

  // Editor Tools
  public readonly activeTool = signal<EditorTool>('select');
  public readonly selectedFurniture = signal<FurnitureCatalogItem>(FURNITURE_CATALOG[0]);
  public readonly selectedRotation = signal<number>(0);
  public readonly selectedZoneType = signal<ZoneType>('Desk');
  public newZoneName = 'Nova Mesa Alpha';

  // Zone drawing temporary state
  public zoneDragStart = signal<{ x: number; y: number } | null>(null);

  // Local draft layout (objects & zones)
  public readonly draftObjects = signal<MapObject[]>([]);
  public readonly draftZones = signal<MapZone[]>([]);
  public readonly selectedEntity = signal<{ type: 'object' | 'zone'; item: any } | null>(null);

  // Tiled import modal
  public readonly isTiledModalOpen = signal<boolean>(false);
  public tiledJsonInput = '';
  public tiledError = signal<string | null>(null);

  public readonly furnitureCatalog = FURNITURE_CATALOG;

  public readonly statusList = [
    { id: 'available', label: 'Disponível', color: '#10b981', icon: '🟢' },
    { id: 'focus', label: 'Foco / Não Perturbe', color: '#f59e0b', icon: '🎯' },
    { id: 'busy', label: 'Ocupado', color: '#ef4444', icon: '🔴' },
    { id: 'away', label: 'Ausente', color: '#94a3b8', icon: '🌙' }
  ];

  constructor() {
    effect(() => {
      const my = this.presenceService.myPresence();
      const remotes = this.presenceService.remoteUsers();
      if (my) {
        this.webrtcService.updatePeerProximity(
          { x: my.x, y: my.y },
          remotes.map(r => ({ userId: r.userId, fullName: r.fullName || 'Colega', x: r.x, y: r.y }))
        );
      }
    });
  }

  public ngOnInit(): void {
    const user = this.authService.currentUser();
    const userId = (user?.claims?.['sub'] as string) || (user?.email) || 'my-user';
    this.presenceService.myUserId.set(userId);

    const ws = this.workspaceContext.currentWorkspace();
    if (ws) {
      this.mapService.loadWorkspaceMaps(ws.id).subscribe((maps) => {
        if (maps.length > 0) {
          this.loadMapDetails(maps[0].id);
        } else {
          // Cria o primeiro mapa padrão para o workspace
          this.mapService.createMap(ws.id, 'Sede Virtual 01').subscribe((newMap) => {
            this.setLocalMap(newMap);
          });
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.presenceService.leaveMap();
  }

  public loadMapDetails(mapId: string): void {
    this.mapService.loadMap(mapId).subscribe((map) => {
      this.setLocalMap(map);
    });
  }

  private setLocalMap(map?: MapData | null): void {
    if (!map) return;
    this.draftObjects.set(JSON.parse(JSON.stringify(map.objects || [])));
    this.draftZones.set(JSON.parse(JSON.stringify(map.zones || [])));

    const ws = this.workspaceContext.currentWorkspace();
    if (ws) {
      this.presenceService.joinMap(ws.id, map.id, 320, 320);
      this.webrtcService.requestToken(ws.id, map.id).subscribe();
    }
  }

  public setTool(tool: EditorTool): void {
    this.activeTool.set(tool);
    this.selectedEntity.set(null);
    this.zoneDragStart.set(null);
  }

  public setFurniture(item: FurnitureCatalogItem): void {
    this.selectedFurniture.set(item);
    this.activeTool.set('place_furniture');
  }

  public rotateFurniture(): void {
    const next = (this.selectedRotation() + 90) % 360;
    this.selectedRotation.set(next);
  }

  public setZoneType(type: ZoneType): void {
    this.selectedZoneType.set(type);
    this.newZoneName = type === 'Desk' ? 'Ilha de Trabalho' : type === 'MeetingRoom' ? 'Sala Privada' : type === 'Lounge' ? 'Área Lounge' : 'Ponto de Spawn';
    this.activeTool.set('draw_zone');
  }

  public onGridClick(event: MouseEvent): void {
    if (!this.isEditMode()) return;
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / this.zoom();
    const clickY = (event.clientY - rect.top) / this.zoom();
    const gridX = Math.max(0, Math.floor(clickX / 32));
    const gridY = Math.max(0, Math.floor(clickY / 32));
    this.onGridCellClick(gridX, gridY);
  }

  public onGridCellClick(gridX: number, gridY: number): void {
    if (!this.isEditMode()) return;

    const tool = this.activeTool();

    if (tool === 'place_furniture') {
      const furn = this.selectedFurniture();
      const newObj: MapObject = {
        assetId: furn.id,
        coordX: gridX,
        coordY: gridY,
        rotation: this.selectedRotation(),
        isSolid: furn.isSolid,
        zIndexOffset: 0
      };
      this.draftObjects.update(list => [...list, newObj]);
    } else if (tool === 'draw_zone') {
      const start = this.zoneDragStart();
      if (!start) {
        this.zoneDragStart.set({ x: gridX, y: gridY });
      } else {
        let startX = Math.min(start.x, gridX);
        let endX = Math.max(start.x, gridX) + 1;
        let startY = Math.min(start.y, gridY);
        let endY = Math.max(start.y, gridY) + 1;

        // Se o clique for muito pequeno ou no mesmo tile, expande para o tamanho mínimo utilizável (4x3 tiles)
        if (endX - startX < 2) endX = startX + 4;
        if (endY - startY < 2) endY = startY + 3;

        const count = this.draftZones().length + 1;
        const baseName = this.newZoneName || (this.selectedZoneType() === 'Desk' ? 'Ilha de Trabalho' : 'Sala');
        const uniqueName = `${baseName} ${count}`;

        const newZone: MapZone = {
          zoneType: this.selectedZoneType(),
          name: uniqueName,
          startX,
          startY,
          endX,
          endY,
          capacity: this.selectedZoneType() === 'Desk' ? 4 : this.selectedZoneType() === 'MeetingRoom' ? 8 : null
        };

        this.draftZones.update(list => [...list, newZone]);
        this.zoneDragStart.set(null);
      }
    }
  }

  public removeObject(obj: MapObject, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeTool() === 'erase' || this.isEditMode()) {
      this.draftObjects.update(list => list.filter(o => o !== obj));
    }
  }

  public removeZone(zone: MapZone, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeTool() === 'erase' || this.isEditMode()) {
      this.draftZones.update(list => list.filter(z => z !== zone));
    }
  }

  public saveLayout(): void {
    const map = this.currentMap();
    if (!map) return;

    this.mapService.saveMapLayout(map.id, this.draftObjects(), this.draftZones()).subscribe({
      next: (updated) => {
        this.setLocalMap(updated);
        alert('Layout salvo com sucesso!');
      },
      error: () => {
        alert('Erro ao salvar layout do mapa.');
      }
    });
  }

  public toggleEdit(): void {
    this.mapService.toggleEditMode();
    if (!this.isEditMode()) {
      this.activeTool.set('select');
      this.selectedEntity.set(null);
    }
  }

  // Zoom controls
  public zoomIn(): void {
    this.zoom.update(z => Math.min(z + 0.2, 2.5));
  }

  public zoomOut(): void {
    this.zoom.update(z => Math.max(z - 0.2, 0.4));
  }

  public resetZoom(): void {
    this.zoom.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }

  // Mouse pan handlers
  public onMouseDown(e: MouseEvent): void {
    if (e.button === 1 || (e.button === 0 && !this.isEditMode())) {
      this.isPanning = true;
      this.startPanMouseX = e.clientX - this.panX();
      this.startPanMouseY = e.clientY - this.panY();
    }
  }

  public onMouseMove(e: MouseEvent): void {
    if (this.isPanning) {
      this.panX.set(e.clientX - this.startPanMouseX);
      this.panY.set(e.clientY - this.startPanMouseY);
    }
  }

  public onMouseUp(): void {
    this.isPanning = false;
  }

  public getFurnitureIcon(assetId: string): string {
    const item = this.furnitureCatalog.find(f => f.id === assetId);
    return item?.icon || '📦';
  }

  public openTiledModal(): void {
    this.isTiledModalOpen.set(true);
    this.tiledJsonInput = '';
    this.tiledError.set(null);
  }

  public closeTiledModal(): void {
    this.isTiledModalOpen.set(false);
  }

  public submitTiledImport(): void {
    const map = this.currentMap();
    if (!map) return;

    try {
      JSON.parse(this.tiledJsonInput);
    } catch {
      this.tiledError.set('Formato JSON inválido.');
      return;
    }

    this.mapService.importTiled(map.id, this.tiledJsonInput).subscribe({
      next: (updated) => {
        this.setLocalMap(updated);
        this.closeTiledModal();
        alert('Mapa Tiled importado com sucesso!');
      },
      error: () => {
        this.tiledError.set('Erro ao importar dados do Tiled.');
      }
    });
  }

  public changeUserStatus(status: string): void {
    this.presenceService.setStatus(status);
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    if (this.isEditMode() || this.isTiledModalOpen()) return;

    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    let dx = 0;
    let dy = 0;
    let direction = 'down';

    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        dy = -1;
        direction = 'up';
        break;
      case 'KeyS':
      case 'ArrowDown':
        dy = 1;
        direction = 'down';
        break;
      case 'KeyA':
      case 'ArrowLeft':
        dx = -1;
        direction = 'left';
        break;
      case 'KeyD':
      case 'ArrowRight':
        dx = 1;
        direction = 'right';
        break;
      default:
        return;
    }

    event.preventDefault();

    const myPres = this.presenceService.myPresence();
    if (!myPres) return;

    const map = this.currentMap();
    const maxX = (map?.gridWidth || 100) - 1;
    const maxY = (map?.gridHeight || 100) - 1;

    const nextGridX = Math.max(0, Math.min(myPres.gridX + dx, maxX));
    const nextGridY = Math.max(0, Math.min(myPres.gridY + dy, maxY));

    // Collision check against solid objects
    const isSolid = this.draftObjects().some(
      o => o.coordX === nextGridX && o.coordY === nextGridY && o.isSolid
    );

    if (isSolid) {
      return;
    }

    // US02 / US03 / US04: Checagem de colisão física com sala privada trancada
    const currentZone = this.draftZones().find(
      z => myPres.gridX >= z.startX && myPres.gridX < z.endX && myPres.gridY >= z.startY && myPres.gridY < z.endY
    );
    const targetZone = this.draftZones().find(
      z => nextGridX >= z.startX && nextGridX < z.endX && nextGridY >= z.startY && nextGridY < z.endY
    );

    if (targetZone && targetZone !== currentZone && targetZone.zoneType === 'MeetingRoom') {
      const zoneId = this.getZoneId(targetZone);
      const isOwnerOrAdmin = this.workspaceContext.isOwnerOrAdmin();
      const myId = this.presenceService.myUserId() || '';
      const canEnter = this.roomAccessService.canEnterRoom(zoneId, isOwnerOrAdmin, myId);

      if (!canEnter) {
        // Bloqueio físico na porta da sala trancada (US02 / US03)
        this.roomAccessService.activeKnockPrompt.set({ zoneId, zoneName: targetZone.name });
        return;
      }
    }

    const nextX = nextGridX * 32;
    const nextY = nextGridY * 32;

    this.presenceService.moveStart(direction);
    this.presenceService.moveStop(nextX, nextY, nextGridX, nextGridY);

    // Auto-detect zone entry for contextual zone chat (US02) & WebRTC dedicated room (US01)
    const enteredZone = targetZone;
    if (enteredZone && (enteredZone as any).id) {
      const ws = this.workspaceContext.currentWorkspace();
      if (ws) {
        this.chatService.joinZoneChat(ws.id, (enteredZone as any).id, enteredZone.name).subscribe();
        this.webrtcService.requestToken(ws.id, map!.id, (enteredZone as any).id, enteredZone.zoneType).subscribe();
      }
    }
  }

  public getZoneId(zone: MapZone): string {
    return (zone as any).id || zone.name;
  }

  public toggleRoomLock(zone: MapZone, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    const map = this.currentMap();
    if (!map) return;
    const zoneId = this.getZoneId(zone);
    const isLocked = this.roomAccessService.isRoomLocked(zoneId);
    this.roomAccessService.toggleRoomLock(map.id, zoneId, isLocked);
  }

  public knockOnDoor(): void {
    const prompt = this.roomAccessService.activeKnockPrompt();
    if (!prompt) return;
    const myPres = this.presenceService.myPresence();
    const applicantName = myPres?.fullName || 'Visitante';
    this.roomAccessService.knock(prompt.zoneId, applicantName);
  }

  public cancelKnock(): void {
    this.roomAccessService.activeKnockPrompt.set(null);
  }

  public proximityInput = '';

  public sendProximityChatMessage(): void {
    const text = this.proximityInput.trim();
    const map = this.currentMap();
    const my = this.presenceService.myPresence();
    if (!text || !map || !my) return;

    this.chatService.sendProximity(map.id, text, my.x, my.y);
    this.proximityInput = '';
  }

  public toggleChatDrawer(): void {
    this.chatService.toggleDrawer();
  }

  public openWhiteboard(zone?: MapZone): void {
    const ws = this.workspaceContext.currentWorkspace();
    if (!ws) return;
    const zoneId = zone ? this.getZoneId(zone) : (this.currentMap()?.id || 'global-board');
    this.whiteboardService.openWhiteboard(ws.id, zoneId);
  }
}
