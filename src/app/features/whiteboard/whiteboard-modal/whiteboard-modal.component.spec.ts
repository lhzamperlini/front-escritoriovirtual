import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhiteboardModalComponent } from './whiteboard-modal.component';
import { WhiteboardService } from '../../../core/whiteboard/whiteboard.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { of, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('WhiteboardModalComponent', () => {
  let component: WhiteboardModalComponent;
  let fixture: ComponentFixture<WhiteboardModalComponent>;
  let mockWhiteboardService: any;

  beforeEach(async () => {
    mockWhiteboardService = {
      isModalOpen: signal(true),
      activeBoard: signal({
        id: 'b-1',
        workspaceId: 'ws-1',
        name: 'Quadro Teste',
        documentData: '{"elements": []}',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }),
      activeZoneId: signal('zone-1'),
      isSaving: signal(false),
      deltaReceived$: new Subject(),
      saveSnapshot: vi.fn().mockReturnValue(of({})),
      broadcastPatch: vi.fn(),
      closeWhiteboard: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [WhiteboardModalComponent, HttpClientTestingModule],
      providers: [
        { provide: WhiteboardService, useValue: mockWhiteboardService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WhiteboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create WhiteboardModalComponent', () => {
    expect(component).toBeTruthy();
    expect(component.activeTool()).toBe('pen');
    expect(component.activeColor()).toBe('#fbbf24');
  });

  it('should change active tool and color', () => {
    component.setTool('rectangle');
    expect(component.activeTool()).toBe('rectangle');

    component.setColor('#38bdf8');
    expect(component.activeColor()).toBe('#38bdf8');

    component.setStrokeWidth(8);
    expect(component.activeStrokeWidth()).toBe(8);
  });

  it('addElement should update elements and broadcast patch', () => {
    const el = {
      id: 'el-1',
      type: 'sticky' as const,
      x: 100,
      y: 100,
      color: '#fbbf24',
      text: 'Nota Teste'
    };

    component.addElement(el);
    expect(component.elements().length).toBe(1);
    expect(mockWhiteboardService.broadcastPatch).toHaveBeenCalledWith('zone-1', {
      action: 'add',
      element: el
    });
  });

  it('undo should remove last element and broadcast delete patch', () => {
    const el1 = { id: 'el-1', type: 'sticky' as const, x: 10, y: 10, color: '#fbbf24' };
    const el2 = { id: 'el-2', type: 'sticky' as const, x: 20, y: 20, color: '#fbbf24' };

    component.addElement(el1);
    component.addElement(el2);
    expect(component.elements().length).toBe(2);

    component.undo();
    expect(component.elements().length).toBe(1);
    expect(mockWhiteboardService.broadcastPatch).toHaveBeenCalledWith('zone-1', {
      action: 'delete',
      elementId: 'el-2'
    });
  });

  it('clearAll should empty elements and broadcast clear patch', () => {
    component.addElement({ id: 'el-1', type: 'sticky' as const, x: 10, y: 10, color: '#fbbf24' });
    expect(component.elements().length).toBe(1);

    component.clearAll();
    expect(component.elements().length).toBe(0);
    expect(mockWhiteboardService.broadcastPatch).toHaveBeenCalledWith('zone-1', {
      action: 'clear'
    });
  });

  it('applyRemotePatch should handle incoming delta add and delete', () => {
    component.applyRemotePatch({
      action: 'add',
      element: { id: 'remote-1', type: 'rectangle', x: 50, y: 50, width: 80, height: 40, color: '#f8fafc' }
    });
    expect(component.elements().length).toBe(1);

    component.applyRemotePatch({
      action: 'delete',
      elementId: 'remote-1'
    });
    expect(component.elements().length).toBe(0);
  });

  it('saveSnapshot should invoke whiteboardService.saveSnapshot', () => {
    component.addElement({ id: 'el-1', type: 'sticky' as const, x: 10, y: 10, color: '#fbbf24' });
    component.saveSnapshot();

    expect(mockWhiteboardService.saveSnapshot).toHaveBeenCalledWith('b-1', expect.stringContaining('el-1'));
  });

  it('close should call whiteboardService.closeWhiteboard', () => {
    component.close();
    expect(mockWhiteboardService.closeWhiteboard).toHaveBeenCalled();
  });
});
