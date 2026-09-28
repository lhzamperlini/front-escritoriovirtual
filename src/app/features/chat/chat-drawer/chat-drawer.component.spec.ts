import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatDrawerComponent } from './chat-drawer.component';
import { ChatService } from '../chat.service';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';
import { OfficeHubService } from '../../../core/signalr/office-hub.service';
import { of, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ChatDrawerComponent', () => {
  let component: ChatDrawerComponent;
  let fixture: ComponentFixture<ChatDrawerComponent>;
  let chatService: ChatService;

  beforeEach(async () => {
    const hubServiceMock = {
      channelMessage$: new Subject<any>(),
      proximityMessage$: new Subject<any>(),
      sendProximityMessage: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [ChatDrawerComponent],
      providers: [
        ChatService,
        WorkspaceContextService,
        { provide: OfficeHubService, useValue: hubServiceMock },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatDrawerComponent);
    component = fixture.componentInstance;
    chatService = TestBed.inject(ChatService);
    chatService.openDrawer();
    fixture.detectChanges();
  });

  it('should create ChatDrawerComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should filter channels correctly', () => {
    chatService.channels.set([
      { id: '1', workspaceId: 'w1', channelType: 'Global', name: '#geral', createdAt: '', memberCount: 5 },
      { id: '2', workspaceId: 'w1', channelType: 'Zone', name: '#sala-1', createdAt: '', memberCount: 2 },
      { id: '3', workspaceId: 'w1', channelType: 'Direct', name: 'Alice', createdAt: '', memberCount: 2 }
    ]);

    component.setFilter('Zone');
    expect(component.filteredChannels().length).toBe(1);
    expect(component.filteredChannels()[0].channelType).toBe('Zone');

    component.setFilter('all');
    expect(component.filteredChannels().length).toBe(3);
  });

  it('should format message content with links and mentions', () => {
    const formatted = component.formatContent('Acesse https://github.com e fale com @Alice!');
    expect(formatted).toContain('class="chat-link"');
    expect(formatted).toContain('class="chat-mention"');
  });

  it('should close drawer on close()', () => {
    component.close();
    expect(chatService.isDrawerOpen()).toBe(false);
  });
});
