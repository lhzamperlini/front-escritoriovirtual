import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardPage } from './dashboard.page';
import { AuthService } from '../../core/auth/auth.service';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { UserProfile } from '../../core/auth/user-profile.model';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  const mockProfile: UserProfile = {
    isAuthenticated: true,
    name: 'Desenvolvedor Belmiro',
    email: 'belmiro@curitiba.pr.gov.br',
    claims: { sub: '123-abc' }
  };

  const mockAuthService = {
    currentUser: signal<UserProfile | null>(mockProfile),
    isAuthenticated: signal(true),
    isLoading: signal(false),
    checkAuth: () => of(mockProfile),
    logout: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create dashboard page', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle claims visibility', () => {
    expect(component['showClaims']()).toBe(false);
    component.toggleClaims();
    expect(component['showClaims']()).toBe(true);
  });

  it('should change user status', () => {
    component.setStatus('focus');
    expect(component['currentStatus']()).toBe('focus');
  });
});
