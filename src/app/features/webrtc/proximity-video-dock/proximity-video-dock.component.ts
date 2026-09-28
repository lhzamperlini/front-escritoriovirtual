import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebRtcService } from '../../../core/webrtc/webrtc.service';
import { PresenceService } from '../../../core/presence/presence.service';

@Component({
  selector: 'app-proximity-video-dock',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './proximity-video-dock.component.html',
  styleUrls: ['./proximity-video-dock.component.scss']
})
export class ProximityVideoDockComponent {
  public readonly webrtcService = inject(WebRtcService);
  public readonly presenceService = inject(PresenceService);

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
