import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { MapData, MapObject, MapZone } from './map.model';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly http = inject(HttpClient);

  public readonly currentMap = signal<MapData | null>(null);
  public readonly workspaceMaps = signal<MapData[]>([]);
  public readonly isEditMode = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(false);
  public readonly isSaving = signal<boolean>(false);

  public loadWorkspaceMaps(workspaceId: string): Observable<MapData[]> {
    this.isLoading.set(true);
    return this.http.get<MapData[]>(`/api/workspaces/${workspaceId}/maps`, { withCredentials: true }).pipe(
      tap((maps) => {
        this.workspaceMaps.set(maps);
        this.isLoading.set(false);
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of([]);
      })
    );
  }

  public loadMap(mapId: string): Observable<MapData> {
    this.isLoading.set(true);
    return this.http.get<MapData>(`/api/maps/${mapId}`, { withCredentials: true }).pipe(
      tap((map) => {
        this.currentMap.set(map);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  public createMap(workspaceId: string, name: string, gridWidth = 100, gridHeight = 100, tileSize = 32): Observable<MapData> {
    this.isLoading.set(true);
    return this.http.post<MapData>(`/api/workspaces/${workspaceId}/maps`, {
      workspaceId,
      name,
      gridWidth,
      gridHeight,
      tileSize
    }, { withCredentials: true }).pipe(
      tap((created) => {
        this.currentMap.set(created);
        const list = this.workspaceMaps();
        this.workspaceMaps.set([...list, created]);
        this.isLoading.set(false);
      }),
      catchError((err) => {
        this.isLoading.set(false);
        throw err;
      })
    );
  }

  public saveMapLayout(mapId: string, objects: MapObject[], zones: MapZone[]): Observable<MapData> {
    this.isSaving.set(true);
    return this.http.put<MapData>(`/api/maps/${mapId}/layout`, { objects, zones }, { withCredentials: true }).pipe(
      tap((updated) => {
        this.currentMap.set(updated);
        this.isSaving.set(false);
      }),
      catchError((err) => {
        this.isSaving.set(false);
        throw err;
      })
    );
  }

  public importTiled(mapId: string, tiledJson: string): Observable<MapData> {
    this.isSaving.set(true);
    return this.http.post<MapData>(`/api/maps/${mapId}/import-tiled`, tiledJson, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    }).pipe(
      tap((updated) => {
        this.currentMap.set(updated);
        this.isSaving.set(false);
      }),
      catchError((err) => {
        this.isSaving.set(false);
        throw err;
      })
    );
  }

  public toggleEditMode(): void {
    this.isEditMode.update((v) => !v);
  }
}
