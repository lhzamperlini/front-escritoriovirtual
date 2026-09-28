import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { AvatarConfig, DEFAULT_AVATAR_CONFIG } from './avatar.model';
import { OfficeHubService } from '../../core/signalr/office-hub.service';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private readonly http = inject(HttpClient);
  private readonly officeHub = inject(OfficeHubService);

  public readonly currentAvatar = signal<AvatarConfig>(DEFAULT_AVATAR_CONFIG);
  public readonly isSaving = signal<boolean>(false);
  public readonly isLoaded = signal<boolean>(false);

  constructor() {
    this.officeHub.avatarUpdated$.subscribe((event) => {
      if (event && event.avatarConfig) {
        this.currentAvatar.set(event.avatarConfig);
      }
    });
  }

  public loadMyAvatar(): Observable<AvatarConfig> {
    return this.http.get<AvatarConfig>('/api/users/me/avatar', { withCredentials: true }).pipe(
      tap((config) => {
        if (config) {
          this.currentAvatar.set(config);
          this.isLoaded.set(true);
        }
      }),
      catchError((err) => {
        this.currentAvatar.set(DEFAULT_AVATAR_CONFIG);
        this.isLoaded.set(true);
        return of(DEFAULT_AVATAR_CONFIG);
      })
    );
  }

  public saveAvatar(config: AvatarConfig): Observable<AvatarConfig> {
    this.isSaving.set(true);
    return this.http.put<AvatarConfig>('/api/users/me/avatar', config, { withCredentials: true }).pipe(
      tap((saved) => {
        this.currentAvatar.set(saved);
        this.isSaving.set(false);
      }),
      catchError((err) => {
        this.isSaving.set(false);
        throw err;
      })
    );
  }

  public updateLocalDraft(config: AvatarConfig): void {
    this.currentAvatar.set(config);
  }
}
