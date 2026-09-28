export interface WebRtcTokenResponse {
  token: string;
  roomName: string;
  liveKitUrl: string;
  identity: string;
  fullName: string;
}

export interface PeerMediaState {
  userId: string;
  fullName: string;
  distanceTiles: number;
  volume: number; // 0 to 1
  isVideoVisible: boolean;
  isAudioAudible: boolean;
  isSpeaking?: boolean;
  videoStreamUrl?: string;
  isMuted?: boolean;
}
