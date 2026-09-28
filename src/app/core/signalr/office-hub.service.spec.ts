import { TestBed } from '@angular/core/testing';
import { OfficeHubService } from './office-hub.service';

describe('OfficeHubService', () => {
  let service: OfficeHubService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OfficeHubService]
    });
    service = TestBed.inject(OfficeHubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.isConnected()).toBe(false);
  });

  it('should expose observable event streams', () => {
    expect(service.avatarUpdated$).toBeTruthy();
    expect(service.userJoined$).toBeTruthy();
    expect(service.userLeft$).toBeTruthy();
    expect(service.userMoved$).toBeTruthy();
    expect(service.proximityMessage$).toBeTruthy();
  });
});
