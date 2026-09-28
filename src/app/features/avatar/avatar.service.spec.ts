import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AvatarService } from './avatar.service';
import { DEFAULT_AVATAR_CONFIG } from './avatar.model';

describe('AvatarService', () => {
  let service: AvatarService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AvatarService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AvatarService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created with default avatar', () => {
    expect(service).toBeTruthy();
    expect(service.currentAvatar().base.assetId).toBe('skin_01');
  });

  it('should fetch my avatar via GET /api/users/me/avatar', () => {
    service.loadMyAvatar().subscribe((avatar) => {
      expect(avatar.base.assetId).toBe('skin_02');
    });

    const req = httpMock.expectOne('/api/users/me/avatar');
    expect(req.request.method).toBe('GET');
    req.flush({ ...DEFAULT_AVATAR_CONFIG, base: { assetId: 'skin_02', tint: '#ffffff' } });
  });

  it('should save avatar via PUT /api/users/me/avatar', () => {
    const updated = { ...DEFAULT_AVATAR_CONFIG, top: { assetId: 'shirt_formal', tint: '#123456' } };

    service.saveAvatar(updated).subscribe((res) => {
      expect(res.top.assetId).toBe('shirt_formal');
      expect(service.currentAvatar().top.assetId).toBe('shirt_formal');
    });

    const req = httpMock.expectOne('/api/users/me/avatar');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);
  });
});
