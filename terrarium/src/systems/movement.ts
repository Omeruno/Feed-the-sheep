import type { Bounds, Entity } from '../core/types';
import type { Rng } from '../core/rng';

// How quickly an agent's heading turns to face its target, per second.
// Lower values give sluggish, momentum-heavy motion; higher values snap.
const TURN_RATE = 4;

function nearest(from: Entity, candidates: Entity[], maxDist: number): Entity | null {
  let best: Entity | null = null;
  let bestDistSq = maxDist * maxDist;
  for (const c of candidates) {
    if (!c.alive || c === from) continue;
    const dx = c.x - from.x;
    const dy = c.y - from.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = c;
    }
  }
  return best;
}

function wrap(value: number, max: number): number {
  if (value < 0) return value + max;
  if (value >= max) return value - max;
  return value;
}

export function movementSystem(entities: Entity[], bounds: Bounds, dt: number, rng: Rng): void {
  const plants = entities.filter((e) => e.kind === 'plant' && e.alive);
  const herbivores = entities.filter((e) => e.kind === 'herbivore' && e.alive);
  const predators = entities.filter((e) => e.kind === 'predator' && e.alive);

  for (const e of entities) {
    if (!e.alive || e.kind === 'plant') continue;

    let dirX: number;
    let dirY: number;

    if (e.kind === 'herbivore') {
      const threat = nearest(e, predators, e.genome.senseRadius);
      const target = threat ?? nearest(e, plants, e.genome.senseRadius);
      if (threat) {
        dirX = e.x - threat.x;
        dirY = e.y - threat.y;
      } else if (target) {
        dirX = target.x - e.x;
        dirY = target.y - e.y;
      } else {
        dirX = (e.vx || rng.range(-1, 1)) + rng.gaussian(0, 0.6);
        dirY = (e.vy || rng.range(-1, 1)) + rng.gaussian(0, 0.6);
      }
    } else {
      const prey = nearest(e, herbivores, e.genome.senseRadius);
      if (prey) {
        dirX = prey.x - e.x;
        dirY = prey.y - e.y;
      } else {
        dirX = (e.vx || rng.range(-1, 1)) + rng.gaussian(0, 0.6);
        dirY = (e.vy || rng.range(-1, 1)) + rng.gaussian(0, 0.6);
      }
    }

    const mag = Math.hypot(dirX, dirY) || 1;
    const desiredVx = (dirX / mag) * e.genome.speed;
    const desiredVy = (dirY / mag) * e.genome.speed;

    const blend = Math.min(1, TURN_RATE * dt);
    e.vx += (desiredVx - e.vx) * blend;
    e.vy += (desiredVy - e.vy) * blend;

    e.x = wrap(e.x + e.vx * dt, bounds.width);
    e.y = wrap(e.y + e.vy * dt, bounds.height);
  }
}
