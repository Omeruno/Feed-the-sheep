import type { Bounds, Entity, Stats } from './types';
import { Rng } from './rng';
import { makeHerbivore, makePlant, makePredator } from '../entities/factory';
import { plantGrowthSystem } from '../systems/plantGrowth';
import { movementSystem } from '../systems/movement';
import { feedingSystem } from '../systems/feeding';
import { metabolismSystem } from '../systems/metabolism';
import { reproductionSystem } from '../systems/reproduction';

const MAX_ENTITIES = 900;
const STATS_HISTORY_LENGTH = 400;
const STATS_SAMPLE_INTERVAL = 0.5;

export class World {
  readonly bounds: Bounds;
  entities: Entity[] = [];
  time = 0;
  statsHistory: Stats[] = [];

  private rng: Rng;
  private idCounter = 0;
  private statsAccumulator = 0;

  constructor(bounds: Bounds, seed: number) {
    this.bounds = bounds;
    this.rng = new Rng(seed);
  }

  private nextId = (): number => this.idCounter++;

  seed(initialPlants: number, initialHerbivores: number, initialPredators: number): void {
    this.entities = [];
    this.time = 0;
    this.statsHistory = [];
    this.statsAccumulator = 0;
    for (let i = 0; i < initialPlants; i++) {
      this.entities.push(makePlant(this.nextId(), this.bounds, this.rng));
    }
    for (let i = 0; i < initialHerbivores; i++) {
      this.entities.push(makeHerbivore(this.nextId(), this.bounds, this.rng));
    }
    for (let i = 0; i < initialPredators; i++) {
      this.entities.push(makePredator(this.nextId(), this.bounds, this.rng));
    }
    this.recordStats();
  }

  tick(dt: number): void {
    this.time += dt;

    const newPlants = plantGrowthSystem(this.entities, this.bounds, dt, this.rng, this.nextId);
    this.entities.push(...newPlants);

    movementSystem(this.entities, this.bounds, dt, this.rng);
    feedingSystem(this.entities);
    metabolismSystem(this.entities, dt);

    const offspring = reproductionSystem(this.entities, this.bounds, this.rng, this.nextId, MAX_ENTITIES);
    this.entities.push(...offspring);

    this.entities = this.entities.filter((e) => e.alive);

    this.statsAccumulator += dt;
    if (this.statsAccumulator >= STATS_SAMPLE_INTERVAL) {
      this.statsAccumulator = 0;
      this.recordStats();
    }
  }

  private recordStats(): void {
    let plants = 0;
    let herbivores = 0;
    let predators = 0;
    for (const e of this.entities) {
      if (!e.alive) continue;
      if (e.kind === 'plant') plants++;
      else if (e.kind === 'herbivore') herbivores++;
      else predators++;
    }
    this.statsHistory.push({ t: this.time, plants, herbivores, predators });
    if (this.statsHistory.length > STATS_HISTORY_LENGTH) this.statsHistory.shift();
  }
}
