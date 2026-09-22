import type { Stats } from '../core/types';

export class Hud {
  private readonly chartCtx: CanvasRenderingContext2D;
  private readonly countsEl: HTMLElement;
  private readonly timeEl: HTMLElement;
  private readonly genEl: HTMLElement;

  constructor(chartCanvas: HTMLCanvasElement, countsEl: HTMLElement, timeEl: HTMLElement, genEl: HTMLElement) {
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable for HUD chart');
    this.chartCtx = ctx;
    this.countsEl = countsEl;
    this.timeEl = timeEl;
    this.genEl = genEl;
  }

  update(history: Stats[], time: number, maxGenHerbivore: number, maxGenPredator: number): void {
    const latest = history[history.length - 1];
    if (latest) {
      this.countsEl.textContent = `plants ${latest.plants} · herbivores ${latest.herbivores} · predators ${latest.predators}`;
    }
    this.timeEl.textContent = `t=${time.toFixed(0)}s`;
    this.genEl.textContent = `gen herb #${maxGenHerbivore} · gen pred #${maxGenPredator}`;
    this.drawChart(history);
  }

  private drawChart(history: Stats[]): void {
    const { width, height } = this.chartCtx.canvas;
    this.chartCtx.clearRect(0, 0, width, height);
    if (history.length < 2) return;

    const maxValue = history.reduce((m, s) => Math.max(m, s.plants, s.herbivores, s.predators), 1);

    const series: Array<[keyof Omit<Stats, 't'>, string]> = [
      ['plants', '#4ade80'],
      ['herbivores', '#60a5fa'],
      ['predators', '#f87171'],
    ];

    for (const [key, color] of series) {
      this.chartCtx.beginPath();
      this.chartCtx.strokeStyle = color;
      this.chartCtx.lineWidth = 1.5;
      history.forEach((s, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - (s[key] / maxValue) * height;
        if (i === 0) this.chartCtx.moveTo(x, y);
        else this.chartCtx.lineTo(x, y);
      });
      this.chartCtx.stroke();
    }
  }
}
