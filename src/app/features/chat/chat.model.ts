export interface ChatChannel {
  id: string;
  workspaceId: string;
  channelType: 'Global' | 'Zone' | 'Direct';
  zoneId?: string | null;
  name?: string | null;
  createdAt: string;
  memberCount: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ProximityBubble {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  x: number;
  y: number;
  expiresAt: number;
}
