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
npm run balance   # headless run for tuning — see "Balance tuning" below
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
scripts/
  balance-check.ts   headless World runner for tuning (see below)
```

Each system is a plain function operating on the shared `entities` array —
no framework, no hidden state — so new systems (e.g. terrain, disease,
sexual reproduction) are additive rather than invasive.

The simulation loop uses a fixed timestep (1/30s) with an accumulator, so
behavior is stable regardless of the display's frame rate, and a speed
slider just feeds more/less accumulated time per rendered frame.

## Balance tuning

`World.tick()` has no DOM dependency, so it can run headless: no canvas, no
`requestAnimationFrame`, no real-time waiting. `npm run balance [seconds]
[sampleEverySeconds] [seed]` bundles the World with esbuild and ticks it in
a tight loop, printing population snapshots — minutes of sim-time cost
well under a minute of real time (and there's no rendering cost either, so
it also scales to far larger populations than the live page would want to
draw). Use it after changing any rate or threshold in `systems/` to check
the population dynamics before touching the browser at all:

```bash
npm run balance -- 600 30 1   # 600 sim-seconds, sampled every 30s, seed 1
```

The first version of the predator/prey balance looked fine over a minute
but, run out to a few hundred sim-seconds, always ended the same way:
predators overshot, hunted herbivores to extinction, and — since
herbivores don't spawn spontaneously the way plants do — that extinction
was permanent, so predators then starved too and the world went
permanently static. Two changes fixed it: a post-meal satiation cooldown
(`systems/feeding.ts`, a Holling type-II functional response) so a
predator can't chain-eat and chain-reproduce in a dense patch, and a
predator carrying capacity tied to the *current* herbivore count
(`systems/reproduction.ts`) so predator numbers stay bounded by the prey
available to support them. With both in place the three populations settle
into a stable oscillation and hold it — verified out to 600+ sim-seconds
across several seeds via `npm run balance`.

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
