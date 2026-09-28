import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';

type UserStatus = 'available' | 'focus' | 'in_meeting' | 'away';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss']
})
export class DashboardPage {
  protected readonly authService = inject(AuthService);
  protected readonly currentStatus = signal<UserStatus>('available');
  protected readonly showClaims = signal<boolean>(false);

  public setStatus(status: UserStatus) {
    this.currentStatus.set(status);
  }

  public toggleClaims() {
    this.showClaims.update(v => !v);
  }

  public logout() {
    this.authService.logout();
  }
}
