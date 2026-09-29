import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../../core/webrtc/webrtc.service';
import { PresenceService } from '../../../core/presence/presence.service';
import { LucideIconComponent } from '../../../shared/components/lucide-icon/lucide-icon.component';
import { PipoyaSpriteComponent } from '../../../shared/components/pipoya-sprite/pipoya-sprite.component';
import { AvatarService } from '../../avatar/avatar.service';

@Component({
  selector: 'app-proximity-video-dock',
  standalone: true,
  imports: [CommonModule, LucideIconComponent, PipoyaSpriteComponent],
  templateUrl: './proximity-video-dock.component.html',
  styleUrls: ['./proximity-video-dock.component.scss']
})
export class ProximityVideoDockComponent {
  public readonly webrtcService = inject(WebRtcService);
  public readonly presenceService = inject(PresenceService);
  public readonly avatarService = inject(AvatarService);

  public readonly formattedRoomName = computed(() => {
    const room = this.webrtcService.activeRoomName();
    if (!room) return null;
    if (room.startsWith('proximity_')) {
      return 'Canal de Proximidade Ativo';
    }
    return room;
  });

  public getMyModel(): string {
    return this.avatarService.currentAvatar()?.characterModel || 'pipoya_male_01_1';
  }

  public toggleMic(): void {
    this.webrtcService.toggleMic();
  }

  public toggleCamera(): void {
    this.webrtcService.toggleCamera();
  }

  public toggleScreen(): void {
    this.webrtcService.toggleScreenShare();
  }
}
