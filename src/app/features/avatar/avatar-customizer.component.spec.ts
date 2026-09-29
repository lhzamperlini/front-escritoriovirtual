import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AvatarCustomizerComponent } from './avatar-customizer.component';
import { AvatarService } from './avatar.service';
import { PIPOYA_AVATAR_MODELS } from './avatar.model';

describe('AvatarCustomizerComponent', () => {
  let component: AvatarCustomizerComponent;
  let fixture: ComponentFixture<AvatarCustomizerComponent>;
  let avatarService: AvatarService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarCustomizerComponent],
      providers: [
        AvatarService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarCustomizerComponent);
    component = fixture.componentInstance;
    avatarService = TestBed.inject(AvatarService);
    fixture.detectChanges();
  });

  it('should create the customizer component', () => {
    expect(component).toBeTruthy();
    expect(component.activeCategory()).toBe('models');
  });

  it('should switch categories when tab is clicked', () => {
    component.setCategory('hair');
    expect(component.activeCategory()).toBe('hair');
    expect(component.currentItems().length).toBeGreaterThan(0);
  });

  it('should select Pipoya model from WorkAdventure catalog', () => {
    const femaleModel = PIPOYA_AVATAR_MODELS.find(m => m.filename.includes('Female'))!;
    component.selectPipoyaModel(femaleModel);
    expect(component.draftAvatar().characterModel).toBe(femaleModel.filename);
    expect(component.selectedCharacterModel()).toBe(femaleModel.filename);
  });

  it('should filter models by category', () => {
    component.modelFilter.set('female');
    const filtered = component.filteredPipoyaModels();
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(m => m.category === 'female')).toBe(true);
  });

  it('should update asset in draft avatar when asset is selected', () => {
    component.setCategory('hair');
    component.selectAsset('hair_ponytail');
    expect(component.draftAvatar().hair?.assetId).toBe('hair_ponytail');
  });

  it('should randomize avatar properties when randomize is called', () => {
    component.randomize();
    const avatar = component.draftAvatar();
    expect(avatar.characterModel).toBeTruthy();
  });

  it('should change preview direction and walking toggle', () => {
    component.setDirection('up');
    expect(component.previewDirection()).toBe('up');

    expect(component.isWalkingPreview()).toBe(false);
    component.toggleWalkingPreview();
    expect(component.isWalkingPreview()).toBe(true);
  });
});
