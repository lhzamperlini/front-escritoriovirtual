export interface AvatarPart {
  assetId: string;
  tint: string;
}

export interface AvatarConfig {
  base: AvatarPart;
  hair: AvatarPart;
  eyes: AvatarPart;
  top: AvatarPart;
  bottom: AvatarPart;
  shoes: AvatarPart;
  accessories: AvatarPart[];
}

export interface AssetOption {
  id: string;
  name: string;
  category: 'base' | 'hair' | 'eyes' | 'top' | 'bottom' | 'shoes' | 'accessories';
  previewIcon?: string;
}

export const AVATAR_CATALOG: Record<string, AssetOption[]> = {
  base: [
    { id: 'skin_01', name: 'Tom Claro 1', category: 'base' },
    { id: 'skin_02', name: 'Tom Claro 2', category: 'base' },
    { id: 'skin_03', name: 'Tom Médio 1', category: 'base' },
    { id: 'skin_04', name: 'Tom Médio 2', category: 'base' },
    { id: 'skin_05', name: 'Tom Escuro 1', category: 'base' },
    { id: 'skin_06', name: 'Tom Escuro 2', category: 'base' },
  ],
  hair: [
    { id: 'hair_short_wavy', name: 'Ondulado Curto', category: 'hair' },
    { id: 'hair_buzz', name: 'Raspado Moderno', category: 'hair' },
    { id: 'hair_ponytail', name: 'Rabo de Cavalo', category: 'hair' },
    { id: 'hair_long_straight', name: 'Longo Liso', category: 'hair' },
    { id: 'hair_curly_afro', name: 'Afro Volumoso', category: 'hair' },
    { id: 'hair_side_part', name: 'Social Lateral', category: 'hair' },
  ],
  eyes: [
    { id: 'eyes_default', name: 'Padrão Expressivo', category: 'eyes' },
    { id: 'eyes_focused', name: 'Focado / Atento', category: 'eyes' },
    { id: 'eyes_gentle', name: 'Suave / Amigável', category: 'eyes' },
    { id: 'eyes_glasses', name: 'Olhar Curioso', category: 'eyes' },
  ],
  top: [
    { id: 'hoodie_classic', name: 'Moletom Casual', category: 'top' },
    { id: 'shirt_formal', name: 'Camisa Social', category: 'top' },
    { id: 'tshirt_crew', name: 'Camiseta Básica', category: 'top' },
    { id: 'blazer_tech', name: 'Blazer Tech', category: 'top' },
    { id: 'sweater_knit', name: 'Suéter Tricô', category: 'top' },
  ],
  bottom: [
    { id: 'jeans_straight', name: 'Calça Jeans Reta', category: 'bottom' },
    { id: 'pants_tailored', name: 'Calça Alfaiataria', category: 'bottom' },
    { id: 'pants_jogger', name: 'Calça Jogger', category: 'bottom' },
    { id: 'skirt_pleated', name: 'Saia Plissada', category: 'bottom' },
    { id: 'shorts_cargo', name: 'Bermuda Casual', category: 'bottom' },
  ],
  shoes: [
    { id: 'sneakers_sport', name: 'Tênis Esportivo', category: 'shoes' },
    { id: 'shoes_oxford', name: 'Sapato Oxford', category: 'shoes' },
    { id: 'boots_chelsea', name: 'Bota Chelsea', category: 'shoes' },
    { id: 'sneakers_minimal', name: 'Tênis Minimalista', category: 'shoes' },
  ],
  accessories: [
    { id: 'glasses_square', name: 'Óculos Armação Retangular', category: 'accessories' },
    { id: 'glasses_round', name: 'Óculos Redondos', category: 'accessories' },
    { id: 'headset_pro', name: 'Headset Gamer / Call', category: 'accessories' },
    { id: 'earring_hoop', name: 'Brinco Argola', category: 'accessories' },
    { id: 'watch_smart', name: 'Smartwatch Tech', category: 'accessories' },
    { id: 'badge_id', name: 'Crachá Corporativo', category: 'accessories' },
  ]
};

export const COLOR_PALETTES = [
  '#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#3c2005', // Peles
  '#09090b', '#27272a', '#4a3728', '#78350f', '#ca8a04', '#dc2626', // Cabelos/Destaque
  '#2563eb', '#1e3a8a', '#059669', '#7c3aed', '#db2777', '#f97316', // Roupas
  '#ffffff', '#e2e8f0', '#94a3b8', '#475569', '#1e293b', '#0f172a'  // Neutros/Sapatos
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  base: { assetId: 'skin_01', tint: '#ffdbac' },
  hair: { assetId: 'hair_short_wavy', tint: '#4a3728' },
  eyes: { assetId: 'eyes_default', tint: '#2e536f' },
  top: { assetId: 'hoodie_classic', tint: '#1e3a8a' },
  bottom: { assetId: 'jeans_straight', tint: '#1f2937' },
  shoes: { assetId: 'sneakers_sport', tint: '#ffffff' },
  accessories: [{ assetId: 'glasses_square', tint: '#111827' }]
};
