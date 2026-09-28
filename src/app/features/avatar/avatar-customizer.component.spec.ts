import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AvatarCustomizerComponent } from './avatar-customizer.component';
import { AvatarService } from './avatar.service';

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
    expect(component.activeCategory()).toBe('base');
  });

  it('should switch categories when tab is clicked', () => {
    component.setCategory('hair');
    expect(component.activeCategory()).toBe('hair');
    expect(component.currentItems().length).toBeGreaterThan(0);
  });

  it('should update asset in draft avatar when asset is selected', () => {
    component.setCategory('hair');
    component.selectAsset('hair_ponytail');
    expect(component.draftAvatar().hair.assetId).toBe('hair_ponytail');
  });

  it('should update tint in draft avatar when tint is selected', () => {
    component.setCategory('top');
    component.selectTint('#ff0000');
    expect(component.draftAvatar().top.tint).toBe('#ff0000');
  });

  it('should randomize avatar properties when randomize is called', () => {
    component.randomize();
    const avatar = component.draftAvatar();
    expect(avatar.base.assetId).toBeTruthy();
    expect(avatar.hair.assetId).toBeTruthy();
  });

  it('should change preview direction', () => {
    component.setDirection('up');
    expect(component.previewDirection()).toBe('up');
  });
});
