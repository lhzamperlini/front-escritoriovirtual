import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProximityVideoDockComponent } from './proximity-video-dock.component';
import { WebRtcService } from '../../../core/webrtc/webrtc.service';
import { PresenceService } from '../../../core/presence/presence.service';
import { OfficeHubService } from '../../../core/signalr/office-hub.service';
import { Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProximityVideoDockComponent', () => {
  let component: ProximityVideoDockComponent;
  let fixture: ComponentFixture<ProximityVideoDockComponent>;
  let webrtcService: WebRtcService;

  beforeEach(async () => {
    const hubServiceMock = {
      currentMapPresences$: new Subject<any[]>(),
      userJoined$: new Subject<any>(),
      userLeft$: new Subject<string>(),
      userMoved$: new Subject<any>(),
      statusChanged$: new Subject<any>(),
      avatarUpdated$: new Subject<any>()
    };

    await TestBed.configureTestingModule({
      imports: [ProximityVideoDockComponent],
      providers: [
        WebRtcService,
        PresenceService,
        { provide: OfficeHubService, useValue: hubServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProximityVideoDockComponent);
    component = fixture.componentInstance;
    webrtcService = TestBed.inject(WebRtcService);
    fixture.detectChanges();
  });

  it('should create ProximityVideoDockComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mic, camera, screen controls', () => {
    expect(webrtcService.isMicMuted()).toBe(false);
    component.toggleMic();
    expect(webrtcService.isMicMuted()).toBe(true);

    expect(webrtcService.isCameraOff()).toBe(false);
    component.toggleCamera();
    expect(webrtcService.isCameraOff()).toBe(true);

    expect(webrtcService.isScreenSharing()).toBe(false);
    component.toggleScreen();
    expect(webrtcService.isScreenSharing()).toBe(true);
  });
});
