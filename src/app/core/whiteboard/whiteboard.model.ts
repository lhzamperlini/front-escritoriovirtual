export interface WhiteboardDto {
  id: string;
  workspaceId: string;
  zoneId?: string | null;
  name: string;
  documentData: string;
  createdAt: string;
  lastUpdated: string;
}

export type WhiteboardElementType = 'pen' | 'rectangle' | 'sticky' | 'text';

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export interface WhiteboardElement {
  id: string;
  type: WhiteboardElementType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth?: number;
  points?: WhiteboardPoint[];
  text?: string;
}

export interface WhiteboardPatch {
  action: 'add' | 'update' | 'clear' | 'delete';
  element?: WhiteboardElement;
  elementId?: string;
}
