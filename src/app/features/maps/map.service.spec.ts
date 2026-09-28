import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MapService } from './map.service';
import { MapData } from './map.model';

describe('MapService', () => {
  let service: MapService;
  let httpMock: HttpTestingController;

  const mockMap: MapData = {
    id: 'map-123',
    workspaceId: 'ws-123',
    name: 'Sede Principal',
    gridWidth: 100,
    gridHeight: 100,
    tileSize: 32,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    objects: [],
    zones: []
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MapService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(MapService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.currentMap()).toBeNull();
  });

  it('should load map by id', () => {
    service.loadMap('map-123').subscribe((res) => {
      expect(res.id).toBe('map-123');
      expect(service.currentMap()?.name).toBe('Sede Principal');
    });

    const req = httpMock.expectOne('/api/maps/map-123');
    expect(req.request.method).toBe('GET');
    req.flush(mockMap);
  });

  it('should save layout', () => {
    service.saveMapLayout('map-123', [], []).subscribe((res) => {
      expect(res.id).toBe('map-123');
    });

    const req = httpMock.expectOne('/api/maps/map-123/layout');
    expect(req.request.method).toBe('PUT');
    req.flush(mockMap);
  });
});
