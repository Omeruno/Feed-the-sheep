import './style.css';
import { World } from './core/World';
import { renderSystem } from './systems/render';
import { Hud } from './ui/hud';

const canvas = document.querySelector<HTMLCanvasElement>('#world');
const chartCanvas = document.querySelector<HTMLCanvasElement>('#chart');
const countsEl = document.querySelector<HTMLElement>('#counts');
const timeEl = document.querySelector<HTMLElement>('#time');
const genEl = document.querySelector<HTMLElement>('#generations');
const playPauseBtn = document.querySelector<HTMLButtonElement>('#playPause');
const resetBtn = document.querySelector<HTMLButtonElement>('#reset');
const speedInput = document.querySelector<HTMLInputElement>('#speed');
const seedInput = document.querySelector<HTMLInputElement>('#seed');

if (
  !canvas ||
  !chartCanvas ||
  !countsEl ||
  !timeEl ||
  !genEl ||
  !playPauseBtn ||
  !resetBtn ||
  !speedInput ||
  !seedInput
) {
  throw new Error('Terrarium: expected DOM elements are missing');
}

const maybeCtx = canvas.getContext('2d');
if (!maybeCtx) throw new Error('Canvas 2D context unavailable');
const ctx = maybeCtx;

const INITIAL_PLANTS = 140;
const INITIAL_HERBIVORES = 40;
const INITIAL_PREDATORS = 8;

const bounds = { width: canvas.width, height: canvas.height };
const hud = new Hud(chartCanvas, countsEl, timeEl, genEl);

function spawnWorld(seedValue: number): World {
  const w = new World(bounds, seedValue);
  w.seed(INITIAL_PLANTS, INITIAL_HERBIVORES, INITIAL_PREDATORS);
  return w;
}

let world = spawnWorld(Number(seedInput.value) || 1);
let running = true;
let speed = Number(speedInput.value);

playPauseBtn.addEventListener('click', () => {
  running = !running;
  playPauseBtn.textContent = running ? 'Pause' : 'Resume';
});

resetBtn.addEventListener('click', () => {
  world = spawnWorld(Number(seedInput.value) || Date.now());
});

speedInput.addEventListener('input', () => {
  speed = Number(speedInput.value);
});

const FIXED_DT = 1 / 30;
let accumulator = 0;
let lastTimestamp: number | null = null;

function frame(timestamp: number): void {
  if (lastTimestamp === null) lastTimestamp = timestamp;
  const rawDelta = Math.min(0.25, (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;

  if (running) {
    accumulator += rawDelta * speed;
    while (accumulator >= FIXED_DT) {
      world.tick(FIXED_DT);
      accumulator -= FIXED_DT;
    }
  }

  renderSystem(ctx, world.entities, bounds.width, bounds.height);

  let maxGenHerbivore = 0;
  let maxGenPredator = 0;
  for (const e of world.entities) {
    if (e.kind === 'herbivore') maxGenHerbivore = Math.max(maxGenHerbivore, e.generation);
    else if (e.kind === 'predator') maxGenPredator = Math.max(maxGenPredator, e.generation);
  }
  hud.update(world.statsHistory, world.time, maxGenHerbivore, maxGenPredator);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
