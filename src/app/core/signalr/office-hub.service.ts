import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

export interface AvatarUpdateEvent {
  userId: string;
  avatarConfig: any;
}

export interface UserPresenceEvent {
  userId: string;
  connectionId?: string;
  mapId: string;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  status: string;
  lastHeartbeat: number;
}

export interface UserMovementEvent {
  userId: string;
  x: number;
  y: number;
  gridX: number;
  gridY: number;
  direction: string;
  isMoving: boolean;
}

export interface ProximityMessageEvent {
  senderId: string;
  senderName: string;
  text: string;
  x: number;
  y: number;
}

export interface RoomLockEvent {
  zoneId: string;
  isLocked: boolean;
  lockedByUserId: string;
}

export interface KnockRequestEvent {
  zoneId: string;
  applicantUserId: string;
  applicantName: string;
}

export interface KnockResponseEvent {
  zoneId: string;
  approved: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfficeHubService {
  private hubConnection: signalR.HubConnection | null = null;
  public readonly isConnected = signal<boolean>(false);

  public readonly currentMapPresences$ = new Subject<UserPresenceEvent[]>();
  public readonly avatarUpdated$ = new Subject<AvatarUpdateEvent>();
  public readonly userJoined$ = new Subject<UserPresenceEvent>();
  public readonly userLeft$ = new Subject<string>();
  public readonly userMoved$ = new Subject<UserMovementEvent>();
  public readonly statusChanged$ = new Subject<{ userId: string; status: string }>();
  public readonly proximityMessage$ = new Subject<ProximityMessageEvent>();
  public readonly channelMessage$ = new Subject<{ channelId: string; message: any }>();
  public readonly roomLockToggled$ = new Subject<RoomLockEvent>();
  public readonly knockRequested$ = new Subject<KnockRequestEvent>();
  public readonly knockResponded$ = new Subject<KnockResponseEvent>();
  public readonly whiteboardUpdated$ = new Subject<{ zoneId: string; patch: any }>();

  public async startConnection(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/office', {
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.registerServerEvents();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
    } catch {
      // In unit test or when API is offline, gracefully set false
      this.isConnected.set(false);
    }

    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }

  private registerServerEvents(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('CurrentMapPresences', (presences: any) => {
      this.currentMapPresences$.next(Array.isArray(presences) ? presences : []);
    });

    this.hubConnection.on('AvatarUpdated', (userId: string, newAvatarConfig: any) => {
      this.avatarUpdated$.next({ userId, avatarConfig: newAvatarConfig });
    });

    this.hubConnection.on('UserJoined', (presence: any) => {
      this.userJoined$.next(presence);
    });

    this.hubConnection.on('UserLeft', (userId: string) => {
      this.userLeft$.next(userId);
    });

    this.hubConnection.on('UserMoved', (userId: string, x: number, y: number, gridX: number, gridY: number, direction: string, isMoving: boolean) => {
      this.userMoved$.next({ userId, x, y, gridX, gridY, direction, isMoving });
    });

    this.hubConnection.on('StatusChanged', (userId: string, status: string) => {
      this.statusChanged$.next({ userId, status });
    });

    this.hubConnection.on('ReceiveProximityMessage', (senderId: string, senderName: string, text: string, x: number, y: number) => {
      this.proximityMessage$.next({ senderId, senderName, text, x, y });
    });

    this.hubConnection.on('ReceiveChannelMessage', (channelId: string, message: any) => {
      this.channelMessage$.next({ channelId, message });
    });

    this.hubConnection.on('RoomLockToggled', (zoneId: string, isLocked: boolean, lockedByUserId: string) => {
      this.roomLockToggled$.next({ zoneId, isLocked, lockedByUserId });
    });

    this.hubConnection.on('KnockRequested', (zoneId: string, applicantUserId: string, applicantName: string) => {
      this.knockRequested$.next({ zoneId, applicantUserId, applicantName });
    });

    this.hubConnection.on('KnockResponded', (zoneId: string, approved: boolean) => {
      this.knockResponded$.next({ zoneId, approved });
    });

    this.hubConnection.on('WhiteboardUpdated', (zoneId: string, patch: any) => {
      this.whiteboardUpdated$.next({ zoneId, patch });
    });
  }

  public async joinMap(workspaceId: string, mapId: string, startX = 400, startY = 300): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinMap', workspaceId, mapId, startX, startY);
    }
  }

  public async leaveMap(mapId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveMap', mapId);
    }
  }

  public async moveStart(mapId: string, direction: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('MoveStart', mapId, direction);
    }
  }

  public async moveStop(mapId: string, x: number, y: number, gridX: number, gridY: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('MoveStop', mapId, x, y, gridX, gridY);
    }
  }

  public async heartbeat(mapId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('Heartbeat', mapId);
    }
  }

  public async changeStatus(mapId: string, status: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('ChangeStatus', mapId, status);
    }
  }

  public async sendProximityMessage(mapId: string, text: string, x: number, y: number): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SendProximityMessage', mapId, text, x, y);
    }
  }

  public async joinZone(zoneId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('JoinZone', zoneId);
    }
  }

  public async leaveZone(zoneId: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('LeaveZone', zoneId);
    }
  }

  public async toggleRoomLock(mapId: string, zoneId: string, isLocked: boolean): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('ToggleRoomLock', mapId, zoneId, isLocked);
    }
  }

  public async knockRoom(zoneId: string, applicantName: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('KnockRoom', zoneId, applicantName);
    }
  }

  public async respondKnock(zoneId: string, targetUserId: string, approved: boolean): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('RespondKnock', zoneId, targetUserId, approved);
    }
  }

  public async broadcastWhiteboardUpdate(zoneId: string, patch: any): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('BroadcastWhiteboardUpdate', zoneId, patch);
    }
  }
}
