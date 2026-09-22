import type { Entity } from '../core/types';
import { genomeHue } from '../entities/genome';

const PLANT_COLOR = '#4ade80';

export function renderSystem(
  ctx: CanvasRenderingContext2D,
  entities: Entity[],
  width: number,
  height: number,
): void {
  ctx.fillStyle = '#0b1220';
  ctx.fillRect(0, 0, width, height);

  for (const e of entities) {
    if (!e.alive) continue;
    const radius = e.kind === 'plant' ? 3 : 3 + e.genome.size * 3;
    ctx.beginPath();
    ctx.fillStyle =
      e.kind === 'plant' ? PLANT_COLOR : `hsl(${genomeHue(e.kind, e.genome)}, 68%, 60%)`;
    ctx.globalAlpha = e.kind === 'plant' ? 0.85 : Math.max(0.35, e.energy / e.maxEnergy);
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
