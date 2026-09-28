export type ZoneType = 'Desk' | 'MeetingRoom' | 'Spawn' | 'Lounge';

export interface MapObject {
  id?: string;
  mapId?: string;
  assetId: string;
  coordX: number;
  coordY: number;
  rotation: number;
  isSolid: boolean;
  zIndexOffset: number;
}

export interface MapZone {
  id?: string;
  mapId?: string;
  zoneType: ZoneType;
  name: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  capacity?: number | null;
}

export interface MapData {
  id: string;
  workspaceId: string;
  name: string;
  gridWidth: number;
  gridHeight: number;
  tileSize: number;
  tiledMapData?: string | null;
  createdAt: string;
  updatedAt: string;
  objects: MapObject[];
  zones: MapZone[];
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: 'desks' | 'chairs' | 'tech' | 'decor' | 'walls';
  icon: string;
  widthTiles: number;
  heightTiles: number;
  isSolid: boolean;
}

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  { id: 'desk_wood_01', name: 'Mesa de Carvalho', category: 'desks', icon: '🪑', widthTiles: 2, heightTiles: 1, isSolid: true },
  { id: 'desk_corner_tech', name: 'Mesa Gamer/Dev', category: 'desks', icon: '🖥️', widthTiles: 3, heightTiles: 2, isSolid: true },
  { id: 'chair_office_01', name: 'Cadeira Ergonômica', category: 'chairs', icon: '💺', widthTiles: 1, heightTiles: 1, isSolid: false },
  { id: 'chair_lounge_sofa', name: 'Sofá de Espera', category: 'chairs', icon: '🛋️', widthTiles: 3, heightTiles: 1, isSolid: true },
  { id: 'pc_dual_monitor', name: 'Setup Dual Monitor', category: 'tech', icon: '💻', widthTiles: 1, heightTiles: 1, isSolid: true },
  { id: 'coffee_machine', name: 'Cafeteira Expressa', category: 'tech', icon: '☕', widthTiles: 1, heightTiles: 1, isSolid: true },
  { id: 'plant_potted_01', name: 'Planta Costela-de-Adão', category: 'decor', icon: '🪴', widthTiles: 1, heightTiles: 1, isSolid: true },
  { id: 'plant_ficus_tall', name: 'Ficus Decorativo', category: 'decor', icon: '🌿', widthTiles: 1, heightTiles: 1, isSolid: true },
  { id: 'wall_partition_glass', name: 'Divisória de Vidro', category: 'walls', icon: '🧱', widthTiles: 1, heightTiles: 1, isSolid: true },
  { id: 'wall_brick_modern', name: 'Parede Tijolos', category: 'walls', icon: '🧱', widthTiles: 1, heightTiles: 1, isSolid: true }
];
