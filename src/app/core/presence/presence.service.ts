import { Injectable, computed, inject, signal } from '@angular/core';
import { OfficeHubService, UserMovementEvent, UserPresenceEvent } from '../signalr/office-hub.service';
import { Subscription } from 'rxjs';

export interface PresenceState extends UserPresenceEvent {
  direction?: string;
  isMoving?: boolean;
  avatarConfig?: any;
  fullName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private readonly hubService = inject(OfficeHubService);

  public readonly currentMapId = signal<string | null>(null);
  public readonly myUserId = signal<string | null>(null);
  public readonly myPresence = signal<PresenceState | null>(null);
  private readonly presencesMap = signal<Map<string, PresenceState>>(new Map());

  public readonly remoteUsers = computed(() => {
    const map = this.presencesMap();
    const myId = (this.myUserId() || '').toLowerCase();
    const myState = this.myPresence();
    const list: PresenceState[] = [];
    map.forEach((val, key) => {
      const valKey = (key || '').toLowerCase();
      const valUserId = (val.userId || '').toLowerCase();
      if (myId && (valKey === myId || valUserId === myId)) {
        return;
      }
      if (myState && val.connectionId && myState.connectionId && val.connectionId === myState.connectionId) {
        return;
      }
      list.push(val);
    });
    return list;
  });

  public readonly allUsers = computed(() => {
    return Array.from(this.presencesMap().values());
  });

  private subscriptions = new Subscription();
  private heartbeatTimer: any = null;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    this.subscriptions.add(
      this.hubService.currentMapPresences$.subscribe(presences => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        for (const p of presences) {
          nextMap.set(p.userId, {
            ...p,
            direction: (p as any).direction || 'down',
            isMoving: (p as any).isMoving || false,
            fullName: (p as any).fullName || 'Colega'
          });
        }
        this.presencesMap.set(nextMap);
      })
    );

    this.subscriptions.add(
      this.hubService.userJoined$.subscribe(presence => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        nextMap.set(presence.userId, {
          ...presence,
          direction: (presence as any).direction || 'down',
          isMoving: (presence as any).isMoving || false,
          fullName: (presence as any).fullName || 'Colega'
        });
        this.presencesMap.set(nextMap);
      })
    );

    this.subscriptions.add(
      this.hubService.userLeft$.subscribe(userId => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        nextMap.delete(userId);
        this.presencesMap.set(nextMap);
      })
    );

    this.subscriptions.add(
      this.hubService.userMoved$.subscribe((move: UserMovementEvent) => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        const existing = nextMap.get(move.userId);
        if (existing) {
          nextMap.set(move.userId, {
            ...existing,
            x: move.x > 0 ? move.x : existing.x,
            y: move.y > 0 ? move.y : existing.y,
            gridX: move.gridX > 0 ? move.gridX : existing.gridX,
            gridY: move.gridY > 0 ? move.gridY : existing.gridY,
            direction: move.direction,
            isMoving: move.isMoving
          });
          this.presencesMap.set(nextMap);
        }
      })
    );

    this.subscriptions.add(
      this.hubService.statusChanged$.subscribe(({ userId, status }) => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        const existing = nextMap.get(userId);
        if (existing) {
          nextMap.set(userId, { ...existing, status });
          this.presencesMap.set(nextMap);
        }
      })
    );

    this.subscriptions.add(
      this.hubService.avatarUpdated$.subscribe(({ userId, avatarConfig }) => {
        const nextMap = new Map<string, PresenceState>(this.presencesMap());
        const existing = nextMap.get(userId);
        if (existing) {
          nextMap.set(userId, { ...existing, avatarConfig });
          this.presencesMap.set(nextMap);
        }
      })
    );
  }

  public async joinMap(workspaceId: string, mapId: string, startX = 320, startY = 320): Promise<void> {
    this.currentMapId.set(mapId);
    await this.hubService.startConnection();
    await this.hubService.joinMap(workspaceId, mapId, startX, startY);

    const initialMyPresence: PresenceState = {
      userId: this.myUserId() || 'me',
      mapId,
      x: startX,
      y: startY,
      gridX: Math.floor(startX / 32),
      gridY: Math.floor(startY / 32),
      status: 'available',
      lastHeartbeat: Date.now(),
      direction: 'down',
      isMoving: false
    };
    this.myPresence.set(initialMyPresence);

    this.startHeartbeat(mapId);
  }

  public async leaveMap(): Promise<void> {
    const mapId = this.currentMapId();
    if (mapId) {
      await this.hubService.leaveMap(mapId);
      this.currentMapId.set(null);
    }
    this.stopHeartbeat();
    this.presencesMap.set(new Map());
  }

  public async moveStart(direction: string): Promise<void> {
    const mapId = this.currentMapId();
    if (mapId) {
      await this.hubService.moveStart(mapId, direction);
      const current = this.myPresence();
      if (current) {
        this.myPresence.set({ ...current, direction, isMoving: true });
      }
    }
  }

  public async moveStop(x: number, y: number, gridX: number, gridY: number): Promise<void> {
    const mapId = this.currentMapId();
    if (mapId) {
      const current = this.myPresence();
      if (current) {
        this.myPresence.set({
          ...current,
          x,
          y,
          gridX,
          gridY,
          isMoving: false
        });
      }
      await this.hubService.moveStop(mapId, x, y, gridX, gridY);
    }
  }

  public async setStatus(status: string): Promise<void> {
    const mapId = this.currentMapId();
    if (mapId) {
      const current = this.myPresence();
      if (current) {
        this.myPresence.set({ ...current, status });
      }
      await this.hubService.changeStatus(mapId, status);
    }
  }

  public startHeartbeat(mapId: string): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(async () => {
      await this.hubService.heartbeat(mapId);
    }, 5000);
  }

  public stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
