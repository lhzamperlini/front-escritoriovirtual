import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, tap } from 'rxjs';
import { UserProfile } from './user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  public readonly currentUser = signal<UserProfile | null>(null);
  public readonly isAuthenticated = signal<boolean>(false);
  public readonly isLoading = signal<boolean>(true);

  public checkAuth() {
    this.isLoading.set(true);
    return this.http.get<UserProfile>('/api/auth/me').pipe(
      tap(profile => {
        this.currentUser.set(profile);
        this.isAuthenticated.set(true);
        this.isLoading.set(false);
      }),
      map(profile => profile),
      catchError(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  public login(returnUrl: string = '/dashboard') {
    window.location.href = `/api/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  public logout() {
    window.location.href = '/api/auth/logout';
  }
}
