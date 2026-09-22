import type { Bounds, Entity, Genome } from '../core/types';
import type { Rng } from '../core/rng';
import { randomGenome } from './genome';

const PLANT_ENERGY = 30;
const HERBIVORE_BASE_ENERGY = 60;
const PREDATOR_BASE_ENERGY = 90;

export function makePlant(id: number, bounds: Bounds, rng: Rng): Entity {
  return {
    id,
    kind: 'plant',
    x: rng.range(0, bounds.width),
    y: rng.range(0, bounds.height),
    vx: 0,
    vy: 0,
    energy: PLANT_ENERGY,
    maxEnergy: PLANT_ENERGY,
    age: 0,
    genome: { speed: 0, senseRadius: 0, size: 1, metabolism: 0, fertility: 0 },
    alive: true,
    generation: 0,
    digestingFor: 0,
  };
}

export function makeHerbivore(
  id: number,
  bounds: Bounds,
  rng: Rng,
  genome?: Genome,
  at?: { x: number; y: number },
  generation = 0,
): Entity {
  const g = genome ?? randomGenome('herbivore', rng);
  const maxEnergy = HERBIVORE_BASE_ENERGY * g.size;
  return {
    id,
    kind: 'herbivore',
    x: at?.x ?? rng.range(0, bounds.width),
    y: at?.y ?? rng.range(0, bounds.height),
    vx: 0,
    vy: 0,
    energy: maxEnergy * 0.6,
    maxEnergy,
    age: 0,
    genome: g,
    alive: true,
    generation,
    digestingFor: 0,
  };
}

export function makePredator(
  id: number,
  bounds: Bounds,
  rng: Rng,
  genome?: Genome,
  at?: { x: number; y: number },
  generation = 0,
): Entity {
  const g = genome ?? randomGenome('predator', rng);
  const maxEnergy = PREDATOR_BASE_ENERGY * g.size;
  return {
    id,
    kind: 'predator',
    x: at?.x ?? rng.range(0, bounds.width),
    y: at?.y ?? rng.range(0, bounds.height),
    vx: 0,
    vy: 0,
    energy: maxEnergy * 0.6,
    maxEnergy,
    age: 0,
    genome: g,
    alive: true,
    generation,
    digestingFor: 0,
  };
}
