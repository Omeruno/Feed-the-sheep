// --- НАСТРОЙКИ ИГРЫ ---
const NUM_SHEEP = 5;
const NUM_CLOUDS = 4;
const SHEEP_SPEED = 50;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const GRASS_DISAPPEAR_TIME = 10000;
const GRASS_SIZE = 25;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.6;
const EAT_ANIMATION_DURATION = 500;
const WOOL_REGROW_TIME = 20000;
const WOLF_SPAWN_CHANCE = 0.15;
const WOLF_SPEED = 70;

// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК ---
const CYCLE_STAGES = [
    { frameIndex: 0, duration: 120000 }, { frameIndex: 1, duration: 60000 },
    { frameIndex: 2, duration: 60000 },  { frameIndex: 3, duration: 60000 },
    { frameIndex: 4, duration: 60000 },  { frameIndex: 5, duration: 60000 },
    { frameIndex: 6, duration: 60000 },  { frameIndex: 7, duration: 120000 }
];

// --- ИЗМЕНЕНИЕ: Уменьшены зоны препятствий ---
const OBSTACLES = [ { x: 0, y: 0.6, width: 0.20, height: 0.35 }, { x: 0.80, y: 0.6, width: 0.20, height: 0.35 } ];

// --- ПОИСК ЭЛЕМЕНТОВ DOM ---
const gameWorld = document.getElementById('game-world');
const bg1 = document.getElementById('bg-1');
const bg2 = document.getElementById('bg-2');
const cloudLayer = document.getElementById('cloud-layer');
const grassLayer = document.getElementById('grass-layer');
const daySound = document.getElementById('day-sound');
const nightSong = document.getElementById('night-song');
const sheepSound = document.getElementById('sheep-sound');
const plantSound = document.getElementById('plant-sound');
const eatSound = document.getElementById('eat-sound');
const wolfAttackSound = document.getElementById('wolf-attack-sound');
const wolfDeadSound = document.getElementById('wolf-dead-sound');
const woolAmountSpan = document.getElementById('wool-amount');
const skinAmountSpan = document.getElementById('skin-amount');
const scissorsButton = document.getElementById('scissors-button');

// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const baldSheepSprites = { front: 'images/sheep/baldsheep/sheep_bald_front.png', back: 'images/sheep/baldsheep/sheep_bald_back.png', left: 'images/sheep/baldsheep/sheep_bald_left.png', right: 'images/sheep/baldsheep/sheep_bald_right.png', eat: 'images/sheep/baldsheep/sheep_bald_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const GRASS_SPRITE = 'images/grass/grass.png';
const GROUND_SPRITE = 'images/ground/ground.png';
const WOOL_SPRITE = 'images/wool/wool.png';
const SKIN_SPRITE = 'images/skin/skin.png';

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
const sheep = [];
const wolves = [];
const clouds = [];
const grassPatches = [];
let woolCount = 0;
let skinCount = 0;
let activeBgLayer = bg1;
let hiddenBgLayer = bg2;
let currentStageIndex = 0;
let cycleDirection = 1;
let isMusicStarted = false;
let isShearMode = false;

// --- ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ---
if (daySound) daySound.volume = 0.3; if (nightSong) nightSong.volume = 0.3; if (sheepSound) sheepSound.volume = 0.5; if (plantSound) plantSound.volume = 0.25; if (eatSound) eatSound.volume = 0.25; if (wolfAttackSound) wolfAttackSound.volume = 0.6; if (wolfDeadSound) wolfDeadSound.volume = 0.6;

// --- Предзагрузка изображений ---
[...LOCATION_FRAMES, ...CLOUD_SPRITES, GRASS_SPRITE, GROUND_SPRITE, WOOL_SPRITE, SKIN_SPRITE, ...Object.values(sheepSprites), ...Object.values(baldSheepSprites), ...Object.values(wolfSprites)].forEach(src => { (new Image()).src = src; });

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function isPointInRect(x, y, rect) { return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height; }
function isPointBlocked(px, py, worldRect) { const nx = px / worldRect.width; const ny = py / worldRect.height; return OBSTACLES.some(r => isPointInRect(nx, ny, r)); }
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function playSound(soundElement) { if (soundElement) { soundElement.currentTime = 0; soundElement.play().catch(e => console.error("Ошибка воспроизведения звука:", e)); } }

// --- КЛАССЫ ---
class Cloud {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'cloud';
        cloudLayer.appendChild(this.element);
        this.reset(true);
    }
    reset(isInitial = false) {
        const worldRect = gameWorld.getBoundingClientRect();
        this.element.src = CLOUD_SPRITES[Math.floor(Math.random() * CLOUD_SPRITES.length)];
        this.speed = 10 + Math.random() * 15;
        this.y = Math.random() * (worldRect.height * 0.35);
        this.element.style.width = `${60 + Math.random() * 50}px`;
        this.element.style.opacity = 0.6 + Math.random() * 0.4;
        this.x = isInitial ? Math.random() * worldRect.width : -parseFloat(this.element.style.width);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    update(deltaTime) {
        const worldRect = gameWorld.getBoundingClientRect();
        this.x += this.speed * deltaTime;
        if (this.x > worldRect.width) {
            this.reset();
        }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

class Sheep {
    constructor() {
        this.element = document.createElement('img'); this.element.className = 'sheep'; this.element.src = sheepSprites.front;
        gameWorld.appendChild(this.element); const worldRect = gameWorld.getBoundingClientRect(); let startX, startY, attempts = 0;
        do { const walkableTop = worldRect.height * WALKABLE_TOP_RATIO; startX = Math.random() * (worldRect.width - 16); startY = walkableTop + Math.random() * (worldRect.height - walkableTop - 16); attempts++; if (attempts > 50) break; } while (isPointBlocked(startX, startY, worldRect));
        this.x = startX; this.y = startY; this.element.style.transform = `translate(${this.x}px, ${this.y}px)`; this.element.style.visibility = 'visible';
        this.targetX = this.x; this.targetY = this.y; this.isWaiting = true; this.isEating = false; this.isSheared = false; this.isScared = false;
        this.waitTimer = setTimeout(() => this.findNewTarget(), Math.random() * MAX_WAIT_TIME);
        this.element.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.tryShear(); });
    }
    findNewTarget() {
        const worldRect = gameWorld.getBoundingClientRect(); let newTargetX, newTargetY, attempts = 0;
        do { const walkableTop = worldRect.height * WALKABLE_TOP_RATIO; newTargetX = Math.random() * (worldRect.width - 16); newTargetY = walkableTop + Math.random() * (worldRect.height - walkableTop - 16); attempts++; if (attempts > 50) break; } while (isPointBlocked(newTargetX, newTargetY, worldRect));
        this.targetX = newTargetX; this.targetY = newTargetY; this.isWaiting = false; clearTimeout(this.waitTimer);
    }
    update(deltaTime) {
        const currentSprites = this.isSheared ? baldSheepSprites : sheepSprites;
        if (this.isEating || this.isScared) return;
        if (this.isWaiting) {
            for (let i = grassPatches.length - 1; i >= 0; i--) {
                const grass = grassPatches[i]; const dx = this.x - grass.x; const dy = this.y - grass.y; const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < EAT_RADIUS) {
                    this.isEating = true; this.element.src = currentSprites.eat; playSound(eatSound);
                    setTimeout(() => {
                        grass.element.src = GROUND_SPRITE; grassPatches.splice(i, 1); this.element.src = currentSprites.front; this.isEating = false;
                        setTimeout(() => {
                            grass.element.style.transition = 'opacity 0.5s'; grass.element.style.opacity = 0;
                            setTimeout(() => grass.element.remove(), 500);
                        }, GRASS_DISAPPEAR_TIME);
                    }, EAT_ANIMATION_DURATION);
                    break;
                }
            }
            return;
        }
        const dx = this.targetX - this.x; const dy = this.targetY - this.y; const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 1) { this.isWaiting = true; this.waitTimer = setTimeout(() => this.findNewTarget(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME)); this.element.src = currentSprites.front; return; }
        const moveX = (dx / distance) * SHEEP_SPEED * deltaTime; const moveY = (dy / distance) * SHEEP_SPEED * deltaTime;
        this.x += moveX; this.y += moveY;
        if (Math.abs(dx) > Math.abs(dy)) { this.element.src = dx > 0 ? currentSprites.right : currentSprites.left; } else { this.element.src = dy > 0 ? currentSprites.front : currentSprites.back; }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
    tryShear() {
        if (isShearMode && !this.isSheared) {
            this.isSheared = true;
            spawnWool(this.x, this.y);
            setTimeout(() => { this.isSheared = false; }, WOOL_REGROW_TIME);
            isShearMode = false;
            scissorsButton.classList.remove('active');
            document.body.style.cursor = 'default';
        }
    }
}
class Wolf {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'wolf';
        this.element.src = wolfSprites.left;
        gameWorld.appendChild(this.element);
        const worldRect = gameWorld.getBoundingClientRect();
        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -30 : worldRect.width + 30;
        const walkableTop = worldRect.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + Math.random() * (worldRect.height - walkableTop - 30);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        this.targetSheep = this.findTarget();
        this.isScared = false;
        this.isCapturing = false;
        this.isAttacking = false;
        this.isDragging = false; 
        this.draggedSheep = null; 
        this.element.addEventListener('pointerdown', () => this.scare());
    }

    findTarget() {
        const availableSheep = sheep.filter(s => !s.isScared);
        return availableSheep.length > 0 ? availableSheep[Math.floor(Math.random() * availableSheep.length)] : null;
    }

    update(deltaTime) {
        if (this.isAttacking) {
            return;
        }

        const worldRect = gameWorld.getBoundingClientRect();
        if (this.isDragging && this.draggedSheep) {
            const exitX = this.fromLeft ? -50 : worldRect.width + 50;
            const exitY = this.y;
            const dx = exitX - this.x;
            const dy = exitY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 10) {
                this.element.remove();
                this.draggedSheep.element.remove();
                const wolfIndex = wolves.indexOf(this);
                if (wolfIndex > -1) wolves.splice(wolfIndex, 1);
                const sheepIndex = sheep.indexOf(this.draggedSheep);
                if (sheepIndex > -1) sheep.splice(sheepIndex, 1);
                return;
            }
            const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
            this.x += moveX;
            this.element.src = this.fromLeft ? wolfSprites.left : wolfSprites.right;
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            this.draggedSheep.x = this.x + (this.fromLeft ? 15 : -15);
            this.draggedSheep.y = this.y;
            this.draggedSheep.element.style.transform = `translate(${this.draggedSheep.x}px, ${this.draggedSheep.y}px)`;
            return;
        }
        if (this.isScared || this.isCapturing || !this.targetSheep || this.targetSheep.isScared) {
            if (!this.targetSheep || this.targetSheep.isScared) this.targetSheep = this.findTarget();
            return;
        }
        const dx = this.targetSheep.x - this.x;
        const dy = this.targetSheep.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 10) {
            this.capture(this.targetSheep);
            return;
        }
        const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
        const moveY = (dy / distance) * WOLF_SPEED * deltaTime;
        this.x += moveX;
        this.y += moveY;
        if (Math.abs(dx) > Math.abs(dy)) {
            this.element.src = dx > 0 ? wolfSprites.right : wolfSprites.left;
        } else {
            this.element.src = dy > 0 ? wolfSprites.front : wolfSprites.back;
        }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    capture(target) {
        if (this.isCapturing || this.isDragging) return;
        playSound(wolfAttackSound);
        this.isCapturing = true; 
        this.isAttacking = true; 
        this.element.src = wolfSprites.attack;
        setTimeout(() => {
            this.isAttacking = false;
            this.isDragging = true;
            this.draggedSheep = target;
            target.isScared = true;
        }, 500);
    }
    
    scare() {
        if (this.isScared) return;
        playSound(wolfDeadSound);
        this.isScared = true;
        
        if (this.isDragging && this.draggedSheep) {
            this.draggedSheep.isScared = false;
            if (isPointBlocked(this.draggedSheep.x, this.draggedSheep.y, gameWorld.getBoundingClientRect())) {
                this.draggedSheep.findNewTarget();
            }
        }

        spawnSkin(this.x, this.y);
        this.element.style.opacity = 0;
        setTimeout(() => { this.element.remove(); const wolfIndex = wolves.indexOf(this); if (wolfIndex > -1) wolves.splice(wolfIndex, 1); }, 500);
    }
}

// --- МЕХАНИКА ИГРЫ ---
function spawnGrass(px, py) { playSound(plantSound); const worldRect = gameWorld.getBoundingClientRect(); const walkableTop = worldRect.height * WALKABLE_TOP_RATIO; if (py <= walkableTop || isPointBlocked(px, py, worldRect)) return; const patchX = clamp(px - GRASS_SIZE / 2, 0, worldRect.width - GRASS_SIZE); const patchY = clamp(py - GRASS_SIZE / 2, walkableTop, worldRect.height - GRASS_SIZE); const patchElement = document.createElement('img'); patchElement.className = 'grass-patch'; patchElement.src = GRASS_SPRITE; patchElement.style.transform = `translate(${patchX}px, ${patchY}px)`; grassLayer.appendChild(patchElement); grassPatches.push({ x: patchX, y: patchY, element: patchElement }); }
function spawnWool(px, py) {
    woolCount++;
    woolAmountSpan.textContent = woolCount;
    const woolElement = document.createElement('img');
    woolElement.src = WOOL_SPRITE;
    woolElement.className = 'wool-item';
    woolElement.style.transform = `translate(${px}px, ${py}px)`;
    woolElement.style.visibility = 'visible';
    gameWorld.appendChild(woolElement);
    setTimeout(() => {
        woolElement.style.opacity = 0;
        setTimeout(() => woolElement.remove(), 500);
    }, 2000);
}
function spawnSkin(px, py) {
    skinCount++;
    if (skinAmountSpan) {
        skinAmountSpan.textContent = skinCount;
    }
    const skinElement = document.createElement('img');
    skinElement.src = SKIN_SPRITE;
    skinElement.className = 'skin-item';
    skinElement.style.transform = `translate(${px}px, ${py}px)`;
    skinElement.style.visibility = 'visible';
    gameWorld.appendChild(skinElement);
    setTimeout(() => {
        skinElement.style.opacity = 0;
        setTimeout(() => skinElement.remove(), 500);
    }, 2000);
}
function spawnWolf() {
    if (Math.random() < WOLF_SPAWN_CHANCE) {
        wolves.push(new Wolf());
    }
}

// --- УПРАВЛЕНИЕ МУЗЫКОЙ И ФОНОМ ---
function manageBackgroundMusic(frameIndex) { 
    if (!isMusicStarted) return; 
    if (frameIndex > 3) { 
        daySound.pause();
        nightSong.play().catch(e => {});
    } else { 
        nightSong.pause();
        daySound.play().catch(e => {});
    } 
}
function updateBackground(frameIndex) { 
    manageBackgroundMusic(frameIndex); 
    const nextImageSrc = LOCATION_FRAMES[frameIndex]; 
    const img = new Image(); 
    img.onload = function() { 
        hiddenBgLayer.style.backgroundImage = `url('${nextImageSrc}')`; 
        activeBgLayer.style.opacity = 0; 
        hiddenBgLayer.style.opacity = 1; 
        [activeBgLayer, hiddenBgLayer] = [hiddenBgLayer, activeBgLayer]; 
    }; 
    img.src = nextImageSrc; 
    
    const isNight = frameIndex > 3;
    for (const cloud of clouds) {
        if (isNight) {
            cloud.element.classList.add('night');
        } else {
            cloud.element.classList.remove('night');
        }
    }
}
function runNextStage() { 
    if (currentStageIndex >= CYCLE_STAGES.length) { 
        cycleDirection = -1; 
        currentStageIndex = CYCLE_STAGES.length - 2; 
    } 
    if (currentStageIndex < 0) { 
        cycleDirection = 1; 
        currentStageIndex = 1; 
    } 
    const stage = CYCLE_STAGES[currentStageIndex]; 
    updateBackground(stage.frameIndex); 
    currentStageIndex += cycleDirection; 
    setTimeout(runNextStage, stage.duration); 
}

// --- ИНИЦИАЛИЗАЦИЯ ИГРЫ ---
if (gameWorld) {
    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < NUM_SHEEP; i++) { sheep.push(new Sheep()); }
    let lastTime = 0;
    function gameLoop(currentTime) { 
        if (lastTime === 0) lastTime = currentTime; 
        const deltaTime = (currentTime - lastTime) / 1000; 
        lastTime = currentTime; 
        for (const c of clouds) c.update(deltaTime);
        for (const s of sheep) s.update(deltaTime); 
        for (const w of wolves) w.update(deltaTime); 
        requestAnimationFrame(gameLoop); 
    }
    requestAnimationFrame(gameLoop);
    runNextStage();
    
    gameWorld.addEventListener('pointerdown', (event) => {
        if (!isMusicStarted) { 
            daySound.play().catch(e => console.error("Ошибка запуска музыки:", e));
            nightSong.play().then(() => nightSong.pause()).catch(e => {});
            isMusicStarted = true; 
        }
        const worldRect = gameWorld.getBoundingClientRect();
        const x = event.clientX - worldRect.left;
        const y = event.clientY - worldRect.top;
        if (!isShearMode) spawnGrass(x, y);
    });

    scissorsButton.addEventListener('click', () => {
        isShearMode = !isShearMode;
        scissorsButton.classList.toggle('active');
        document.body.style.cursor = isShearMode ? `url('images/scissors/scissors.png'), auto` : 'default';
    });

    setInterval(() => { playSound(sheepSound); }, 7000 + Math.random() * 8000);
    setInterval(spawnWolf, 1000);

} else {
    console.error('Критическая ошибка: элемент #game-world не найден!');
}
