import { Component, EventEmitter, Input, OnInit, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarConfig, AvatarPart, AVATAR_CATALOG, COLOR_PALETTES, DEFAULT_AVATAR_CONFIG } from './avatar.model';
import { AvatarService } from './avatar.service';

type CategoryKey = 'base' | 'hair' | 'eyes' | 'top' | 'bottom' | 'shoes' | 'accessories';

@Component({
  selector: 'app-avatar-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar-customizer.component.html',
  styleUrls: ['./avatar-customizer.component.scss']
})
export class AvatarCustomizerComponent implements OnInit {
  private readonly avatarService = inject(AvatarService);

  @Input() isModal = true;
  @Output() saved = new EventEmitter<AvatarConfig>();
  @Output() closed = new EventEmitter<void>();

  public readonly activeCategory = signal<CategoryKey>('base');
  public readonly previewDirection = signal<'down' | 'up' | 'left' | 'right'>('down');
  public readonly draftAvatar = signal<AvatarConfig>(JSON.parse(JSON.stringify(DEFAULT_AVATAR_CONFIG)));
  public readonly isSaving = this.avatarService.isSaving;
  public readonly showSuccessToast = signal<boolean>(false);

  public readonly catalog = AVATAR_CATALOG;
  public readonly colorPalettes = COLOR_PALETTES;

  public readonly currentItems = computed(() => {
    return this.catalog[this.activeCategory()] || [];
  });

  public readonly currentSelectedAssetId = computed(() => {
    const cat = this.activeCategory();
    const avatar = this.draftAvatar();
    if (cat === 'accessories') {
      return avatar.accessories.length > 0 ? avatar.accessories[0].assetId : '';
    }
    return (avatar[cat] as AvatarPart)?.assetId || '';
  });

  public readonly currentSelectedTint = computed(() => {
    const cat = this.activeCategory();
    const avatar = this.draftAvatar();
    if (cat === 'accessories') {
      return avatar.accessories.length > 0 ? avatar.accessories[0].tint : '#111827';
    }
    return (avatar[cat] as AvatarPart)?.tint || '#ffffff';
  });

  public ngOnInit(): void {
    // Carrega avatar persistido do usuário
    this.avatarService.loadMyAvatar().subscribe((config) => {
      this.draftAvatar.set(JSON.parse(JSON.stringify(config)));
    });
  }

  public setCategory(cat: CategoryKey): void {
    this.activeCategory.set(cat);
  }

  public setDirection(dir: 'down' | 'up' | 'left' | 'right'): void {
    this.previewDirection.set(dir);
  }

  public selectAsset(assetId: string): void {
    const cat = this.activeCategory();
    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;

    if (cat === 'accessories') {
      if (current.accessories.length === 0) {
        current.accessories = [{ assetId, tint: '#111827' }];
      } else {
        current.accessories[0].assetId = assetId;
      }
    } else {
      (current[cat] as AvatarPart).assetId = assetId;
    }

    this.draftAvatar.set(current);
  }

  public selectTint(color: string): void {
    const cat = this.activeCategory();
    const current = JSON.parse(JSON.stringify(this.draftAvatar())) as AvatarConfig;

    if (cat === 'accessories') {
      if (current.accessories.length === 0) {
        current.accessories = [{ assetId: 'glasses_square', tint: color }];
      } else {
        current.accessories[0].tint = color;
      }
    } else {
      (current[cat] as AvatarPart).tint = color;
    }

    this.draftAvatar.set(current);
  }

  public onCustomColorChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.value) {
      this.selectTint(input.value);
    }
  }

  public randomize(): void {
    const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomAvatar: AvatarConfig = {
      base: { assetId: getRandom(this.catalog['base']).id, tint: getRandom(this.colorPalettes.slice(0, 6)) },
      hair: { assetId: getRandom(this.catalog['hair']).id, tint: getRandom(this.colorPalettes.slice(6, 12)) },
      eyes: { assetId: getRandom(this.catalog['eyes']).id, tint: getRandom(this.colorPalettes.slice(12, 18)) },
      top: { assetId: getRandom(this.catalog['top']).id, tint: getRandom(this.colorPalettes.slice(12, 18)) },
      bottom: { assetId: getRandom(this.catalog['bottom']).id, tint: getRandom(this.colorPalettes.slice(18, 24)) },
      shoes: { assetId: getRandom(this.catalog['shoes']).id, tint: getRandom(this.colorPalettes.slice(18, 24)) },
      accessories: [{ assetId: getRandom(this.catalog['accessories']).id, tint: '#111827' }]
    };
    this.draftAvatar.set(randomAvatar);
  }

  public resetToDefault(): void {
    this.draftAvatar.set(JSON.parse(JSON.stringify(DEFAULT_AVATAR_CONFIG)));
  }

  public save(): void {
    const config = this.draftAvatar();
    this.avatarService.saveAvatar(config).subscribe({
      next: (savedConfig) => {
        this.showSuccessToast.set(true);
        setTimeout(() => this.showSuccessToast.set(false), 3000);
        this.saved.emit(savedConfig);
      },
      error: () => {
        alert('Erro ao salvar avatar. Verifique sua conexão.');
      }
    });
  }

  public close(): void {
    this.closed.emit();
  }
}
