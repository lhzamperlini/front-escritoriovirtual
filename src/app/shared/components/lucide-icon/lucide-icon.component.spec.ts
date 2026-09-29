import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LucideIconComponent } from './lucide-icon.component';

describe('LucideIconComponent', () => {
  let component: LucideIconComponent;
  let fixture: ComponentFixture<LucideIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LucideIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LucideIconComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'mic');
    fixture.detectChanges();
  });

  it('should create the Lucide icon component', () => {
    expect(component).toBeTruthy();
  });

  it('should render SVG for mic icon', () => {
    expect(component.rawSvgContent()).toContain('M12 2a3 3 0');
  });

  it('should switch icon SVG when name input changes', () => {
    fixture.componentRef.setInput('name', 'video');
    fixture.detectChanges();
    expect(component.rawSvgContent()).toContain('m16 13');
  });
});
