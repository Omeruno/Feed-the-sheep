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

// The hue band a species occupies stays visually distinct (herbivores read
// as blue/cyan/violet, predators as red/orange/pink), but genome traits —
// mostly speed and sense radius, the ones that most shape behavior — pick
// the exact shade within that band. Similar genomes land close in hue, so
// lineages read as visible color clusters that drift and split as they
// evolve, instead of every individual within a species looking identical.
const HUE_BANDS: Record<Exclude<Kind, 'plant'>, [number, number]> = {
  herbivore: [175, 255],
  predator: [345, 400],
};

export function genomeHue(kind: Exclude<Kind, 'plant'>, genome: Genome): number {
  const r = RANGES[kind];
  const norm = (value: number, [min, max]: [number, number]): number =>
    Math.min(1, Math.max(0, (value - min) / (max - min)));

  const score =
    norm(genome.speed, r.speed) * 0.45 +
    norm(genome.senseRadius, r.senseRadius) * 0.3 +
    norm(genome.size, r.size) * 0.15 +
    norm(genome.metabolism, r.metabolism) * 0.06 +
    norm(genome.fertility, r.fertility) * 0.04;

  const [from, to] = HUE_BANDS[kind];
  const hue = from + score * (to - from);
  return hue % 360;
}
