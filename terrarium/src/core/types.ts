export type Kind = 'plant' | 'herbivore' | 'predator';

export interface Genome {
  speed: number;
  senseRadius: number;
  size: number;
  metabolism: number;
  fertility: number;
}

export interface Entity {
  id: number;
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  maxEnergy: number;
  age: number;
  genome: Genome;
  alive: boolean;
  generation: number;
  digestingFor: number;
}

export interface Bounds {
  width: number;
  height: number;
}

export interface Stats {
  t: number;
  plants: number;
  herbivores: number;
  predators: number;
}
