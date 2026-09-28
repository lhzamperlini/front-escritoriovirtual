import { Component, ElementRef, OnInit, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';
import { ChatChannel } from '../chat.model';
import { WorkspaceContextService } from '../../../core/workspace/workspace-context.service';

type ChannelFilter = 'all' | 'Global' | 'Zone' | 'Direct';

@Component({
  selector: 'app-chat-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-drawer.component.html',
  styleUrls: ['./chat-drawer.component.scss']
})
export class ChatDrawerComponent implements OnInit {
  protected readonly chatService = inject(ChatService);
  protected readonly workspaceContext = inject(WorkspaceContextService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef<HTMLDivElement>;

  public readonly activeFilter = signal<ChannelFilter>('all');
  public messageInput = '';

  public readonly filteredChannels = computed(() => {
    const list = this.chatService.channels();
    const filter = this.activeFilter();
    if (filter === 'all') return list;
    return list.filter(c => c.channelType === filter);
  });

  constructor() {
    effect(() => {
      // Auto-scroll when messages update
      const msgs = this.chatService.activeMessages();
      if (msgs.length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  public ngOnInit(): void {
    const ws = this.workspaceContext.currentWorkspace();
    if (ws) {
      this.chatService.loadChannels(ws.id).subscribe();
    }
  }

  public setFilter(filter: ChannelFilter): void {
    this.activeFilter.set(filter);
  }

  public selectChannel(channel: ChatChannel): void {
    this.chatService.selectChannel(channel.id).subscribe();
  }

  public sendMessage(): void {
    const text = this.messageInput.trim();
    const channelId = this.chatService.activeChannelId();
    if (!text || !channelId) return;

    this.chatService.sendMessage(channelId, text).subscribe({
      next: () => {
        this.messageInput = '';
      }
    });
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  public close(): void {
    this.chatService.closeDrawer();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer?.nativeElement) {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  public formatContent(content: string): string {
    // Escape HTML first
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Linkify URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener" class="chat-link">$1</a>');

    // Highlight @mentions
    const mentionRegex = /(@[\wÀ-ÿ]+)/g;
    return withLinks.replace(mentionRegex, '<span class="chat-mention">$1</span>');
  }

  public getChannelIcon(type: string): string {
    switch (type) {
      case 'Global': return '🌐';
      case 'Zone': return '🪑';
      case 'Direct': return '💬';
      default: return '🗨️';
    }
  }
}
