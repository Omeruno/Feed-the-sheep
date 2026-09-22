import type { Bounds, Entity } from '../core/types';
import type { Rng } from '../core/rng';
import { mutateGenome } from '../entities/genome';
import { makeHerbivore, makePredator } from '../entities/factory';

const REPRO_COST_FRACTION = 0.55;

// Without this, predators have no population ceiling of their own: a big
// enough pack can hunt herbivores to extinction faster than herbivores can
// reproduce back, and since herbivores (unlike plants) never spawn out of
// nothing, that extinction is permanent and the whole ecosystem then dies
// with them. Capping predators relative to *current* prey count — their own
// carrying capacity — gives prey room to recover before predators can
// finish them off, the same way plant density caps herbivore growth.
const PREDATOR_PREY_RATIO = 6;

export function reproductionSystem(
  entities: Entity[],
  bounds: Bounds,
  rng: Rng,
  nextId: () => number,
  cap: number,
): Entity[] {
  const offspring: Entity[] = [];
  if (entities.length >= cap) return offspring;

  let herbivoreCount = 0;
  let predatorCount = 0;
  for (const e of entities) {
    if (!e.alive) continue;
    if (e.kind === 'herbivore') herbivoreCount++;
    else if (e.kind === 'predator') predatorCount++;
  }
  const predatorCapacity = Math.floor(herbivoreCount / PREDATOR_PREY_RATIO);

  for (const e of entities) {
    if (!e.alive || e.kind === 'plant') continue;
    if (e.kind === 'predator' && predatorCount >= predatorCapacity) continue;

    // Higher fertility lowers the energy threshold needed to reproduce, so
    // it's selected for even though it doesn't reduce the fixed birth cost.
    const threshold = e.maxEnergy * (0.9 - e.genome.fertility * 0.4);
    if (e.energy < threshold) continue;

    const cost = e.maxEnergy * REPRO_COST_FRACTION;
    e.energy -= cost;
    const childGenome = mutateGenome(e.kind as 'herbivore' | 'predator', e.genome, rng);
    const at = { x: e.x + rng.range(-6, 6), y: e.y + rng.range(-6, 6) };
    const child =
      e.kind === 'herbivore'
        ? makeHerbivore(nextId(), bounds, rng, childGenome, at, e.generation + 1)
        : makePredator(nextId(), bounds, rng, childGenome, at, e.generation + 1);
    offspring.push(child);
    if (e.kind === 'predator') predatorCount++;
    if (entities.length + offspring.length >= cap) break;
  }
  return offspring;
}
