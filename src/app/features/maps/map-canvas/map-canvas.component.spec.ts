import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MapCanvasComponent } from './map-canvas.component';
import { MapService } from '../map.service';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { FURNITURE_CATALOG } from '../map.model';

describe('MapCanvasComponent', () => {
  let component: MapCanvasComponent;
  let fixture: ComponentFixture<MapCanvasComponent>;
  let mapService: MapService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapCanvasComponent],
      providers: [
        MapService,
        WorkspaceContextService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapCanvasComponent);
    component = fixture.componentInstance;
    mapService = TestBed.inject(MapService);
    fixture.detectChanges();
  });

  it('should create MapCanvasComponent', () => {
    expect(component).toBeTruthy();
    expect(component.activeTool()).toBe('select');
  });

  it('should toggle edit mode', () => {
    expect(component.isEditMode()).toBe(false);
    component.toggleEdit();
    expect(component.isEditMode()).toBe(true);
  });

  it('should adjust zoom levels', () => {
    const initial = component.zoom();
    component.zoomIn();
    expect(component.zoom()).toBeGreaterThan(initial);
    component.zoomOut();
    expect(component.zoom()).toBe(initial);
  });

  it('should change tools and furniture selection', () => {
    component.setTool('place_furniture');
    expect(component.activeTool()).toBe('place_furniture');

    component.setFurniture(FURNITURE_CATALOG[1]);
    expect(component.selectedFurniture().id).toBe(FURNITURE_CATALOG[1].id);
  });

  it('should rotate furniture', () => {
    expect(component.selectedRotation()).toBe(0);
    component.rotateFurniture();
    expect(component.selectedRotation()).toBe(90);
  });

  it('should place furniture on grid click when tool is place_furniture', () => {
    component.toggleEdit();
    component.setTool('place_furniture');
    component.onGridCellClick(15, 20);

    const objects = component.draftObjects();
    expect(objects.length).toBeGreaterThan(0);
    expect(objects[objects.length - 1].coordX).toBe(15);
    expect(objects[objects.length - 1].coordY).toBe(20);
  });
});
