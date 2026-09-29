import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { WhiteboardDto, WhiteboardPatch } from './whiteboard.model';
import { OfficeHubService } from '../signalr/office-hub.service';

@Injectable({
  providedIn: 'root'
})
export class WhiteboardService {
  private readonly http = inject(HttpClient);
  private readonly hubService = inject(OfficeHubService);

  public readonly isModalOpen = signal<boolean>(false);
  public readonly activeBoard = signal<WhiteboardDto | null>(null);
  public readonly activeZoneId = signal<string | null>(null);
  public readonly isSaving = signal<boolean>(false);

  public readonly deltaReceived$ = new Subject<{ zoneId: string; patch: WhiteboardPatch }>();

  constructor() {
    this.hubService.whiteboardUpdated$.subscribe((event) => {
      this.deltaReceived$.next({
        zoneId: event.zoneId,
        patch: event.patch as WhiteboardPatch
      });
    });
  }

  public openWhiteboard(workspaceId: string, zoneId: string): void {
    this.activeZoneId.set(zoneId);
    this.isModalOpen.set(true);

    this.loadZoneWhiteboard(workspaceId, zoneId).subscribe({
      next: (board) => {
        this.activeBoard.set(board);
      },
      error: () => {
        // Fallback default board
        this.activeBoard.set({
          id: 'temp-id',
          workspaceId,
          zoneId,
          name: 'Quadro da Sala',
          documentData: '{}',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }
    });
  }

  public closeWhiteboard(): void {
    this.isModalOpen.set(false);
    this.activeBoard.set(null);
    this.activeZoneId.set(null);
  }

  public loadZoneWhiteboard(workspaceId: string, zoneId: string): Observable<WhiteboardDto> {
    return this.http.get<WhiteboardDto>(`/api/workspaces/${workspaceId}/whiteboards?zoneId=${zoneId}`);
  }

  public saveSnapshot(whiteboardId: string, documentData: string): Observable<WhiteboardDto> {
    this.isSaving.set(true);
    return this.http.put<WhiteboardDto>(`/api/whiteboards/${whiteboardId}`, { documentData }).pipe(
      tap({
        next: (updated) => {
          this.activeBoard.set(updated);
          this.isSaving.set(false);
        },
        error: () => {
          this.isSaving.set(false);
        }
      })
    );
  }

  public broadcastPatch(zoneId: string, patch: WhiteboardPatch): void {
    this.hubService.broadcastWhiteboardUpdate(zoneId, patch);
  }
}
