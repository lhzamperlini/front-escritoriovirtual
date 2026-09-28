import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { WebRtcService } from './webrtc.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('WebRtcService', () => {
  let service: WebRtcService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebRtcService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(WebRtcService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate spatial audio volume correctly according to business rules', () => {
    // <= 2 tiles: 100% volume
    expect(service.calculateSpatialAudioVolume(1)).toBe(1.0);
    expect(service.calculateSpatialAudioVolume(2)).toBe(1.0);

    // Between 2 and 5 tiles: linear attenuation down to 10%
    const volAt3 = service.calculateSpatialAudioVolume(3);
    expect(volAt3).toBe(0.7);

    const volAt4 = service.calculateSpatialAudioVolume(4);
    expect(volAt4).toBe(0.4);

    const volAt5 = service.calculateSpatialAudioVolume(5);
    expect(volAt5).toBe(0.1);

    // > 5 tiles: 0% volume (muted)
    expect(service.calculateSpatialAudioVolume(5.5)).toBe(0.0);
    expect(service.calculateSpatialAudioVolume(8)).toBe(0.0);
  });

  it('should determine video visibility at <= 3 tiles', () => {
    expect(service.isVideoVisibleAtDistance(2)).toBe(true);
    expect(service.isVideoVisibleAtDistance(3)).toBe(true);
    expect(service.isVideoVisibleAtDistance(3.5)).toBe(false);
  });

  it('should update peer proximity states and filter visible peers', () => {
    service.updatePeerProximity(
      { x: 320, y: 320 },
      [
        { userId: 'u1', fullName: 'Alice', x: 320 + 32, y: 320 }, // 1 tile away
        { userId: 'u2', fullName: 'Bob', x: 320 + (6 * 32), y: 320 } // 6 tiles away
      ]
    );

    const peers = service.peers();
    expect(peers.length).toBe(2);

    const alice = peers.find(p => p.userId === 'u1');
    expect(alice?.volume).toBe(1.0);
    expect(alice?.isVideoVisible).toBe(true);

    const bob = peers.find(p => p.userId === 'u2');
    expect(bob?.volume).toBe(0);
    expect(bob?.isVideoVisible).toBe(false);

    expect(service.nearbyVideoPeers().length).toBe(1);
    expect(service.nearbyVideoPeers()[0].userId).toBe('u1');
  });

  it('should toggle local media controls', () => {
    expect(service.isMicMuted()).toBe(false);
    service.toggleMic();
    expect(service.isMicMuted()).toBe(true);

    expect(service.isCameraOff()).toBe(false);
    service.toggleCamera();
    expect(service.isCameraOff()).toBe(true);

    expect(service.isScreenSharing()).toBe(false);
    service.toggleScreenShare();
    expect(service.isScreenSharing()).toBe(true);
  });
});
