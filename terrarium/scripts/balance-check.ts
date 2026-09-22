// Headless balance harness: runs the simulation with no DOM, no canvas, and
// no wall-clock waiting — ticks are called back-to-back in a plain loop, so
// minutes of sim-time cost milliseconds of real time. Useful for tuning
// rates/thresholds without sitting through a real-time browser run.
import { World } from '../src/core/World';

const SIM_SECONDS = Number(process.argv[2] ?? 600);
const SAMPLE_EVERY = Number(process.argv[3] ?? 20);
const SEED = Number(process.argv[4] ?? 1);

const FIXED_DT = 1 / 30;
const bounds = { width: 900, height: 600 };

const world = new World(bounds, SEED);
world.seed(140, 40, 8);

const started = performance.now();
let nextSample = 0;

while (world.time < SIM_SECONDS) {
  world.tick(FIXED_DT);
  if (world.time >= nextSample) {
    const plants = world.entities.filter((e) => e.alive && e.kind === 'plant').length;
    const herbivores = world.entities.filter((e) => e.alive && e.kind === 'herbivore').length;
    const predators = world.entities.filter((e) => e.alive && e.kind === 'predator').length;
    console.log(
      `t=${world.time.toFixed(0).padStart(4)}s  plants ${String(plants).padStart(3)}  herbivores ${String(herbivores).padStart(3)}  predators ${String(predators).padStart(3)}`,
    );
    nextSample += SAMPLE_EVERY;
  }
}

const elapsedMs = performance.now() - started;
console.log(`\n${SIM_SECONDS}s of sim time computed in ${elapsedMs.toFixed(0)}ms (seed=${SEED})`);
