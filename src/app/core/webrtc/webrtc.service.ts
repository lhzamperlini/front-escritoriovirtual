import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PeerMediaState, WebRtcTokenResponse } from './webrtc.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebRtcService {
  private readonly http = inject(HttpClient);

  public readonly activeRoomName = signal<string | null>(null);
  public readonly isMicMuted = signal<boolean>(false);
  public readonly isCameraOff = signal<boolean>(false);
  public readonly isScreenSharing = signal<boolean>(false);
  public readonly peers = signal<PeerMediaState[]>([]);

  public readonly visiblePeers = computed(() => {
    return this.peers().filter(p => p.isVideoVisible || p.isAudioAudible);
  });

  public readonly nearbyVideoPeers = computed(() => {
    return this.peers().filter(p => p.isVideoVisible);
  });

  public requestToken(workspaceId: string, mapId: string, zoneId?: string | null, zoneType?: string | null) {
    return this.http.post<WebRtcTokenResponse>('/api/webrtc/token', {
      workspaceId,
      mapId,
      zoneId: zoneId || null,
      zoneType: zoneType || null,
      canPublish: true,
      canSubscribe: true
    }).pipe(
      tap(res => {
        this.activeRoomName.set(res.roomName);
      })
    );
  }

  public calculateDistanceTiles(x1: number, y1: number, x2: number, y2: number): number {
    const dx = (x1 - x2) / 32;
    const dy = (y1 - y2) / 32;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public calculateSpatialAudioVolume(distanceTiles: number): number {
    if (distanceTiles <= 2) {
      return 1.0;
    }
    if (distanceTiles <= 5) {
      const vol = Math.round((1.0 - (distanceTiles - 2) * 0.3) * 100) / 100;
      return Math.max(0.1, Math.min(1.0, vol));
    }
    return 0.0;
  }

  public isVideoVisibleAtDistance(distanceTiles: number): boolean {
    return distanceTiles <= 3;
  }

  public updatePeerProximity(
    myPos: { x: number; y: number },
    otherUsers: Array<{ userId: string; fullName: string; x: number; y: number }>
  ): void {
    const updated: PeerMediaState[] = otherUsers.map(user => {
      const dist = this.calculateDistanceTiles(myPos.x, myPos.y, user.x, user.y);
      const volume = this.calculateSpatialAudioVolume(dist);
      const isVideoVisible = this.isVideoVisibleAtDistance(dist);
      const isAudioAudible = volume > 0;

      return {
        userId: user.userId,
        fullName: user.fullName || 'Colega',
        distanceTiles: Math.round(dist * 10) / 10,
        volume: Math.round(volume * 100) / 100,
        isVideoVisible,
        isAudioAudible,
        isSpeaking: isAudioAudible && Math.random() > 0.4
      };
    });

    this.peers.set(updated);
  }

  public toggleMic(): void {
    this.isMicMuted.update(v => !v);
  }

  public toggleCamera(): void {
    this.isCameraOff.update(v => !v);
  }

  public toggleScreenShare(): void {
    this.isScreenSharing.update(v => !v);
  }
}
