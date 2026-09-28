import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfficeHubService } from '../../core/signalr/office-hub.service';
import { ChatChannel, ChatMessage, ProximityBubble } from './chat.model';
import { Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly hubService = inject(OfficeHubService);

  public readonly isDrawerOpen = signal<boolean>(false);
  public readonly channels = signal<ChatChannel[]>([]);
  public readonly activeChannelId = signal<string | null>(null);
  public readonly activeMessages = signal<ChatMessage[]>([]);
  public readonly unreadCounts = signal<Record<string, number>>({});
  public readonly proximityBubbles = signal<ProximityBubble[]>([]);

  public readonly activeChannel = computed(() => {
    const id = this.activeChannelId();
    return this.channels().find(c => c.id === id) || null;
  });

  public readonly totalUnread = computed(() => {
    const counts = this.unreadCounts();
    return Object.values(counts).reduce((acc, count) => acc + count, 0);
  });

  private subscriptions = new Subscription();

  constructor() {
    this.setupSignalRListeners();
    this.startBubbleCleanupLoop();
  }

  private setupSignalRListeners(): void {
    // Escuta novas mensagens de canal em tempo real
    this.subscriptions.add(
      this.hubService.channelMessage$.subscribe(({ channelId, message }) => {
        if (this.activeChannelId() === channelId) {
          this.activeMessages.update(msgs => [...msgs, message]);
        } else {
          this.unreadCounts.update(counts => ({
            ...counts,
            [channelId]: (counts[channelId] || 0) + 1
          }));
        }
      })
    );

    // Escuta balões de mensagem de proximidade espacial (US01)
    this.subscriptions.add(
      this.hubService.proximityMessage$.subscribe(ev => {
        const bubble: ProximityBubble = {
          id: Math.random().toString(36).substring(2, 9),
          senderId: ev.senderId,
          senderName: ev.senderName,
          text: ev.text,
          x: ev.x,
          y: ev.y,
          expiresAt: Date.now() + 6000 // 6 segundos de duração
        };
        this.proximityBubbles.update(list => [...list, bubble]);
      })
    );
  }

  private startBubbleCleanupLoop(): void {
    setInterval(() => {
      const now = Date.now();
      const current = this.proximityBubbles();
      const active = current.filter(b => b.expiresAt > now);
      if (active.length !== current.length) {
        this.proximityBubbles.set(active);
      }
    }, 1000);
  }

  public toggleDrawer(): void {
    this.isDrawerOpen.update(v => !v);
  }

  public openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  public closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  public loadChannels(workspaceId: string) {
    return this.http.get<ChatChannel[]>(`/api/chat/workspaces/${workspaceId}/channels`).pipe(
      tap(channels => {
        this.channels.set(channels);
        if (channels.length > 0 && !this.activeChannelId()) {
          this.selectChannel(channels[0].id).subscribe();
        }
      })
    );
  }

  public selectChannel(channelId: string) {
    this.activeChannelId.set(channelId);

    // Limpa unread
    this.unreadCounts.update(counts => {
      const updated = { ...counts };
      delete updated[channelId];
      return updated;
    });

    // Carrega mensagens
    return this.http.get<ChatMessage[]>(`/api/chat/channels/${channelId}/messages`).pipe(
      tap(messages => {
        this.activeMessages.set(messages);
      })
    );
  }

  public sendMessage(channelId: string, content: string) {
    return this.http.post<ChatMessage>(`/api/chat/channels/${channelId}/messages`, { content }).pipe(
      tap(message => {
        if (this.activeChannelId() === channelId) {
          this.activeMessages.update(msgs => {
            if (msgs.some(m => m.id === message.id)) return msgs;
            return [...msgs, message];
          });
        }
      })
    );
  }

  public sendProximity(mapId: string, text: string, x: number, y: number): Promise<void> {
    return this.hubService.sendProximityMessage(mapId, text, x, y);
  }

  public openDirectChat(workspaceId: string, targetUserId: string) {
    return this.http.post<ChatChannel>(`/api/chat/workspaces/${workspaceId}/direct`, { targetUserId }).pipe(
      tap(channel => {
        this.channels.update(list => {
          if (!list.some(c => c.id === channel.id)) {
            return [...list, channel];
          }
          return list;
        });
        this.selectChannel(channel.id).subscribe();
        this.openDrawer();
      })
    );
  }

  public joinZoneChat(workspaceId: string, zoneId: string, zoneName: string) {
    return this.http.post<ChatChannel>(`/api/chat/workspaces/${workspaceId}/zone`, { zoneId, zoneName }).pipe(
      tap(channel => {
        this.channels.update(list => {
          if (!list.some(c => c.id === channel.id)) {
            return [...list, channel];
          }
          return list;
        });
        this.selectChannel(channel.id).subscribe();
      })
    );
  }
}
