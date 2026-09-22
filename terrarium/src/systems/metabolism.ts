import type { Entity } from '../core/types';

const BASE_DRAIN = 1.2;
const MAX_AGE = 90;

export function metabolismSystem(entities: Entity[], dt: number): void {
  for (const e of entities) {
    if (!e.alive || e.kind === 'plant') continue;
    const speedFactor = Math.hypot(e.vx, e.vy) / Math.max(e.genome.speed, 1);
    const drain = BASE_DRAIN * e.genome.metabolism * e.genome.size * (0.5 + 0.5 * speedFactor);
    e.energy -= drain * dt;
    e.age += dt;
    if (e.digestingFor > 0) e.digestingFor = Math.max(0, e.digestingFor - dt);
    if (e.energy <= 0 || e.age > MAX_AGE) {
      e.alive = false;
    }
  }
}
