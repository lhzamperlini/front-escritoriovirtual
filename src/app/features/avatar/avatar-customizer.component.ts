import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarConfig, AvatarPart, AVATAR_CATALOG, COLOR_PALETTES, DEFAULT_AVATAR_CONFIG, PIPOYA_AVATAR_MODELS, PipoyaAvatarOption } from './avatar.model';
import { AvatarService } from './avatar.service';
import { PipoyaSpriteComponent, SpriteDirection } from '../../shared/components/pipoya-sprite/pipoya-sprite.component';

type CategoryKey = 'models' | 'base' | 'hair' | 'eyes' | 'top' | 'bottom' | 'shoes' | 'accessories';

@Component({
  selector: 'app-avatar-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule, PipoyaSpriteComponent],
  templateUrl: './avatar-customizer.component.html',
  styleUrls: ['./avatar-customizer.component.scss']
})
export class AvatarCustomizerComponent implements OnInit {
  private readonly avatarService = inject(AvatarService);

  @Input() isModal = true;
  @Output() saved = new EventEmitter<AvatarConfig>();
  @Output() closed = new EventEmitter<void>();

  public readonly activeCategory = signal<CategoryKey>('models');
  public readonly previewDirection = signal<SpriteDirection>('down');
  public readonly isWalkingPreview = signal<boolean>(false);
  public readonly draftAvatar = signal<AvatarConfig>(JSON.parse(JSON.stringify(DEFAULT_AVATAR_CONFIG)));
  public readonly isSaving = this.avatarService.isSaving;
  public readonly showSuccessToast = signal<boolean>(false);

  // Modelos Pipoya
  public readonly pipoyaModels = PIPOYA_AVATAR_MODELS;
  public readonly modelFilter = signal<string>('all');

  public readonly filteredPipoyaModels = computed(() => {
    const filter = this.modelFilter();
    if (filter === 'all') return this.pipoyaModels;
    return this.pipoyaModels.filter(m => m.category === filter);
  });

  public readonly selectedCharacterModel = computed(() => {
    return this.draftAvatar().characterModel || 'Male_01-1.png';
  });

  // Catálogo legado mantido para customizações adicionais
  public readonly catalog = AVATAR_CATALOG;
  public readonly colorPalettes = COLOR_PALETTES;

  public readonly currentItems = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'models') return [];
    return this.catalog[cat] || [];
  });

  public readonly currentSelectedAssetId = computed(() => {
    const cat = this.activeCategory();
    const avatar = this.draftAvatar();
    if (cat === 'models') {
      return avatar.characterModel || '';
    }
    if (cat === 'accessories') {
      return avatar.accessories && avatar.accessories.length > 0 ? avatar.accessories[0].assetId : '';
    }
    return (avatar[cat] as AvatarPart)?.assetId || '';
  });

  public readonly currentSelectedTint = computed(() => {
    const cat = this.activeCategory();
    if (cat === 'models') return '#ffffff';
    const avatar = this.draftAvatar();
    if (cat === 'accessories') {
      return avatar.accessories && avatar.accessories.length > 0 ? avatar.accessories[0].tint : '#111827';
    }
    return (avatar as any)[cat]?.tint || '#ffffff';
  });

  public ngOnInit(): void {
    this.avatarService.loadMyAvatar().subscribe((config) => {
      const merged = { ...DEFAULT_AVATAR_CONFIG, ...config };
      if (!merged.characterModel) {
        merged.characterModel = 'Male_01-1.png';
      }
      this.draftAvatar.set(JSON.parse(JSON.stringify(merged)));
    });
  }

  public setCategory(cat: CategoryKey): void {
    this.activeCategory.set(cat);
  }

  public setDirection(dir: SpriteDirection): void {
    this.previewDirection.set(dir);
  }

  public toggleWalkingPreview(): void {
    this.isWalkingPreview.update(w => !w);
  }

  public selectPipoyaModel(model: PipoyaAvatarOption): void {
    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;
    current.characterModel = model.filename;
    this.draftAvatar.set(current);
  }

  public selectAsset(assetId: string): void {
    const cat = this.activeCategory();
    if (cat === 'models') return;

    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;
    if (cat === 'accessories') {
      if (!current.accessories || current.accessories.length === 0) {
        current.accessories = [{ assetId, tint: '#111827' }];
      } else {
        current.accessories[0].assetId = assetId;
      }
    } else {
      if (!current[cat]) {
        current[cat] = { assetId, tint: '#ffffff' };
      } else {
        (current[cat] as AvatarPart).assetId = assetId;
      }
    }
    this.draftAvatar.set(current);
  }

  public selectTint(color: string): void {
    const cat = this.activeCategory();
    if (cat === 'models') return;

    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;
    if (cat === 'accessories') {
      if (!current.accessories || current.accessories.length === 0) {
        current.accessories = [{ assetId: 'glasses_square', tint: color }];
      } else {
        current.accessories[0].tint = color;
      }
    } else {
      if (current[cat]) {
        (current[cat] as AvatarPart).tint = color;
      }
    }
    this.draftAvatar.set(current);
  }

  public randomize(): void {
    const randomModel = this.pipoyaModels[Math.floor(Math.random() * this.pipoyaModels.length)];
    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;
    current.characterModel = randomModel.filename;
    this.draftAvatar.set(current);
  }

  public resetToDefault(): void {
    this.draftAvatar.set(JSON.parse(JSON.stringify(DEFAULT_AVATAR_CONFIG)));
  }

  public save(): void {
    const configToSave = this.draftAvatar();
    this.avatarService.saveAvatar(configToSave).subscribe({
      next: (savedConfig) => {
        this.saved.emit(savedConfig);
        this.showSuccessToast.set(true);
        setTimeout(() => {
          this.showSuccessToast.set(false);
          if (this.isModal) {
            this.close();
          }
        }, 1200);
      },
      error: (err) => {
        console.error('Falha ao salvar avatar:', err);
      }
    });
  }

  public close(): void {
    this.closed.emit();
  }
}
