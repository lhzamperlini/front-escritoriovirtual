import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WhiteboardService } from '../../../core/whiteboard/whiteboard.service';
import { WhiteboardElement, WhiteboardElementType, WhiteboardPatch, WhiteboardPoint } from '../../../core/whiteboard/whiteboard.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-whiteboard-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './whiteboard-modal.component.html',
  styleUrls: ['./whiteboard-modal.component.scss']
})
export class WhiteboardModalComponent implements OnInit, OnDestroy {
  public readonly whiteboardService = inject(WhiteboardService);

  @ViewChild('boardCanvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  public readonly activeTool = signal<WhiteboardElementType | 'eraser'>('pen');
  public readonly activeColor = signal<string>('#fbbf24');
  public readonly activeStrokeWidth = signal<number>(3);
  public readonly elements = signal<WhiteboardElement[]>([]);
  public readonly isDrawing = signal<boolean>(false);

  public newStickyText = 'Ideia para Sprint';
  private currentDrawingPoints: WhiteboardPoint[] = [];
  private startPoint: WhiteboardPoint | null = null;
  private sub?: Subscription;

  public readonly colorPalette = [
    { label: 'Amarelo Post-It', hex: '#fbbf24' },
    { label: 'Branco', hex: '#f8fafc' },
    { label: 'Esmeralda', hex: '#34d399' },
    { label: 'Azul Céu', hex: '#38bdf8' },
    { label: 'Rosa Neon', hex: '#f472b6' },
    { label: 'Violeta', hex: '#a78bfa' }
  ];

  constructor() {
    effect(() => {
      const board = this.whiteboardService.activeBoard();
      if (board && board.documentData && board.documentData !== '{}') {
        try {
          const parsed = JSON.parse(board.documentData);
          if (Array.isArray(parsed.elements)) {
            this.elements.set(parsed.elements);
            setTimeout(() => this.redrawCanvas(), 50);
          }
        } catch {
          // ignore corrupted initial data
        }
      }
    });
  }

  public ngOnInit(): void {
    this.sub = this.whiteboardService.deltaReceived$.subscribe((delta) => {
      if (delta.zoneId === this.whiteboardService.activeZoneId()) {
        this.applyRemotePatch(delta.patch);
      }
    });
  }

  public ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  public setTool(tool: WhiteboardElementType | 'eraser'): void {
    this.activeTool.set(tool);
  }

  public setColor(color: string): void {
    this.activeColor.set(color);
  }

  public setStrokeWidth(width: number): void {
    this.activeStrokeWidth.set(width);
  }

  public onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tool = this.activeTool();

    if (tool === 'eraser') {
      this.eraseElementAt(x, y);
      return;
    }

    if (tool === 'sticky') {
      this.addStickyNote(x, y);
      return;
    }

    this.isDrawing.set(true);
    this.startPoint = { x, y };

    if (tool === 'pen') {
      this.currentDrawingPoints = [{ x, y }];
    }
  }

  public onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing()) return;
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tool = this.activeTool();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen') {
      this.currentDrawingPoints.push({ x, y });
      this.redrawCanvas();
      this.drawPenStroke(ctx, this.currentDrawingPoints, this.activeColor(), this.activeStrokeWidth());
    } else if (tool === 'rectangle' && this.startPoint) {
      this.redrawCanvas();
      ctx.strokeStyle = this.activeColor();
      ctx.lineWidth = this.activeStrokeWidth();
      ctx.strokeRect(
        this.startPoint.x,
        this.startPoint.y,
        x - this.startPoint.x,
        y - this.startPoint.y
      );
    }
  }

  public onMouseUp(event: MouseEvent): void {
    if (!this.isDrawing()) return;
    this.isDrawing.set(false);

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || !this.startPoint) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const tool = this.activeTool();

    if (tool === 'pen' && this.currentDrawingPoints.length > 1) {
      const newEl: WhiteboardElement = {
        id: 'el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        type: 'pen',
        x: this.startPoint.x,
        y: this.startPoint.y,
        color: this.activeColor(),
        strokeWidth: this.activeStrokeWidth(),
        points: [...this.currentDrawingPoints]
      };
      this.addElement(newEl);
    } else if (tool === 'rectangle') {
      const width = x - this.startPoint.x;
      const height = y - this.startPoint.y;
      if (Math.abs(width) > 5 && Math.abs(height) > 5) {
        const newEl: WhiteboardElement = {
          id: 'el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          type: 'rectangle',
          x: width < 0 ? x : this.startPoint.x,
          y: height < 0 ? y : this.startPoint.y,
          width: Math.abs(width),
          height: Math.abs(height),
          color: this.activeColor(),
          strokeWidth: this.activeStrokeWidth()
        };
        this.addElement(newEl);
      }
    }

    this.currentDrawingPoints = [];
    this.startPoint = null;
    this.redrawCanvas();
  }

  public addStickyNote(x: number, y: number): void {
    const newEl: WhiteboardElement = {
      id: 'el_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'sticky',
      x,
      y,
      width: 140,
      height: 100,
      color: this.activeColor(),
      text: this.newStickyText || 'Nota'
    };
    this.addElement(newEl);
    this.redrawCanvas();
  }

  public addElement(el: WhiteboardElement): void {
    this.elements.update(list => [...list, el]);
    const zoneId = this.whiteboardService.activeZoneId();
    if (zoneId) {
      this.whiteboardService.broadcastPatch(zoneId, {
        action: 'add',
        element: el
      });
    }
  }

  public eraseElementAt(x: number, y: number): void {
    const list = this.elements();
    const index = list.findIndex(el => {
      if (el.type === 'rectangle' || el.type === 'sticky') {
        const w = el.width || 100;
        const h = el.height || 60;
        return x >= el.x && x <= el.x + w && y >= el.y && y <= el.y + h;
      }
      return false;
    });

    if (index >= 0) {
      const removed = list[index];
      this.elements.update(l => l.filter((_, i) => i !== index));
      this.redrawCanvas();

      const zoneId = this.whiteboardService.activeZoneId();
      if (zoneId) {
        this.whiteboardService.broadcastPatch(zoneId, {
          action: 'delete',
          elementId: removed.id
        });
      }
    }
  }

  public undo(): void {
    const list = this.elements();
    if (list.length === 0) return;
    const last = list[list.length - 1];
    this.elements.update(l => l.slice(0, -1));
    this.redrawCanvas();

    const zoneId = this.whiteboardService.activeZoneId();
    if (zoneId) {
      this.whiteboardService.broadcastPatch(zoneId, {
        action: 'delete',
        elementId: last.id
      });
    }
  }

  public clearAll(): void {
    this.elements.set([]);
    this.redrawCanvas();

    const zoneId = this.whiteboardService.activeZoneId();
    if (zoneId) {
      this.whiteboardService.broadcastPatch(zoneId, {
        action: 'clear'
      });
    }
  }

  public saveSnapshot(): void {
    const board = this.whiteboardService.activeBoard();
    if (!board) return;

    const dataJson = JSON.stringify({ elements: this.elements() });
    this.whiteboardService.saveSnapshot(board.id, dataJson).subscribe({
      next: () => {
        alert('Quadro salvo com sucesso!');
      },
      error: () => {
        alert('Erro ao salvar snapshot do quadro.');
      }
    });
  }

  public applyRemotePatch(patch: WhiteboardPatch): void {
    if (patch.action === 'add' && patch.element) {
      this.elements.update(list => [...list.filter(e => e.id !== patch.element!.id), patch.element!]);
    } else if (patch.action === 'delete' && patch.elementId) {
      this.elements.update(list => list.filter(e => e.id !== patch.elementId));
    } else if (patch.action === 'clear') {
      this.elements.set([]);
    }
    this.redrawCanvas();
  }

  public redrawCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const el of this.elements()) {
      if (el.type === 'pen' && el.points) {
        this.drawPenStroke(ctx, el.points, el.color, el.strokeWidth || 3);
      } else if (el.type === 'rectangle' && el.width && el.height) {
        ctx.strokeStyle = el.color;
        ctx.lineWidth = el.strokeWidth || 3;
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      } else if (el.type === 'sticky') {
        this.drawStickyNote(ctx, el);
      }
    }
  }

  private drawPenStroke(ctx: CanvasRenderingContext2D, points: WhiteboardPoint[], color: string, width: number): void {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  private drawStickyNote(ctx: CanvasRenderingContext2D, el: WhiteboardElement): void {
    const w = el.width || 140;
    const h = el.height || 100;

    // Sombra do Post-It
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(el.x + 4, el.y + 4, w, h);

    // Corpo da nota adesiva
    ctx.fillStyle = el.color;
    ctx.fillRect(el.x, el.y, w, h);

    // Texto
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText(el.text || 'Nota', el.x + 10, el.y + 24, w - 20);
  }

  public close(): void {
    this.whiteboardService.closeWhiteboard();
  }
}
