import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfficeHubService, KnockRequestEvent } from '../signalr/office-hub.service';

export interface RoomStatus {
  zoneId: string;
  isLocked: boolean;
  lockedByUserId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoomAccessService {
  private readonly http = inject(HttpClient);
  private readonly hubService = inject(OfficeHubService);

  // State
  public readonly lockedRooms = signal<Map<string, { isLocked: boolean; lockedByUserId?: string }>>(new Map());
  public readonly approvedRooms = signal<Set<string>>(new Set());
  public readonly incomingKnocks = signal<KnockRequestEvent[]>([]);
  public readonly activeKnockPrompt = signal<{ zoneId: string; zoneName: string } | null>(null);

  constructor() {
    this.hubService.roomLockToggled$.subscribe((event) => {
      this.lockedRooms.update(map => {
        const next = new Map(map);
        next.set(event.zoneId, { isLocked: event.isLocked, lockedByUserId: event.lockedByUserId });
        return next;
      });
    });

    this.hubService.knockRequested$.subscribe((event) => {
      this.incomingKnocks.update(list => [...list, event]);
    });

    this.hubService.knockResponded$.subscribe((event) => {
      if (event.approved) {
        this.approvedRooms.update(set => {
          const next = new Set(set);
          next.add(event.zoneId);
          return next;
        });
        if (this.activeKnockPrompt()?.zoneId === event.zoneId) {
          this.activeKnockPrompt.set(null);
        }
      }
    });
  }

  public isRoomLocked(zoneId: string): boolean {
    return this.lockedRooms().get(zoneId)?.isLocked ?? false;
  }

  public getLockedBy(zoneId: string): string | undefined {
    return this.lockedRooms().get(zoneId)?.lockedByUserId;
  }

  public canEnterRoom(zoneId: string, isOwnerOrAdmin: boolean, myUserId: string): boolean {
    if (isOwnerOrAdmin) return true; // US04: Chave-Mestra de Administrador / Dono
    const room = this.lockedRooms().get(zoneId);
    if (!room || !room.isLocked) return true; // Sala destrancada
    if (room.lockedByUserId === myUserId) return true; // Quem trancou pode entrar
    return this.approvedRooms().has(zoneId); // Convidado aprovado via Knock
  }

  public toggleRoomLock(mapId: string, zoneId: string, currentLockState: boolean): void {
    const nextState = !currentLockState;
    this.hubService.toggleRoomLock(mapId, zoneId, nextState);
    this.lockedRooms.update(map => {
      const next = new Map(map);
      next.set(zoneId, { isLocked: nextState });
      return next;
    });
  }

  public knock(zoneId: string, applicantName: string): void {
    this.hubService.knockRoom(zoneId, applicantName);
  }

  public respondKnock(zoneId: string, targetUserId: string, approved: boolean): void {
    this.hubService.respondKnock(zoneId, targetUserId, approved);
    this.incomingKnocks.update(list => list.filter(k => !(k.zoneId === zoneId && k.applicantUserId === targetUserId)));
  }

  public dismissKnock(zoneId: string, targetUserId: string): void {
    this.incomingKnocks.update(list => list.filter(k => !(k.zoneId === zoneId && k.applicantUserId === targetUserId)));
  }
}
