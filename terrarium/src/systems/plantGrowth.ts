import type { Bounds, Entity } from '../core/types';
import type { Rng } from '../core/rng';
import { makePlant } from '../entities/factory';

const PLANT_DENSITY_PER_1000PX2 = 0.9;
const GROWTH_RATE = 0.6;

export function plantGrowthSystem(
  entities: Entity[],
  bounds: Bounds,
  dt: number,
  rng: Rng,
  nextId: () => number,
): Entity[] {
  const area = bounds.width * bounds.height;
  const capacity = Math.floor((area / 1000) * PLANT_DENSITY_PER_1000PX2);
  const currentCount = entities.reduce((n, e) => n + (e.alive && e.kind === 'plant' ? 1 : 0), 0);
  const gap = capacity - currentCount;
  if (gap <= 0) return [];

  const expected = gap * GROWTH_RATE * dt;
  const spawnCount = Math.floor(expected) + (rng.next() < expected % 1 ? 1 : 0);
  const spawned: Entity[] = [];
  for (let i = 0; i < spawnCount; i++) {
    spawned.push(makePlant(nextId(), bounds, rng));
  }
  return spawned;
}
