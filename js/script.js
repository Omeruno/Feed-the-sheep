// --- НАСТРОЙКИ ИГРЫ ---
const NUM_SHEEP = 5;
const SHEEP_SPEED = 50;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const GRASS_DISAPPEAR_TIME = 10000;
const GRASS_SIZE = 25;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.6;

// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК ---
const CYCLE_STAGES = [
    { frameIndex: 0, duration: 180000 }, { frameIndex: 1, duration: 200 },
    { frameIndex: 2, duration: 120000 }, { frameIndex: 3, duration: 200 },
    { frameIndex: 4, duration: 120000 }, { frameIndex: 5, duration: 200 },
    { frameIndex: 6, duration: 200 },   { frameIndex: 7, duration: 180000 }
];

// --- Координаты препятствий ---
const OBSTACLES = [
    { x: 0, y: 0.6, width: 0.25, height: 0.4 },
    { x: 0.75, y: 0.6, width: 0.25, height: 0.4 }
];

// --- ПОИСК ЭЛЕМЕНТОВ DOM ---
const gameWorld = document.getElementById('game-world');
const bg1 = document.getElementById('bg-1');
const bg2 = document.getElementById('bg-2');
const grassLayer = document.getElementById('grass-layer');
const bgMusic = document.getElementById('bg-music');
const sheepSound = document.getElementById('sheep-sound');
const plantSound = document.getElementById('plant-sound');
const eatSound = document.getElementById('eat-sound');

// --- ⭐ ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ⭐ ---
if (bgMusic) bgMusic.volume = 0.3;      // Громкость музыки (30%)
if (sheepSound) sheepSound.volume = 0.10;  // Громкость овец (50%)
if (plantSound) plantSound.volume = 0.25; // Громкость посадки (25%)
if (eatSound) eatSound.volume = 0.25;   // Громкость поедания (25%)

// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png' };
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const GRASS_SPRITE = 'images/grass/grass.png';
const GROUND_SPRITE = 'images/ground/ground.png';

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
const sheep = [];
const grassPatches = [];
let activeBgLayer = bg1;
let hiddenBgLayer = bg2;
let currentStageIndex = 0;
let cycleDirection = 1;
let isMusicStarted = false;

// --- Предзагрузка изображений ---
[...LOCATION_FRAMES, GRASS_SPRITE, GROUND_SPRITE, ...Object.values(sheepSprites)].forEach(src => { (new Image()).src = src; });

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function isPointInRect(x, y, rect) { return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height; }
function isPointBlocked(px, py, worldRect) { const nx = px / worldRect.width; const ny = py / worldRect.height; return OBSTACLES.some(r => isPointInRect(nx, ny, r)); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function playSound(soundElement) {
    if (soundElement) {
        soundElement.currentTime = 0;
        soundElement.play().catch(e => console.error("Ошибка воспроизведения звука:", e));
    }
}

// --- КЛАСС ДЛЯ ОДНОЙ ОВЦЫ ---
class Sheep {
    constructor() {
        this.element = document.createElement('img'); this.element.className = 'sheep'; this.element.src = sheepSprites.front;
        gameWorld.appendChild(this.element); const worldRect = gameWorld.getBoundingClientRect(); let startX, startY, attempts = 0;
        do { const walkableTop = worldRect.height * WALKABLE_TOP_RATIO; startX = Math.random() * (worldRect.width - 16); startY = walkableTop + Math.random() * (worldRect.height - walkableTop - 16); attempts++; if (attempts > 50) break; } while (isPointBlocked(startX, startY, worldRect));
        this.x = startX; this.y = startY; this.element.style.transform = `translate(${this.x}px, ${this.y}px)`; this.element.style.visibility = 'visible';
        this.targetX = this.x; this.targetY = this.y; this.isWaiting = true; this.waitTimer = setTimeout(() => this.findNewTarget(), Math.random() * MAX_WAIT_TIME);
    }
    findNewTarget() {
        const worldRect = gameWorld.getBoundingClientRect(); let newTargetX, newTargetY, attempts = 0;
        do { const walkableTop = worldRect.height * WALKABLE_TOP_RATIO; newTargetX = Math.random() * (worldRect.width - 16); newTargetY = walkableTop + Math.random() * (worldRect.height - walkableTop - 16); attempts++; if (attempts > 50) break; } while (isPointBlocked(newTargetX, newTargetY, worldRect));
        this.targetX = newTargetX; this.targetY = newTargetY; this.isWaiting = false; clearTimeout(this.waitTimer);
    }
    update(deltaTime) {
        if (this.isWaiting) {
            for (let i = grassPatches.length - 1; i >= 0; i--) {
                const grass = grassPatches[i]; const dx = this.x - grass.x; const dy = this.y - grass.y; const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < EAT_RADIUS) {
                    playSound(eatSound);
                    grass.element.src = GROUND_SPRITE; grassPatches.splice(i, 1);
                    setTimeout(() => {
                        grass.element.style.transition = 'opacity 0.5s'; grass.element.style.opacity = 0;
                        setTimeout(() => grass.element.remove(), 500);
                    }, GRASS_DISAPPEAR_TIME);
                    break;
                }
            }
            return;
        }
        const dx = this.targetX - this.x; const dy = this.targetY - this.y; const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 1) { this.isWaiting = true; this.waitTimer = setTimeout(() => this.findNewTarget(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME)); this.element.src = sheepSprites.front; return; }
        const moveX = (dx / distance) * SHEEP_SPEED * deltaTime; const moveY = (dy / distance) * SHEEP_SPEED * deltaTime;
        this.x += moveX; this.y += moveY;
        if (Math.abs(dx) > Math.abs(dy)) { this.element.src = dx > 0 ? sheepSprites.right : sheepSprites.left; } else { this.element.src = dy > 0 ? sheepSprites.front : sheepSprites.back; }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

// --- МЕХАНИКА ТРАВЫ ---
function spawnGrass(px, py) {
    playSound(plantSound);
    const worldRect = gameWorld.getBoundingClientRect();
    const walkableTop = worldRect.height * WALKABLE_TOP_RATIO;
    if (py <= walkableTop || isPointBlocked(px, py, worldRect)) return;
    const patchX = clamp(px - GRASS_SIZE / 2, 0, worldRect.width - GRASS_SIZE);
    const patchY = clamp(py - GRASS_SIZE / 2, walkableTop, worldRect.height - GRASS_SIZE);
    const patchElement = document.createElement('img');
    patchElement.className = 'grass-patch'; patchElement.src = GRASS_SPRITE;
    patchElement.style.transform = `translate(${patchX}px, ${patchY}px)`;
    grassLayer.appendChild(patchElement);
    grassPatches.push({ x: patchX, y: patchY, element: patchElement });
}

// --- МЕХАНИЗМ СМЕНЫ ФОНА ---
function updateBackground(frameIndex) { const nextImageSrc = LOCATION_FRAMES[frameIndex]; const img = new Image(); img.onload = function() { hiddenBgLayer.style.backgroundImage = `url('${nextImageSrc}')`; activeBgLayer.style.opacity = 0; hiddenBgLayer.style.opacity = 1; [activeBgLayer, hiddenBgLayer] = [hiddenBgLayer, activeBgLayer]; }; img.src = nextImageSrc; }
function runNextStage() {
    if (currentStageIndex >= CYCLE_STAGES.length) { cycleDirection = -1; currentStageIndex = CYCLE_STAGES.length - 2; }
    if (currentStageIndex < 0) { cycleDirection = 1; currentStageIndex = 1; }
    const stage = CYCLE_STAGES[currentStageIndex];
    updateBackground(stage.frameIndex);
    currentStageIndex += cycleDirection;
    setTimeout(runNextStage, stage.duration);
}

// --- ИНИЦИАЛИЗАЦИЯ ИГРЫ ---
if (gameWorld) {
    for (let i = 0; i < NUM_SHEEP; i++) { sheep.push(new Sheep()); }
    let lastTime = 0;
    function gameLoop(currentTime) { if (lastTime === 0) lastTime = currentTime; const deltaTime = (currentTime - lastTime) / 1000; lastTime = currentTime; for (const s of sheep) s.update(deltaTime); requestAnimationFrame(gameLoop); }
    requestAnimationFrame(gameLoop);
    runNextStage();
    
    gameWorld.addEventListener('pointerdown', (event) => {
        if (!isMusicStarted && bgMusic) {
            bgMusic.play(); // Громкость уже установлена вначале
            isMusicStarted = true;
        }
        const worldRect = gameWorld.getBoundingClientRect();
        const x = event.clientX - worldRect.left;
        const y = event.clientY - worldRect.top;
        spawnGrass(x, y);
    });

    setInterval(() => {
        playSound(sheepSound);
    }, 7000 + Math.random() * 8000);

} else {
    console.error('Критическая ошибка: элемент #game-world не найден!');
}