import type { Entity } from '../core/types';

const EAT_RADIUS = 10;
const HERBIVORE_EAT_EFFICIENCY = 0.8;
const PREDATOR_EAT_EFFICIENCY = 0.7;

// A satiation delay after each meal (a Holling type-II functional response):
// without it, a predator that lands in a dense patch of prey can chain-eat
// and chain-reproduce in the same few ticks, which sends the population
// into runaway growth followed by a total, unrecoverable prey collapse.
const HERBIVORE_DIGEST_SECONDS = 1.5;
const PREDATOR_DIGEST_SECONDS = 3;

export function feedingSystem(entities: Entity[]): void {
  const plants = entities.filter((e) => e.kind === 'plant' && e.alive);
  const herbivores = entities.filter((e) => e.kind === 'herbivore' && e.alive);
  const predators = entities.filter((e) => e.kind === 'predator' && e.alive);

  for (const h of herbivores) {
    if (h.digestingFor > 0) continue;
    for (const p of plants) {
      if (!p.alive) continue;
      const dx = p.x - h.x;
      const dy = p.y - h.y;
      if (dx * dx + dy * dy <= EAT_RADIUS * EAT_RADIUS) {
        h.energy = Math.min(h.maxEnergy, h.energy + p.energy * HERBIVORE_EAT_EFFICIENCY);
        h.digestingFor = HERBIVORE_DIGEST_SECONDS;
        p.alive = false;
        break;
      }
    }
  }

  for (const pr of predators) {
    if (pr.digestingFor > 0) continue;
    for (const h of herbivores) {
      if (!h.alive) continue;
      const dx = h.x - pr.x;
      const dy = h.y - pr.y;
      if (dx * dx + dy * dy <= EAT_RADIUS * EAT_RADIUS) {
        pr.energy = Math.min(pr.maxEnergy, pr.energy + h.energy * PREDATOR_EAT_EFFICIENCY);
        pr.digestingFor = PREDATOR_DIGEST_SECONDS;
        h.alive = false;
        break;
      }
    }
  }
}
