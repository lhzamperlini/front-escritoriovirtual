import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../map.service';
import { 
  MapData, 
  MapObject, 
  MapZone, 
  ZoneType, 
  FURNITURE_CATALOG, 
  FurnitureCatalogItem, 
  FurnitureCategory, 
  getFurnitureAssetDetails,
  DEFAULT_OFFICE_ZONES,
  DEFAULT_OFFICE_OBJECTS
} from '../map.model';
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
import { PipoyaSpriteComponent } from '../../../shared/components/pipoya-sprite/pipoya-sprite.component';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';
import { AvatarService } from '../../avatar/avatar.service';

type EditorTool = 'select' | 'place_furniture' | 'draw_zone' | 'erase';

@Component({
  selector: 'app-map-canvas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ChatDrawerComponent, 
    ProximityVideoDockComponent, 
    WhiteboardModalComponent,
    PipoyaSpriteComponent,
    LucideIconComponent
  ],
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
  protected readonly avatarService = inject(AvatarService);

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
  public wasDraggingPan = false;

  // Editor Tools & Catálogo WorkAdventure
  public readonly activeTool = signal<EditorTool>('select');
  public readonly furnitureCatalog = FURNITURE_CATALOG;
  public readonly activeFurnitureCategory = signal<FurnitureCategory>('desks');
  public readonly selectedFurniture = signal<FurnitureCatalogItem>(FURNITURE_CATALOG[0]);
  public readonly selectedRotation = signal<number>(0); // 0 (Down), 90 (Right), 180 (Up), 270 (Left)
  public readonly selectedZoneType = signal<ZoneType>('Desk');
  public newZoneName = 'Mesa Alpha';

  // Preview dinâmico sob o cursor
  public readonly hoverGridX = signal<number | null>(null);
  public readonly hoverGridY = signal<number | null>(null);

  // Click-to-Move
  public readonly targetClickMarker = signal<{ x: number; y: number } | null>(null);
  private moveInterval: any = null;

  // Itens da categoria ativa
  public readonly currentCategoryItems = computed(() => {
    return this.furnitureCatalog.filter(f => f.category === this.activeFurnitureCategory());
  });

  // Zone drawing temporary state
  public zoneDragStart = signal<{ x: number; y: number } | null>(null);

  // Local draft layout (objects & zones)
  public readonly draftObjects = signal<MapObject[]>([]);
  public readonly draftZones = signal<MapZone[]>([]);
  public readonly selectedEntity = signal<{ type: 'object' | 'zone'; item: any } | null>(null);

  // Zona ativa atual sob os pés do usuário
  public readonly currentActiveZone = computed<MapZone | null>(() => {
    const my = this.presenceService.myPresence();
    if (!my) return null;
    const zones = this.draftZones();
    return zones.find(z => my.gridX >= z.startX && my.gridX < z.endX && my.gridY >= z.startY && my.gridY < z.endY) || null;
  });

  // Contagem de colegas próximos (raio de 6 tiles)
  public readonly nearbyPeers = computed<PresenceState[]>(() => {
    const my = this.presenceService.myPresence();
    if (!my) return [];
    return this.presenceService.remoteUsers().filter(r => {
      const distTiles = Math.hypot(r.gridX - my.gridX, r.gridY - my.gridY);
      return distTiles <= 6;
    });
  });

  // Tiled import modal
  public readonly isTiledModalOpen = signal<boolean>(false);
  public tiledJsonInput = '';
  public tiledError = signal<string | null>(null);

  public readonly statusList = [
    { id: 'available', label: 'Disponível', color: '#10b981', icon: 'check' },
    { id: 'focus', label: 'Foco / Não Perturbe', color: '#f59e0b', icon: 'sparkles' },
    { id: 'busy', label: 'Ocupado', color: '#ef4444', icon: 'minus' },
    { id: 'away', label: 'Ausente', color: '#94a3b8', icon: 'circle' }
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
    const userId = user?.id 
      || (user?.claims?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] as string)
      || (user?.claims?.['sub'] as string) 
      || user?.email 
      || 'my-user';
    this.presenceService.myUserId.set(userId);

    const ws = this.workspaceContext.currentWorkspace();
    if (ws) {
      this.mapService.loadWorkspaceMaps(ws.id).subscribe((maps) => {
        if (maps.length > 0) {
          this.loadMapDetails(maps[0].id);
        } else {
          this.mapService.createMap(ws.id, 'Sede Virtual 01').subscribe((newMap) => {
            this.setLocalMap(newMap);
          });
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.presenceService.leaveMap();
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
    }
  }

  public loadMapDetails(mapId: string): void {
    this.mapService.loadMap(mapId).subscribe((map) => {
      this.setLocalMap(map);
    });
  }

  public normalizeZoneType(type: any): ZoneType {
    if (typeof type === 'number') {
      const mapping: ZoneType[] = ['Desk', 'MeetingRoom', 'Spawn', 'Lounge'];
      return mapping[type] || 'Desk';
    }
    return (type as ZoneType) || 'Desk';
  }

  private setLocalMap(map?: MapData | null): void {
    if (!map) return;
    let objects = map.objects || [];
    let zones = map.zones || [];

    // Se o mapa for novo ou for o rascunho de teste antigo, substitui automaticamente pelo Cenário Corporativo Completo
    const isOldTestLayout = objects.length <= 4 && zones.some(z => z.name?.includes('Ponto de') || z.name?.includes('Alpha') || z.name?.includes('Reunião 1'));
    if ((objects.length === 0 && zones.length === 0) || isOldTestLayout) {
      objects = JSON.parse(JSON.stringify(DEFAULT_OFFICE_OBJECTS));
      zones = JSON.parse(JSON.stringify(DEFAULT_OFFICE_ZONES));
      this.mapService.saveMapLayout(map.id, objects, zones).subscribe();
    }

    this.draftObjects.set(JSON.parse(JSON.stringify(objects)));
    const normalizedZones: MapZone[] = zones.map(z => ({
      ...z,
      zoneType: this.normalizeZoneType(z.zoneType)
    }));
    this.draftZones.set(normalizedZones);

    const ws = this.workspaceContext.currentWorkspace();
    if (ws) {
      // Ponto de spawn inicial na Recepção (grid 5, 5 = pixels 160, 160)
      this.presenceService.joinMap(ws.id, map.id, 160, 160);
      this.webrtcService.requestToken(ws.id, map.id).subscribe();
    }

    setTimeout(() => this.centerOnOffice(), 150);
  }

  public applyOfficialCorporatePreset(): void {
    const map = this.currentMap();
    if (!map) return;
    const objects = JSON.parse(JSON.stringify(DEFAULT_OFFICE_OBJECTS));
    const zones = JSON.parse(JSON.stringify(DEFAULT_OFFICE_ZONES));
    this.draftObjects.set(objects);
    const normalizedZones = zones.map((z: any) => ({
      ...z,
      zoneType: this.normalizeZoneType(z.zoneType)
    }));
    this.draftZones.set(normalizedZones);
    this.mapService.saveMapLayout(map.id, objects, zones).subscribe({
      next: (updatedMap) => {
        this.setLocalMap(updatedMap);
        this.centerOnOffice();
      }
    });
  }

  public centerOnOffice(): void {
    if (!this.viewportRef?.nativeElement) return;
    const rect = this.viewportRef.nativeElement.getBoundingClientRect();
    const officeCenterX = 16 * 32; // ~512px
    const officeCenterY = 10 * 32; // ~320px
    const currentZoom = this.zoom();
    this.panX.set(Math.round(rect.width / 2 - officeCenterX * currentZoom));
    this.panY.set(Math.round(rect.height / 2 - officeCenterY * currentZoom));
  }

  public setTool(tool: EditorTool): void {
    this.activeTool.set(tool);
    this.selectedEntity.set(null);
    this.zoneDragStart.set(null);
  }

  public setFurnitureCategory(cat: FurnitureCategory): void {
    this.activeFurnitureCategory.set(cat);
    const firstOfCat = this.furnitureCatalog.find(f => f.category === cat);
    if (firstOfCat) {
      this.selectedFurniture.set(firstOfCat);
    }
    this.activeTool.set('place_furniture');
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

  public onGridMouseMove(event: MouseEvent): void {
    if (!this.isEditMode()) {
      this.hoverGridX.set(null);
      this.hoverGridY.set(null);
      return;
    }
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / this.zoom();
    const clickY = (event.clientY - rect.top) / this.zoom();
    const gx = Math.max(0, Math.floor(clickX / 32));
    const gy = Math.max(0, Math.floor(clickY / 32));
    this.hoverGridX.set(gx);
    this.hoverGridY.set(gy);
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

  // --- Click-to-Move Funcional ---
  public onFloorClick(event: MouseEvent): void {
    if (this.isEditMode()) return;
    if (this.wasDraggingPan) {
      this.wasDraggingPan = false;
      return;
    }

    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) / this.zoom();
    const clickY = (event.clientY - rect.top) / this.zoom();
    const targetGridX = Math.max(0, Math.floor(clickX / 32));
    const targetGridY = Math.max(0, Math.floor(clickY / 32));

    this.moveToGrid(targetGridX, targetGridY);
  }

  public moveToGrid(targetGridX: number, targetGridY: number): void {
    const my = this.presenceService.myPresence();
    if (!my) return;

    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
    }

    this.targetClickMarker.set({ x: targetGridX * 32, y: targetGridY * 32 });

    this.moveInterval = setInterval(() => {
      const current = this.presenceService.myPresence();
      if (!current) {
        clearInterval(this.moveInterval);
        this.targetClickMarker.set(null);
        return;
      }

      const diffX = targetGridX - current.gridX;
      const diffY = targetGridY - current.gridY;

      if (diffX === 0 && diffY === 0) {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
        setTimeout(() => this.targetClickMarker.set(null), 300);
        return;
      }

      let stepDx = 0;
      let stepDy = 0;
      let dir = 'down';

      if (Math.abs(diffX) >= Math.abs(diffY)) {
        stepDx = diffX > 0 ? 1 : -1;
        dir = stepDx > 0 ? 'right' : 'left';
      } else {
        stepDy = diffY > 0 ? 1 : -1;
        dir = stepDy > 0 ? 'down' : 'up';
      }

      const nextGridX = current.gridX + stepDx;
      const nextGridY = current.gridY + stepDy;

      // Colisão com sólidos
      const isBlocked = this.draftObjects().some(o => o.coordX === nextGridX && o.coordY === nextGridY && o.isSolid);
      if (isBlocked) {
        clearInterval(this.moveInterval);
        this.moveInterval = null;
        this.targetClickMarker.set(null);
        return;
      }

      this.stepPlayer(nextGridX, nextGridY, dir);
    }, 140);
  }

  public stepPlayer(nextGridX: number, nextGridY: number, direction: string): void {
    const nextX = nextGridX * 32;
    const nextY = nextGridY * 32;

    this.presenceService.moveStart(direction);
    this.presenceService.moveStop(nextX, nextY, nextGridX, nextGridY);

    // Auto-detect zone
    const targetZone = this.draftZones().find(
      z => nextGridX >= z.startX && nextGridX < z.endX && nextGridY >= z.startY && nextGridY < z.endY
    );
    if (targetZone && (targetZone as any).id) {
      const ws = this.workspaceContext.currentWorkspace();
      const map = this.currentMap();
      if (ws && map) {
        this.chatService.joinZoneChat(ws.id, (targetZone as any).id, targetZone.name).subscribe();
        this.webrtcService.requestToken(ws.id, map.id, (targetZone as any).id, targetZone.zoneType).subscribe();
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

    const sanitizedZones = this.draftZones().map(z => ({
      ...z,
      zoneType: this.normalizeZoneType(z.zoneType)
    }));

    this.mapService.saveMapLayout(map.id, this.draftObjects(), sanitizedZones).subscribe({
      next: (updatedMap) => {
        this.setLocalMap(updatedMap);
        this.mapService.toggleEditMode();
      },
      error: (err) => {
        console.error('Erro ao salvar layout do mapa:', err);
      }
    });
  }

  public toggleEdit(): void {
    this.mapService.toggleEditMode();
    this.activeTool.set('select');
    this.zoneDragStart.set(null);
    this.hoverGridX.set(null);
    this.hoverGridY.set(null);
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.targetClickMarker.set(null);
    }
  }

  public changeUserStatus(status: string): void {
    this.presenceService.setStatus(status);
  }

  public zoomIn(): void {
    this.zoom.update(z => Math.min(z + 0.25, 2.5));
  }

  public zoomOut(): void {
    this.zoom.update(z => Math.max(z - 0.25, 0.5));
  }

  public resetZoom(): void {
    this.zoom.set(1);
    this.centerOnOffice();
  }

  public onMouseDown(event: MouseEvent): void {
    if (this.isEditMode() && this.activeTool() !== 'select') return;
    if (event.button === 0 || event.button === 1) {
      this.isPanning = true;
      this.wasDraggingPan = false;
      this.startPanMouseX = event.clientX - this.panX();
      this.startPanMouseY = event.clientY - this.panY();
    }
  }

  public onMouseMove(event: MouseEvent): void {
    if (this.isPanning) {
      const movedX = Math.abs(event.clientX - this.panX() - this.startPanMouseX);
      const movedY = Math.abs(event.clientY - this.panY() - this.startPanMouseY);
      if (movedX > 4 || movedY > 4) {
        this.wasDraggingPan = true;
      }
      this.panX.set(event.clientX - this.startPanMouseX);
      this.panY.set(event.clientY - this.startPanMouseY);
    }
  }

  public onMouseUp(): void {
    this.isPanning = false;
  }

  public getFurnitureImage(assetId: string, rotation: number = 0): string {
    return getFurnitureAssetDetails(assetId, rotation).imageUrl;
  }

  public getFurnitureWidth(assetId: string): number {
    return getFurnitureAssetDetails(assetId).widthTiles;
  }

  public getFurnitureHeight(assetId: string): number {
    return getFurnitureAssetDetails(assetId).heightTiles;
  }

  public getUserCharacterModel(user: PresenceState): string {
    return user.avatarConfig?.characterModel || 'Male_01-1.png';
  }

  public getMyCharacterModel(): string {
    return this.avatarService.currentAvatar().characterModel || 'Male_01-1.png';
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
      this.mapService.importTiled(map.id, this.tiledJsonInput).subscribe({
        next: (updatedMap: MapData) => {
          this.setLocalMap(updatedMap);
          this.closeTiledModal();
        },
        error: (err: any) => {
          this.tiledError.set(err.error?.message || 'Falha ao importar Tiled JSON');
        }
      });
    } catch (e: any) {
      this.tiledError.set('JSON inválido: ' + e.message);
    }
  }

  @HostListener('window:keydown', ['$event'])
  public onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }

    // Tecla R: rotaciona mobília em modo de construção
    if (this.isEditMode() && (event.code === 'KeyR' || event.key === 'r' || event.key === 'R')) {
      this.rotateFurniture();
      return;
    }

    // Tecla E ou Espaço: interação com zona / sala atual
    if (!this.isEditMode() && (event.code === 'KeyE' || event.code === 'Space')) {
      event.preventDefault();
      const zone = this.currentActiveZone();
      if (zone) {
        if (zone.zoneType === 'MeetingRoom') {
          this.openWhiteboard(zone);
        } else {
          this.chatService.openDrawer();
        }
      }
      return;
    }

    if (this.isEditMode() || this.isTiledModalOpen()) return;

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

    // Se o usuário usou o teclado, cancela o click-to-move em andamento
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
      this.moveInterval = null;
      this.targetClickMarker.set(null);
    }

    const myPres = this.presenceService.myPresence();
    if (!myPres) return;

    const map = this.currentMap();
    const maxX = (map?.gridWidth || 100) - 1;
    const maxY = (map?.gridHeight || 100) - 1;

    const nextGridX = Math.max(0, Math.min(myPres.gridX + dx, maxX));
    const nextGridY = Math.max(0, Math.min(myPres.gridY + dy, maxY));

    // Colisão contra móveis sólidos
    const isSolid = this.draftObjects().some(
      o => o.coordX === nextGridX && o.coordY === nextGridY && o.isSolid
    );

    if (isSolid) {
      return;
    }

    // Bloqueio de porta em sala privada trancada
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
        this.roomAccessService.activeKnockPrompt.set({ zoneId, zoneName: targetZone.name });
        return;
      }
    }

    this.stepPlayer(nextGridX, nextGridY, direction);
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
