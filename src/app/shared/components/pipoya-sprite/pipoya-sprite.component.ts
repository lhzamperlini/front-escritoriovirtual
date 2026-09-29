import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpriteDirection = 'down' | 'left' | 'right' | 'up';

@Component({
  selector: 'app-pipoya-sprite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="pipoya-sprite-container"
      [class.moving]="isMoving()"
      [class.glow-player]="glow()"
      [style.width.px]="frameSize * scale()"
      [style.height.px]="frameSize * scale()"
      [style.backgroundImage]="'url(\\'' + resolvedUrl() + '\\')'"
      [style.backgroundSize]="(frameSize * 3 * scale()) + 'px ' + (frameSize * 4 * scale()) + 'px'"
      [style.backgroundPosition]="backgroundPosition()"
      [style.--frame-step-size.px]="frameSize * scale()">
    </div>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
      vertical-align: middle;
    }

    .pipoya-sprite-container {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      background-repeat: no-repeat;
      transition: filter 0.2s ease;
      position: relative;
      box-sizing: border-box;
    }

    .glow-player {
      filter: drop-shadow(0 0 6px rgba(59, 130, 246, 0.6));
    }

    /* Animação fluida de passos quando isMoving = true */
    .pipoya-sprite-container.moving {
      animation: pipoyaWalkAnim 0.6s steps(1) infinite;
    }

    @keyframes pipoyaWalkAnim {
      0% {
        /* Passo Esquerdo: Coluna 0 */
        background-position-x: 0px !important;
      }
      25% {
        /* Parado / Neutro: Coluna 1 */
        background-position-x: calc(-1 * var(--frame-step-size, 32px)) !important;
      }
      50% {
        /* Passo Direito: Coluna 2 */
        background-position-x: calc(-2 * var(--frame-step-size, 32px)) !important;
      }
      75% {
        /* Parado / Neutro: Coluna 1 */
        background-position-x: calc(-1 * var(--frame-step-size, 32px)) !important;
      }
      100% {
        background-position-x: 0px !important;
      }
    }
  `]
})
export class PipoyaSpriteComponent {
  public readonly model = input<string>('Male_01-1.png');
  public readonly direction = input<SpriteDirection | string>('down');
  public readonly isMoving = input<boolean>(false);
  public readonly scale = input<number>(1);
  public readonly glow = input<boolean>(false);

  public readonly frameSize = 32;

  public readonly resolvedUrl = computed(() => {
    let raw = this.model() || 'Male_01-1.png';
    // Normaliza espaços para underscores para compatibilidade cross-platform perfeita
    const normalizedFilename = raw.replace(/ /g, '_');
    
    if (normalizedFilename.startsWith('/assets/')) return encodeURI(normalizedFilename);
    if (normalizedFilename.startsWith('assets/')) return encodeURI('/' + normalizedFilename);
    return encodeURI(`/assets/characters/pipoya/${normalizedFilename}`);
  });

  public readonly normalizedDirection = computed<SpriteDirection>(() => {
    const dir = (this.direction() || 'down').toString().toLowerCase();
    if (dir.includes('up') || dir === '180') return 'up';
    if (dir.includes('left') || dir === '270') return 'left';
    if (dir.includes('right') || dir === '90') return 'right';
    return 'down';
  });

  public readonly rowNumber = computed<number>(() => {
    switch (this.normalizedDirection()) {
      case 'down': return 0;
      case 'left': return 1;
      case 'right': return 2;
      case 'up': return 3;
      default: return 0;
    }
  });

  public readonly backgroundPosition = computed<string>(() => {
    const s = this.scale();
    const size = this.frameSize * s;
    const row = this.rowNumber();
    // Coluna 1 = Frame Neutro/Parado (-32px * scale)
    const posX = -size;
    const posY = -(row * size);
    return `${posX}px ${posY}px`;
  });
}
