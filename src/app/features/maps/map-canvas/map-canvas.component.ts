import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MapService } from '../map.service';
import { MapData, MapObject, MapZone, ZoneType, FURNITURE_CATALOG, FurnitureCatalogItem } from '../map.model';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';

type EditorTool = 'select' | 'place_furniture' | 'draw_zone' | 'erase';

@Component({
  selector: 'app-map-canvas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map-canvas.component.html',
  styleUrls: ['./map-canvas.component.scss']
})
export class MapCanvasComponent implements OnInit {
  protected readonly mapService = inject(MapService);
  protected readonly workspaceContext = inject(WorkspaceContextService);

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

  public ngOnInit(): void {
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

  public loadMapDetails(mapId: string): void {
    this.mapService.loadMap(mapId).subscribe((map) => {
      this.setLocalMap(map);
    });
  }

  private setLocalMap(map?: MapData | null): void {
    if (!map) return;
    this.draftObjects.set(JSON.parse(JSON.stringify(map.objects || [])));
    this.draftZones.set(JSON.parse(JSON.stringify(map.zones || [])));
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
        const startX = Math.min(start.x, gridX);
        const endX = Math.max(start.x, gridX) + 1;
        const startY = Math.min(start.y, gridY);
        const endY = Math.max(start.y, gridY) + 1;

        const newZone: MapZone = {
          zoneType: this.selectedZoneType(),
          name: this.newZoneName,
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
}
