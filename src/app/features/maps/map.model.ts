export type ZoneType = 'Desk' | 'MeetingRoom' | 'Spawn' | 'Lounge';

export interface MapObject {
  id?: string;
  mapId?: string;
  assetId: string;
  coordX: number;
  coordY: number;
  rotation: number; // 0 (Down), 90 (Right), 180 (Up), 270 (Left)
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

export type FurnitureCategory = 'desks' | 'chairs' | 'tech' | 'decor' | 'lounge' | 'props';

export interface DirectionalImages {
  down?: string;
  left?: string;
  right?: string;
  up?: string;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  icon?: string;
  imagePath: string;
  widthTiles: number;
  heightTiles: number;
  isSolid: boolean;
  hasDirections?: boolean;
  directionImages?: DirectionalImages;
}

export const FURNITURE_CATALOG: FurnitureCatalogItem[] = [
  // --- MESAS (DESKS) ---
  {
    id: 'table_dark_brown',
    name: 'Mesa Executiva Escura',
    category: 'desks',
    imagePath: '/assets/collections/Furniture/Table/TableDarkBrown.png',
    widthTiles: 2,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'table_brown',
    name: 'Mesa de Carvalho Clássica',
    category: 'desks',
    imagePath: '/assets/collections/Furniture/Table/TableBrown.png',
    widthTiles: 2,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'table_narrow_dark',
    name: 'Bancada Dev Estreita',
    category: 'desks',
    imagePath: '/assets/collections/Furniture/Table/TableNarrowDarkBrown.png',
    widthTiles: 2,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'table_small_white',
    name: 'Mesa Compacta Branca',
    category: 'desks',
    imagePath: '/assets/collections/Furniture/Table/TableSmallWhite.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'table_small_grey',
    name: 'Mesa Compacta Cinza',
    category: 'desks',
    imagePath: '/assets/collections/Furniture/Table/TableSmallGrey.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },

  // --- CADEIRAS (CHAIRS) COM 4 DIREÇÕES ---
  {
    id: 'chair_grey',
    name: 'Cadeira Ergonômica Cinza',
    category: 'chairs',
    imagePath: '/assets/collections/Furniture/Chair/ChairGreyDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Chair/ChairGreyDown.png',
      left: '/assets/collections/Furniture/Chair/ChairGreyLeft.png',
      right: '/assets/collections/Furniture/Chair/ChairGreyRight.png',
      up: '/assets/collections/Furniture/Chair/ChairGreyUp.png'
    }
  },
  {
    id: 'chair_green',
    name: 'Cadeira Gamer Verde',
    category: 'chairs',
    imagePath: '/assets/collections/Furniture/Chair/ChairGreenDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Chair/ChairGreenDown.png',
      left: '/assets/collections/Furniture/Chair/ChairGreenLeft.png',
      right: '/assets/collections/Furniture/Chair/ChairGreenRight.png',
      up: '/assets/collections/Furniture/Chair/ChairGreenUp.png'
    }
  },
  {
    id: 'chair_blue',
    name: 'Cadeira Executiva Azul',
    category: 'chairs',
    imagePath: '/assets/collections/Furniture/Chair/ChairBlueDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Chair/ChairBlueDown.png',
      left: '/assets/collections/Furniture/Chair/ChairBlueLeft.png',
      right: '/assets/collections/Furniture/Chair/ChairBlueRight.png',
      up: '/assets/collections/Furniture/Chair/ChairBlueUp.png'
    }
  },
  {
    id: 'chair_red',
    name: 'Cadeira Diretor Vermelha',
    category: 'chairs',
    imagePath: '/assets/collections/Furniture/Chair/ChairRedDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Chair/ChairRedDown.png',
      left: '/assets/collections/Furniture/Chair/ChairRedLeft.png',
      right: '/assets/collections/Furniture/Chair/ChairRedRight.png',
      up: '/assets/collections/Furniture/Chair/ChairRedUp.png'
    }
  },

  // --- TECNOLOGIA & COMPUTADORES (TECH) ---
  {
    id: 'screen_big_black',
    name: 'Monitor Ultrawide Preto',
    category: 'tech',
    imagePath: '/assets/collections/Office/Computer/BigScreenBlackDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Office/Computer/BigScreenBlackDown.png',
      up: '/assets/collections/Office/Computer/BigScreenBlackUp.png'
    }
  },
  {
    id: 'screen_big_white',
    name: 'Monitor Ultrawide Branco',
    category: 'tech',
    imagePath: '/assets/collections/Office/Computer/BigScreenWhiteDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Office/Computer/BigScreenWhiteDown.png',
      up: '/assets/collections/Office/Computer/BigScreenWhiteUp.png'
    }
  },
  {
    id: 'laptop_dev',
    name: 'Laptop Dev Pro',
    category: 'tech',
    imagePath: '/assets/collections/Office/Computer/LaptopBlackDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Office/Computer/LaptopBlackDown.png',
      right: '/assets/collections/Office/Computer/LaptopBlackRight.png'
    }
  },
  {
    id: 'screen_standard_black',
    name: 'Monitor 4K Preto',
    category: 'tech',
    imagePath: '/assets/collections/Office/Computer/ScreenBlackDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'printer_office',
    name: 'Impressora Corporativa',
    category: 'tech',
    imagePath: '/assets/collections/Office/Computer/Printer.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },

  // --- PLANTAS & PAISAGISMO (DECOR) ---
  {
    id: 'plant_tropical',
    name: 'Planta Tropical de Vaso',
    category: 'decor',
    imagePath: '/assets/collections/Office/Plant/Plant.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'plant_large_tall',
    name: 'Ficus Alto Decorativo',
    category: 'decor',
    imagePath: '/assets/collections/Office/Plant/PlantLarge.png',
    widthTiles: 1,
    heightTiles: 2,
    isSolid: true
  },
  {
    id: 'plant_small_succulent',
    name: 'Mini Suculenta de Mesa',
    category: 'decor',
    imagePath: '/assets/collections/Office/Plant/PlantSmall.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false
  },
  {
    id: 'plant_mural_vertical',
    name: 'Jardim Vertical Mural',
    category: 'decor',
    imagePath: '/assets/collections/Office/Plant/MuralPlant.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'plant_blue_pot',
    name: 'Planta Vaso Azul',
    category: 'decor',
    imagePath: '/assets/collections/Office/Plant/PlantBlue.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },

  // --- LOUNGE & DESCANSO (LOUNGE) ---
  {
    id: 'couch_blue',
    name: 'Sofá Conforto Azul',
    category: 'lounge',
    imagePath: '/assets/collections/Furniture/Couch/CouchBlueDown.png',
    widthTiles: 2,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Couch/CouchBlueDown.png',
      left: '/assets/collections/Furniture/Couch/CouchBlueLeft.png',
      right: '/assets/collections/Furniture/Couch/CouchBlueRight.png',
      up: '/assets/collections/Furniture/Couch/CouchBlueUp.png'
    }
  },
  {
    id: 'couch_brown',
    name: 'Sofá de Couro Marrom',
    category: 'lounge',
    imagePath: '/assets/collections/Furniture/Couch/CouchBrownDown.png',
    widthTiles: 2,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Couch/CouchBrownDown.png',
      left: '/assets/collections/Furniture/Couch/CouchBrownLeft.png',
      right: '/assets/collections/Furniture/Couch/CouchBrownRight.png',
      up: '/assets/collections/Furniture/Couch/CouchBrownUp.png'
    }
  },
  {
    id: 'armchair_black',
    name: 'Poltrona Executiva Preta',
    category: 'lounge',
    imagePath: '/assets/collections/Furniture/Armchair/ArmchairBlackDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Armchair/ArmchairBlackDown.png',
      left: '/assets/collections/Furniture/Armchair/ArmchairBlackLeft.png',
      right: '/assets/collections/Furniture/Armchair/ArmchairBlackRight.png',
      up: '/assets/collections/Furniture/Armchair/ArmchairBlackUp.png'
    }
  },
  {
    id: 'armchair_grey',
    name: 'Poltrona Conforto Cinza',
    category: 'lounge',
    imagePath: '/assets/collections/Furniture/Armchair/ArmchairGreyDown.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true,
    hasDirections: true,
    directionImages: {
      down: '/assets/collections/Furniture/Armchair/ArmchairGreyDown.png',
      left: '/assets/collections/Furniture/Armchair/ArmchairGreyLeft.png',
      right: '/assets/collections/Furniture/Armchair/ArmchairGreyRight.png',
      up: '/assets/collections/Furniture/Armchair/ArmchairGreyUp.png'
    }
  },
  {
    id: 'pouf_orange',
    name: 'Pufe Lounge Laranja',
    category: 'lounge',
    imagePath: '/assets/collections/Furniture/PoufOrange.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false
  },
  {
    id: 'coffee_dispenser',
    name: 'Cafeteira Expressa Gourmet',
    category: 'lounge',
    imagePath: '/assets/collections/Office/Props/CoffeeDispenser.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'coffee_mugs',
    name: 'Canecas de Café',
    category: 'lounge',
    imagePath: '/assets/collections/Office/Props/Mugs.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false
  },

  // --- ACESSÓRIOS & INFRAESTRUTURA (PROPS) ---
  {
    id: 'shelf_big',
    name: 'Estante de Livros Dupla',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Shelf/ShelfBig.png',
    widthTiles: 2,
    heightTiles: 2,
    isSolid: true
  },
  {
    id: 'shelf_single',
    name: 'Estante Compacta',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Shelf/Shelf.png',
    widthTiles: 1,
    heightTiles: 2,
    isSolid: true
  },
  {
    id: 'panel_left',
    name: 'Divisória Painel Esquerdo',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Pannel/PannelLeft.png',
    widthTiles: 1,
    heightTiles: 2,
    isSolid: true
  },
  {
    id: 'panel_right',
    name: 'Divisória Painel Direito',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Pannel/PannelRight.png',
    widthTiles: 1,
    heightTiles: 2,
    isSolid: true
  },
  {
    id: 'office_clock',
    name: 'Relógio de Parede',
    category: 'props',
    imagePath: '/assets/collections/Office/Props/Clock.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false
  },
  {
    id: 'office_folders',
    name: 'Pastas e Documentos',
    category: 'props',
    imagePath: '/assets/collections/Office/Props/Folders.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: false
  },
  {
    id: 'office_bin',
    name: 'Lixeira de Escritório',
    category: 'props',
    imagePath: '/assets/collections/Office/Props/Bin.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'bathroom_sink',
    name: 'Lavatório de Banheiro',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Bathroom/Sink.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  },
  {
    id: 'bathroom_toilet',
    name: 'Sanitário',
    category: 'props',
    imagePath: '/assets/collections/Furniture/Bathroom/Toilet.png',
    widthTiles: 1,
    heightTiles: 1,
    isSolid: true
  }
];

export function getFurnitureAssetDetails(assetId: string, rotationDeg: number = 0): {
  imageUrl: string;
  widthTiles: number;
  heightTiles: number;
  isSolid: boolean;
  name: string;
} {
  const item = FURNITURE_CATALOG.find(f => f.id === assetId) || FURNITURE_CATALOG[0];

  let imageUrl = item.imagePath;

  if (item.hasDirections && item.directionImages) {
    const rot = ((rotationDeg % 360) + 360) % 360;
    if (rot === 0 && item.directionImages.down) {
      imageUrl = item.directionImages.down;
    } else if (rot === 90 && (item.directionImages.right || item.directionImages.down)) {
      imageUrl = item.directionImages.right || item.directionImages.down!;
    } else if (rot === 180 && (item.directionImages.up || item.directionImages.down)) {
      imageUrl = item.directionImages.up || item.directionImages.down!;
    } else if (rot === 270 && (item.directionImages.left || item.directionImages.down)) {
      imageUrl = item.directionImages.left || item.directionImages.down!;
    }
  }

  return {
    imageUrl,
    widthTiles: item.widthTiles,
    heightTiles: item.heightTiles,
    isSolid: item.isSolid,
    name: item.name
  };
}

export const DEFAULT_OFFICE_ZONES: MapZone[] = [
  {
    name: 'Recepção & Ponto de Entrada',
    zoneType: 'Spawn',
    startX: 2,
    startY: 2,
    endX: 8,
    endY: 8,
    capacity: 20
  },
  {
    name: 'Open Space - Squad Alpha',
    zoneType: 'Desk',
    startX: 9,
    startY: 2,
    endX: 20,
    endY: 10,
    capacity: 8
  },
  {
    name: 'Sala de Reunião Executiva',
    zoneType: 'MeetingRoom',
    startX: 21,
    startY: 2,
    endX: 29,
    endY: 10,
    capacity: 10
  },
  {
    name: 'Café & Lounge de Descompressão',
    zoneType: 'Lounge',
    startX: 2,
    startY: 11,
    endX: 14,
    endY: 18,
    capacity: 15
  },
  {
    name: 'Cabine de Foco 1:1',
    zoneType: 'MeetingRoom',
    startX: 16,
    startY: 12,
    endX: 22,
    endY: 18,
    capacity: 4
  },
  {
    name: 'Cabine de Foco 2:2',
    zoneType: 'MeetingRoom',
    startX: 23,
    startY: 12,
    endX: 29,
    endY: 18,
    capacity: 4
  }
];

export const DEFAULT_OFFICE_OBJECTS: MapObject[] = [
  // --- RECEPÇÃO ---
  { assetId: 'table_brown', coordX: 4, coordY: 4, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'laptop_dev', coordX: 4, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_blue', coordX: 4, coordY: 3, rotation: 0, isSolid: false, zIndexOffset: 0 },
  { assetId: 'couch_blue', coordX: 3, coordY: 6, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'plant_blue_pot', coordX: 7, coordY: 6, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'office_clock', coordX: 5, coordY: 2, rotation: 0, isSolid: false, zIndexOffset: 0 },

  // --- OPEN SPACE DEV ---
  // Estação 1
  { assetId: 'table_dark_brown', coordX: 11, coordY: 4, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'screen_big_black', coordX: 11, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'laptop_dev', coordX: 12, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_green', coordX: 11, coordY: 5, rotation: 180, isSolid: false, zIndexOffset: 0 },

  // Estação 2
  { assetId: 'table_dark_brown', coordX: 15, coordY: 4, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'screen_big_white', coordX: 15, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_blue', coordX: 15, coordY: 5, rotation: 180, isSolid: false, zIndexOffset: 0 },

  // Estação 3
  { assetId: 'table_dark_brown', coordX: 11, coordY: 7, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'screen_standard_black', coordX: 11, coordY: 7, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_green', coordX: 11, coordY: 8, rotation: 180, isSolid: false, zIndexOffset: 0 },

  // Estação 4
  { assetId: 'table_dark_brown', coordX: 15, coordY: 7, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'screen_big_black', coordX: 15, coordY: 7, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_blue', coordX: 15, coordY: 8, rotation: 180, isSolid: false, zIndexOffset: 0 },

  // Periféricos e Decoração Open Space
  { assetId: 'printer_office', coordX: 18, coordY: 4, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'plant_tropical', coordX: 9, coordY: 2, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'shelf_single', coordX: 19, coordY: 7, rotation: 0, isSolid: true, zIndexOffset: 0 },

  // --- SALA DE REUNIÃO EXECUTIVA ---
  { assetId: 'table_dark_brown', coordX: 23, coordY: 5, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'table_dark_brown', coordX: 25, coordY: 5, rotation: 0, isSolid: true, zIndexOffset: 0 },
  // Cadeiras Norte
  { assetId: 'chair_grey', coordX: 23, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 0 },
  { assetId: 'chair_grey', coordX: 25, coordY: 4, rotation: 0, isSolid: false, zIndexOffset: 0 },
  // Cadeiras Sul
  { assetId: 'chair_grey', coordX: 23, coordY: 6, rotation: 180, isSolid: false, zIndexOffset: 0 },
  { assetId: 'chair_grey', coordX: 25, coordY: 6, rotation: 180, isSolid: false, zIndexOffset: 0 },
  // Cabeceiras
  { assetId: 'chair_red', coordX: 22, coordY: 5, rotation: 90, isSolid: false, zIndexOffset: 0 },
  { assetId: 'chair_red', coordX: 27, coordY: 5, rotation: 270, isSolid: false, zIndexOffset: 0 },
  // Decoração Reunião
  { assetId: 'plant_large_tall', coordX: 28, coordY: 2, rotation: 0, isSolid: true, zIndexOffset: 0 },

  // --- LOUNGE & CAFÉ ---
  { assetId: 'table_narrow_dark', coordX: 3, coordY: 13, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'coffee_dispenser', coordX: 3, coordY: 13, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'coffee_mugs', coordX: 4, coordY: 13, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'office_bin', coordX: 5, coordY: 13, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'couch_brown', coordX: 8, coordY: 13, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'table_small_white', coordX: 8, coordY: 15, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'armchair_black', coordX: 6, coordY: 15, rotation: 90, isSolid: true, zIndexOffset: 0 },
  { assetId: 'armchair_black', coordX: 10, coordY: 15, rotation: 270, isSolid: true, zIndexOffset: 0 },
  { assetId: 'pouf_orange', coordX: 8, coordY: 16, rotation: 0, isSolid: false, zIndexOffset: 0 },
  { assetId: 'plant_tropical', coordX: 2, coordY: 17, rotation: 0, isSolid: true, zIndexOffset: 0 },

  // --- CABINES DE FOCO ---
  // Cabine 1
  { assetId: 'table_small_white', coordX: 18, coordY: 14, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'laptop_dev', coordX: 18, coordY: 14, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_grey', coordX: 18, coordY: 15, rotation: 180, isSolid: false, zIndexOffset: 0 },
  { assetId: 'plant_small_succulent', coordX: 19, coordY: 14, rotation: 0, isSolid: false, zIndexOffset: 1 },

  // Cabine 2
  { assetId: 'table_small_grey', coordX: 25, coordY: 14, rotation: 0, isSolid: true, zIndexOffset: 0 },
  { assetId: 'laptop_dev', coordX: 25, coordY: 14, rotation: 0, isSolid: false, zIndexOffset: 1 },
  { assetId: 'chair_blue', coordX: 25, coordY: 15, rotation: 180, isSolid: false, zIndexOffset: 0 },
  { assetId: 'shelf_big', coordX: 28, coordY: 13, rotation: 0, isSolid: true, zIndexOffset: 0 }
];

