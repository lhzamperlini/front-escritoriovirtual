export interface AvatarPart {
  assetId: string;
  tint: string;
}

export interface PipoyaAvatarOption {
  id: string;
  name: string;
  filename: string;
  category: 'male' | 'female' | 'leader' | 'student' | 'companion';
  previewUrl: string;
}

export interface AvatarConfig {
  characterModel?: string; // Ex: 'Male_01-1.png'
  skinColor?: string;
  // Campos legados mantidos para retrocompatibilidade
  base?: AvatarPart;
  hair?: AvatarPart;
  eyes?: AvatarPart;
  top?: AvatarPart;
  bottom?: AvatarPart;
  shoes?: AvatarPart;
  accessories?: AvatarPart[];
}

export const PIPOYA_AVATAR_MODELS: PipoyaAvatarOption[] = [
  // --- MASCULINOS ---
  { id: 'male_01', name: 'Alex (Social)', filename: 'Male_01-1.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_01-1.png' },
  { id: 'male_02', name: 'Bruno (Casual)', filename: 'Male_02-2.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_02-2.png' },
  { id: 'male_03', name: 'Carlos (Dev)', filename: 'Male_03-4.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_03-4.png' },
  { id: 'male_05', name: 'Diego (Tech)', filename: 'Male_05-3.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_05-3.png' },
  { id: 'male_07', name: 'Eduardo (Criativo)', filename: 'Male_07-2.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_07-2.png' },
  { id: 'male_09', name: 'Felipe (Analista)', filename: 'Male_09-1.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_09-1.png' },
  { id: 'male_10', name: 'Gabriel (Executivo)', filename: 'Male_10-3.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_10-3.png' },
  { id: 'male_16', name: 'Henrique (Designer)', filename: 'Male_16-4.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_16-4.png' },
  { id: 'male_17', name: 'Igor (Suporte)', filename: 'Male_17-2.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_17-2.png' },
  { id: 'male_18', name: 'João (Arquiteto)', filename: 'Male_18-1.png', category: 'male', previewUrl: '/assets/characters/pipoya/Male_18-1.png' },

  // --- FEMININOS ---
  { id: 'female_01', name: 'Ana (Executiva)', filename: 'Female_01-1.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_01-1.png' },
  { id: 'female_02', name: 'Beatriz (Dev)', filename: 'Female_02-2.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_02-2.png' },
  { id: 'female_03', name: 'Camila (Product)', filename: 'Female_03-4.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_03-4.png' },
  { id: 'female_05', name: 'Daniela (Tech Lead)', filename: 'Female_05-3.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_05-3.png' },
  { id: 'female_07', name: 'Elena (Marketing)', filename: 'Female_07-2.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_07-2.png' },
  { id: 'female_09', name: 'Fernanda (Scrum)', filename: 'Female_09-1.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_09-1.png' },
  { id: 'female_10', name: 'Gabriela (Data)', filename: 'Female_10-3.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_10-3.png' },
  { id: 'female_16', name: 'Helena (UX/UI)', filename: 'Female_16-4.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_16-4.png' },
  { id: 'female_17', name: 'Isabela (QA)', filename: 'Female_17-2.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_17-2.png' },
  { id: 'female_18', name: 'Juliana (Engenheira)', filename: 'Female_18-1.png', category: 'female', previewUrl: '/assets/characters/pipoya/Female_18-1.png' },

  // --- LÍDERES & PROFISSIONAIS ---
  { id: 'teacher_male_02', name: 'Diretor Roberto', filename: 'Teacher_male_02.png', category: 'leader', previewUrl: '/assets/characters/pipoya/Teacher_male_02.png' },
  { id: 'teacher_fmale_02', name: 'Diretora Silvia', filename: 'Teacher_fmale_02.png', category: 'leader', previewUrl: '/assets/characters/pipoya/Teacher_fmale_02.png' },
  { id: 'headmaster_male', name: 'Coordenador Marcos', filename: 'Headmaster_male.png', category: 'leader', previewUrl: '/assets/characters/pipoya/Headmaster_male.png' },
  { id: 'headmaster_fmale', name: 'Coordenadora Laura', filename: 'Headmaster_fmale.png', category: 'leader', previewUrl: '/assets/characters/pipoya/Headmaster_fmale.png' },

  // --- ESTUDANTES / JOVENS ---
  { id: 'student_male_12', name: 'Lucas (Estagiário)', filename: 'su4_Student_male_12.png', category: 'student', previewUrl: '/assets/characters/pipoya/su4_Student_male_12.png' },
  { id: 'student_fmale_12', name: 'Mariana (Trainee)', filename: 'su4_Student_fmale_12.png', category: 'student', previewUrl: '/assets/characters/pipoya/su4_Student_fmale_12.png' },

  // --- MASCOTES / PETS ---
  { id: 'cat_01', name: 'Miau (Gatinho)', filename: 'Cat_01-1.png', category: 'companion', previewUrl: '/assets/characters/pipoya/Cat_01-1.png' },
  { id: 'dog_01', name: 'Rex (Cãozinho)', filename: 'Dog_01-1.png', category: 'companion', previewUrl: '/assets/characters/pipoya/Dog_01-1.png' }
];

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
  characterModel: 'Male_01-1.png',
  base: { assetId: 'skin_01', tint: '#ffdbac' },
  hair: { assetId: 'hair_short_wavy', tint: '#4a3728' },
  eyes: { assetId: 'eyes_default', tint: '#2e536f' },
  top: { assetId: 'hoodie_classic', tint: '#1e3a8a' },
  bottom: { assetId: 'jeans_straight', tint: '#1f2937' },
  shoes: { assetId: 'sneakers_sport', tint: '#ffffff' },
  accessories: [{ assetId: 'glasses_square', tint: '#111827' }]
};
