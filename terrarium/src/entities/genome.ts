import type { Genome, Kind } from '../core/types';
import type { Rng } from '../core/rng';

const RANGES: Record<Exclude<Kind, 'plant'>, Record<keyof Genome, [number, number]>> = {
  herbivore: {
    speed: [20, 60],
    senseRadius: [40, 120],
    size: [0.6, 1.4],
    metabolism: [0.8, 1.6],
    fertility: [0.45, 0.75],
  },
  predator: {
    speed: [30, 80],
    senseRadius: [60, 160],
    size: [0.8, 1.8],
    metabolism: [1.0, 2.2],
    fertility: [0.5, 0.85],
  },
};

const MUTATION_RATE = 0.12;

export function randomGenome(kind: Exclude<Kind, 'plant'>, rng: Rng): Genome {
  const r = RANGES[kind];
  return {
    speed: rng.range(...r.speed),
    senseRadius: rng.range(...r.senseRadius),
    size: rng.range(...r.size),
    metabolism: rng.range(...r.metabolism),
    fertility: rng.range(...r.fertility),
  };
}

export function mutateGenome(kind: Exclude<Kind, 'plant'>, parent: Genome, rng: Rng): Genome {
  const r = RANGES[kind];
  const jitter = (value: number, [min, max]: [number, number]): number => {
    const span = max - min;
    const mutated = value + rng.gaussian(0, span * MUTATION_RATE);
    return Math.min(max, Math.max(min, mutated));
  };
  return {
    speed: jitter(parent.speed, r.speed),
    senseRadius: jitter(parent.senseRadius, r.senseRadius),
    size: jitter(parent.size, r.size),
    metabolism: jitter(parent.metabolism, r.metabolism),
    fertility: jitter(parent.fertility, r.fertility),
  };
}
