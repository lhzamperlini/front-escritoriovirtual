import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipoyaSpriteComponent } from './pipoya-sprite.component';

describe('PipoyaSpriteComponent', () => {
  let component: PipoyaSpriteComponent;
  let fixture: ComponentFixture<PipoyaSpriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipoyaSpriteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PipoyaSpriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the sprite component', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve asset URL correctly when filename is given', () => {
    fixture.componentRef.setInput('model', 'Female 01-1.png');
    fixture.detectChanges();
    expect(component.resolvedUrl()).toBe('/assets/characters/pipoya/Female_01-1.png');
  });

  it('should normalize directions down, left, right, up', () => {
    fixture.componentRef.setInput('direction', 'up');
    fixture.detectChanges();
    expect(component.normalizedDirection()).toBe('up');
    expect(component.rowNumber()).toBe(3);

    fixture.componentRef.setInput('direction', 'right');
    fixture.detectChanges();
    expect(component.normalizedDirection()).toBe('right');
    expect(component.rowNumber()).toBe(2);

    fixture.componentRef.setInput('direction', 'left');
    fixture.detectChanges();
    expect(component.normalizedDirection()).toBe('left');
    expect(component.rowNumber()).toBe(1);

    fixture.componentRef.setInput('direction', 'down');
    fixture.detectChanges();
    expect(component.normalizedDirection()).toBe('down');
    expect(component.rowNumber()).toBe(0);
  });

  it('should calculate background position according to scale and row', () => {
    fixture.componentRef.setInput('scale', 2);
    fixture.componentRef.setInput('direction', 'left'); // row 1, scale 2: frame = 64px, posX = -64px, posY = -64px
    fixture.detectChanges();
    expect(component.backgroundPosition()).toBe('-64px -64px');
  });
});
