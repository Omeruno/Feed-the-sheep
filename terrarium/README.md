# Terrarium

A self-contained ecosystem simulation. Plants regrow on a shared canvas,
herbivores graze and flee, predators hunt — and every birth mutates a
genome, so traits (speed, size, senses, metabolism, fertility) drift under
real selection pressure over generations, with no scripted outcome.

This is a fresh, standalone project living alongside the old `Feed the
Sheep` game in this repo; it doesn't build on or depend on that code.

## Why this

The interesting part of an idle/farm game like the old one is the
predator-prey tension between wolves, sheep, and grass. Terrarium takes
that tension and makes it the entire point: no shop, no player input beyond
observing and tuning — just an emergent system you can perturb (seed,
starting populations, speed) and watch evolve.

## Running it

```bash
cd terrarium
npm install
npm run dev       # dev server with hot reload
npm run build     # typecheck + production build to dist/
npm run typecheck # tsc --noEmit only
```

## Architecture

Plain TypeScript, Canvas 2D, no framework — kept deliberately small so the
simulation logic stays easy to read and extend.

```
src/
  core/
    types.ts     Entity, Genome, Bounds, Stats
    rng.ts       seeded PRNG (mulberry32) for reproducible runs
    World.ts     entity list + tick() that runs systems in order
  entities/
    genome.ts    trait ranges, random genome, mutation on reproduction
    factory.ts   spawn plants / herbivores / predators
  systems/
    plantGrowth.ts   regrows plants toward a carrying capacity
    movement.ts      seek food, flee threats, wander; steering + wrap-around
    feeding.ts       proximity-based eating (herbivore←plant, predator←herbivore)
    metabolism.ts    energy drain, aging, death
    reproduction.ts  asexual reproduction above an energy threshold, with mutation
    render.ts        draws entities to the canvas
  ui/
    hud.ts       population counts, sim time, max generation reached, sparkline
  main.ts        wiring: DOM, fixed-timestep loop, play/pause/speed/reset/seed
```

Each system is a plain function operating on the shared `entities` array —
no framework, no hidden state — so new systems (e.g. terrain, disease,
sexual reproduction) are additive rather than invasive.

The simulation loop uses a fixed timestep (1/30s) with an accumulator, so
behavior is stable regardless of the display's frame rate, and a speed
slider just feeds more/less accumulated time per rendered frame.

## Roadmap

Deliberately left for later, roughly in order of how much they'd change
the emergent dynamics:

- **Spatial partitioning** (grid or quadtree) so neighbor queries stop
  being O(n²) once populations grow past a few hundred.
- **Speciation / sexual reproduction** — pick a nearby mate instead of
  cloning, so genomes actually recombine.
- **Terrain and biomes** — patches with different plant regrowth rates,
  water, obstacles — so geography itself becomes a selection pressure.
- **Persistence** — serialize `World` state to resume a long-running
  session, and export run history for offline analysis.
- **Trait inspector** — click an agent to see its genome and lineage.
