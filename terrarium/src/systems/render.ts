import type { Entity } from '../core/types';

const COLORS: Record<Entity['kind'], string> = {
  plant: '#4ade80',
  herbivore: '#60a5fa',
  predator: '#f87171',
};

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
    ctx.fillStyle = COLORS[e.kind];
    ctx.globalAlpha = e.kind === 'plant' ? 0.85 : Math.max(0.35, e.energy / e.maxEnergy);
    ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
