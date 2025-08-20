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
const WOLF_BASE_SPAWN_CHANCE = 0.15;
const WOLF_SPEED = 70;
const HOUSE_BASE_HEALTH = 100;

// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК (НОЧИ УСКОРЕНЫ НА 25%) ---
const CYCLE_STAGES = [
    { name: "Day 1", frameIndex: 0, duration: 120000 }, 
    { name: "Day 2", frameIndex: 1, duration: 60000 },
    { name: "Day 3", frameIndex: 2, duration: 60000 },  
    { name: "Day 4", frameIndex: 3, duration: 60000 },
    { name: "Day 5", frameIndex: 4, duration: 45000 },  // Было 60000
    { name: "Day 6", frameIndex: 5, duration: 45000 },  // Было 60000
    { name: "Day 7", frameIndex: 6, duration: 45000 },  // Было 60000
    { name: "Day 8", frameIndex: 7, duration: 90000 }   // Было 120000
];

// --- Зоны препятствий ---
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
const goldAmountSpan = document.getElementById('gold-amount');
const woodAmountSpan = document.getElementById('wood-amount');
const brickAmountSpan = document.getElementById('brick-amount');
const scissorsButton = document.getElementById('scissors-button');
const shopButton = document.getElementById('shop-button');
const shopMenu = document.getElementById('shop-menu');
const closeShopButton = document.getElementById('close-shop-button');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const gameContainer = document.getElementById('game-container');


// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const baldSheepSprites = { front: 'images/sheep/baldsheep/sheep_bald_front.png', back: 'images/sheep/baldsheep/sheep_bald_back.png', left: 'images/sheep/baldsheep/sheep_bald_left.png', right: 'images/sheep/baldsheep/sheep_bald_right.png', eat: 'images/sheep/baldsheep/sheep_bald_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const HOUSE_SPRITES = { house_1: 'images/house/house_1.png', house_2: 'images/house/house_2.png', house_3: 'images/house/house_3.png', house_4: 'images/house/house_4.png' };
const HUNGER_ICON_SRC = 'images/icons/hunger_icon.png';

// --- МАССИВ РЕСУРСОВ ДЛЯ ПРЕДЗАГРУЗКИ ---
const ASSETS_TO_LOAD = [
    ...Object.values(sheepSprites), ...Object.values(baldSheepSprites), ...Object.values(wolfSprites),
    ...CLOUD_SPRITES, ...LOCATION_FRAMES, ...Object.values(HOUSE_SPRITES),
    'images/grass/grass.png', 'images/ground/ground.png', 'images/wool/wool.png', 'images/skin/skin.png',
    'images/scissors/scissors.png', 'images/shop/shop.png', 'images/shop/shop_menu.png',
    'images/gold/gold.png', 'images/tree/tree.png', 'images/brick/brick.png',
    HUNGER_ICON_SRC,
    'sound/day_sound.mp3', 'sound/night_song.mp3', 'sound/sheep_sound.mp3',
    'sound/plant_sound.mp3', 'sound/eat_sound.mp3', 
    'sound/wolf_attak.mp3', 
    'sound/wolf_dead.mp3'
];

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
const sheep = [];
const wolves = [];
const clouds = [];
const grassPatches = [];
let currentHouse = null;
let woolCount = 0;
let skinCount = 0;
let goldCount = 100;
let woodCount = 10;
let brickCount = 0;
let activeBgLayer = bg1;
let hiddenBgLayer = bg2;
let currentStageIndex = 0;
let cycleDirection = 1;
let isMusicStarted = false;
let isShearMode = false;
let wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE;
let GAME_DIMENSIONS = null;

// --- ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ---
if (daySound) daySound.volume = 0.3; if (nightSong) nightSong.volume = 0.3; if (sheepSound) sheepSound.volume = 0.5; if (plantSound) plantSound.volume = 0.25; if (eatSound) eatSound.volume = 0.25; if (wolfAttackSound) wolfAttackSound.volume = 0.6; if (wolfDeadSound) wolfDeadSound.volume = 0.6;

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function isPointInRect(x, y, rect) { return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height; }
function isPointBlocked(px, py) { 
    if (!GAME_DIMENSIONS) return true;
    const nx = px / GAME_DIMENSIONS.width; 
    const ny = py / GAME_DIMENSIONS.height; 
    return OBSTACLES.some(r => isPointInRect(nx, ny, r)); 
}
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function playSound(soundElement) { if (soundElement) { soundElement.currentTime = 0; soundElement.play().catch(e => {}); } }
function updateResourceCounters() {
    woolAmountSpan.textContent = woolCount;
    skinAmountSpan.textContent = skinCount;
    goldAmountSpan.textContent = goldCount;
    woodAmountSpan.textContent = woodCount;
    brickAmountSpan.textContent = brickCount;
}

// --- КЛАССЫ ---

class Cloud {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'cloud';
        cloudLayer.appendChild(this.element);
        this.reset(true);
    }
    reset(isInitial = false) {
        this.element.src = CLOUD_SPRITES[Math.floor(Math.random() * CLOUD_SPRITES.length)];
        this.speed = 10 + Math.random() * 15;
        this.y = Math.random() * (GAME_DIMENSIONS.height * 0.35);
        this.element.style.width = `${60 + Math.random() * 50}px`;
        this.element.style.opacity = 0.6 + Math.random() * 0.4;
        this.x = isInitial ? Math.random() * GAME_DIMENSIONS.width : -parseFloat(this.element.style.width);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
    }
    update(deltaTime) {
        this.x += this.speed * deltaTime;
        if (this.x > GAME_DIMENSIONS.width) {
            this.reset();
        }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }
}

class House {
    constructor(type) {
        this.element = document.createElement('img');
        this.element.className = 'house';
        this.element.src = HOUSE_SPRITES[type];
        
        this.x = GAME_DIMENSIONS.width / 2 - 50;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + (GAME_DIMENSIONS.height - walkableTop) / 2 - 50;
        
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        gameWorld.appendChild(this.element);
        
        this.health = HOUSE_BASE_HEALTH;
    }

    takeDamage(amount) {
        this.health -= amount;
        this.element.classList.add('taking-damage');
        setTimeout(() => this.element.classList.remove('taking-damage'), 100);

        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        this.element.remove();
        currentHouse = null;
        sheep.forEach(s => {
            s.isHiding = false;
            s.element.style.visibility = 'visible';
        });
    }
}


class Sheep {
    constructor() {
        this.element = document.createElement('img'); this.element.className = 'sheep'; this.element.src = sheepSprites.front;
        gameWorld.appendChild(this.element); 
        
        this.hungerIcon = document.createElement('img');
        this.hungerIcon.className = 'hunger-icon';
        this.hungerIcon.src = HUNGER_ICON_SRC;
        gameWorld.appendChild(this.hungerIcon);

        let startX, startY, attempts = 0;
        do { 
            const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; 
            startX = Math.random() * (GAME_DIMENSIONS.width - 16); 
            startY = walkableTop + Math.random() * (GAME_DIMENSIONS.height - walkableTop - 16); 
            attempts++; 
            if (attempts > 50) break; 
        } while (isPointBlocked(startX, startY));

        this.x = startX; this.y = startY; this.element.style.transform = `translate(${this.x}px, ${this.y}px)`; this.element.style.visibility = 'visible';
        this.targetX = this.x; this.targetY = this.y; this.isWaiting = true; this.isEating = false; this.isSheared = false; this.isScared = false; this.isHiding = false; this.isHungry = false;
        this.waitTimer = setTimeout(() => this.findNewTarget(), Math.random() * MAX_WAIT_TIME);
        this.element.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.tryShear(); });
    }

    findNearestGrass() {
        if (grassPatches.length === 0) {
            this.isWaiting = true;
            return;
        }

        let closestGrass = null;
        let minDistance = Infinity;

        grassPatches.forEach(grass => {
            const dx = this.x - grass.x;
            const dy = this.y - grass.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestGrass = grass;
            }
        });

        if (closestGrass) {
            this.targetX = closestGrass.x;
            this.targetY = closestGrass.y;
            this.isWaiting = false;
        }
    }

    findNewTarget() {
        if (this.isHiding) return;
        let newTargetX, newTargetY, attempts = 0;
        do { 
            const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; 
            newTargetX = Math.random() * (GAME_DIMENSIONS.width - 16); 
            newTargetY = walkableTop + Math.random() * (GAME_DIMENSIONS.height - walkableTop - 16); 
            attempts++; 
            if (attempts > 50) break; 
        } while (isPointBlocked(newTargetX, newTargetY));
        this.targetX = newTargetX; this.targetY = newTargetY; this.isWaiting = false; clearTimeout(this.waitTimer);
    }

    update(deltaTime) {
        if (this.isHiding || this.isEating || this.isScared) return;

        const isNight = currentStageIndex > 4;
        if (isNight) {
            if (currentHouse) {
                this.targetX = currentHouse.x + 25;
                this.targetY = currentHouse.y + 50;
                const dx = this.targetX - this.x;
                const dy = this.targetY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 10) {
                    this.isHiding = true;
                    this.element.style.visibility = 'hidden';
                    this.hungerIcon.style.visibility = 'hidden';
                    return;
                }
            } else {
                // TODO: Логика сбивания в кучу
            }
        }

        const currentSprites = this.isSheared ? baldSheepSprites : sheepSprites;

        if (this.isWaiting) {
            if (this.isHungry) {
                this.findNearestGrass();
            }
            for (let i = grassPatches.length - 1; i >= 0; i--) {
                const grass = grassPatches[i]; const dx = this.x - grass.x; const dy = this.y - grass.y; const distance = Math.sqrt(dx*dx + dy*dy);
                if (distance < EAT_RADIUS) {
                    this.isEating = true; this.element.src = currentSprites.eat; playSound(eatSound);
                    setTimeout(() => {
                        grass.element.src = 'images/ground/ground.png'; grassPatches.splice(i, 1); this.element.src = currentSprites.front; this.isEating = false; 
                        
                        if (this.isHungry) {
                            this.isSheared = false;
                            this.isHungry = false;
                            this.hungerIcon.style.visibility = 'hidden';
                        }

                        setTimeout(() => {
                            grass.element.style.transition = 'opacity 0.5s'; grass.element.style.opacity = 0;
                            setTimeout(() => grass.element.remove(), 500);
                        }, GRASS_DISAPPEAR_TIME);
                    }, EAT_ANIMATION_DURATION);
                    return;
                }
            }
            return;
        }

        const dx = this.targetX - this.x; const dy = this.targetY - this.y; const distance = Math.sqrt(dx*dx + dy*dy);
        if (distance < 1) { 
            this.isWaiting = true; 
            this.element.src = currentSprites.front; 
            // ИСПРАВЛЕНИЕ: Голодная овца не ищет новый маршрут, а ждет, чтобы поесть.
            if (!this.isHungry) {
                this.waitTimer = setTimeout(() => this.findNewTarget(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME)); 
            }
            return; 
        }
        const moveX = (dx / distance) * SHEEP_SPEED * deltaTime; const moveY = (dy / distance) * SHEEP_SPEED * deltaTime;
        this.x += moveX; this.y += moveY;
        if (Math.abs(dx) > Math.abs(dy)) { this.element.src = dx > 0 ? currentSprites.right : currentSprites.left; } else { this.element.src = dy > 0 ? currentSprites.front : currentSprites.back; }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        
        this.hungerIcon.style.transform = `translate(${this.x + 3}px, ${this.y - 14}px)`;
    }
    tryShear() {
        if (isShearMode && !this.isSheared) {
            this.isSheared = true;
            this.isHungry = true;
            this.hungerIcon.style.visibility = 'visible';
            spawnWool(this.x, this.y);
            this.findNearestGrass();

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
        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -30 : GAME_DIMENSIONS.width + 30;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + Math.random() * (GAME_DIMENSIONS.height - walkableTop - 30);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        this.targetSheep = this.findTarget();
        this.targetHouse = null;
        this.isScared = false;
        this.isCapturing = false;
        this.isAttacking = false;
        this.isDragging = false; 
        this.draggedSheep = null; 
        this.element.addEventListener('pointerdown', () => this.scare());
    }

    findTarget() {
        const availableSheep = sheep.filter(s => !s.isScared && !s.isHiding);
        return availableSheep.length > 0 ? availableSheep[Math.floor(Math.random() * availableSheep.length)] : null;
    }

    update(deltaTime) {
        const isNight = currentStageIndex > 4;
        if (isNight && currentHouse && sheep.some(s => s.isHiding)) {
            this.targetHouse = currentHouse;
            this.targetSheep = null;
        } else {
            this.targetHouse = null;
            if (!this.targetSheep || this.targetSheep.isScared || this.targetSheep.isHiding) {
                this.targetSheep = this.findTarget();
            }
        }

        if (this.isAttacking) return;
        
        if (this.isDragging && this.draggedSheep) {
            const exitX = this.fromLeft ? -50 : GAME_DIMENSIONS.width + 50;
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

        if (this.isScared || this.isCapturing) return;

        let targetX, targetY;
        if (this.targetHouse) {
            targetX = this.targetHouse.x + 50;
            targetY = this.targetHouse.y + 50;
        } else if (this.targetSheep) {
            targetX = this.targetSheep.x;
            targetY = this.targetSheep.y;
        } else {
            return;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
            if (this.targetHouse) this.attackHouse(this.targetHouse);
            else if (this.targetSheep) this.capture(this.targetSheep);
            return;
        }
        
        const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
        const moveY = (dy / distance) * WOLF_SPEED * deltaTime;
        this.x += moveX;
        this.y += moveY;
        if (Math.abs(dx) > Math.abs(dy)) { this.element.src = dx > 0 ? wolfSprites.right : wolfSprites.left; } 
        else { this.element.src = dy > 0 ? wolfSprites.front : wolfSprites.back; }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    attackHouse(house) {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.element.src = wolfSprites.attack;
        playSound(wolfAttackSound);
        house.takeDamage(10);
        setTimeout(() => { this.isAttacking = false; }, 1000);
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
            if (isPointBlocked(this.draggedSheep.x, this.draggedSheep.y)) {
                this.draggedSheep.findNewTarget();
            }
        }
        spawnSkin(this.x, this.y);
        this.element.style.opacity = 0;
        setTimeout(() => { this.element.remove(); const wolfIndex = wolves.indexOf(this); if (wolfIndex > -1) wolves.splice(wolfIndex, 1); }, 500);
    }
}

// --- МЕХАНИКА ИГРЫ ---
function spawnGrass(px, py) { 
    playSound(plantSound); 
    const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; 
    if (py <= walkableTop || isPointBlocked(px, py)) return; 
    const patchX = clamp(px - GRASS_SIZE / 2, 0, GAME_DIMENSIONS.width - GRASS_SIZE); 
    const patchY = clamp(py - GRASS_SIZE / 2, walkableTop, GAME_DIMENSIONS.height - GRASS_SIZE); 
    const patchElement = document.createElement('img'); 
    patchElement.className = 'grass-patch'; 
    patchElement.src = 'images/grass/grass.png'; 
    patchElement.style.transform = `translate(${patchX}px, ${patchY}px)`; 
    grassLayer.appendChild(patchElement); 
    grassPatches.push({ x: patchX, y: patchY, element: patchElement });
    
    sheep.forEach(s => {
        if (s.isHungry && s.isWaiting) {
            s.findNearestGrass();
        }
    });
}
function spawnWool(px, py) {
    woolCount++;
    updateResourceCounters();
    const woolElement = document.createElement('img');
    woolElement.src = 'images/wool/wool.png';
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
    updateResourceCounters();
    const skinElement = document.createElement('img');
    skinElement.src = 'images/skin/skin.png';
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
    if (Math.random() < wolfSpawnChance) {
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
    clouds.forEach(cloud => cloud.element.classList.toggle('night', isNight));

    if (frameIndex === 3) { // Day 4
        sheep.forEach(s => {
            if (s.isHiding) {
                s.isHiding = false;
                s.element.style.visibility = 'visible';
                if (s.hungerIcon.style.visibility === 'visible') {
                    s.hungerIcon.style.visibility = 'visible';
                }
                s.findNewTarget();
            }
        });
    }

    if (frameIndex >= 4 && frameIndex <= 7) {
        wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE * (1 + (frameIndex - 4) * 0.1);
    } else if (frameIndex < 4) {
        const daysPastPeak = 7 - (currentStageIndex - 1);
        if (daysPastPeak > 0 && daysPastPeak <= 4) {
             wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE * (1 + (4 - daysPastPeak) * 0.1);
        } else {
            wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE;
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

// --- ЛОГИКА МАГАЗИНА ---
function handleShopTransaction(event) {
    const button = event.target.closest('.shop-item');
    if (!button) return;

    const item = button.dataset.item;
    const costGold = parseInt(button.dataset.costGold) || 0;
    const costWood = parseInt(button.dataset.costWood) || 0;
    const costBrick = parseInt(button.dataset.costBrick) || 0;
    const valueGold = parseInt(button.dataset.valueGold) || 0;

    if (costGold > 0) {
        if (goldCount >= costGold && woodCount >= costWood && brickCount >= costBrick) {
            goldCount -= costGold;
            woodCount -= costWood;
            brickCount -= costBrick;
            
            if (item.startsWith('house')) {
                if (currentHouse) currentHouse.destroy();
                currentHouse = new House(item);
            } else if (item === 'wood') {
                woodCount++;
            } else if (item === 'brick') {
                brickCount++;
            }
        } else {
            console.log("Недостаточно ресурсов!");
        }
    }
    else if (valueGold > 0) {
        if (item === 'sell_wool' && woolCount > 0) {
            woolCount--;
            goldCount += valueGold;
        } else if (item === 'sell_skin' && skinCount > 0) {
            skinCount--;
            goldCount += valueGold;
        }
    }
    updateResourceCounters();
}


// --- ИНИЦИАЛИЗАЦИЯ И ЗАПУСК ---
function initializeGame() {
    gameContainer.style.display = 'flex';
    loadingScreen.style.display = 'none';
    
    GAME_DIMENSIONS = gameWorld.getBoundingClientRect();
    if (GAME_DIMENSIONS.width === 0) {
        console.error("Не удалось определить размеры игрового мира. Инициализация прервана.");
        return;
    }

    updateResourceCounters();

    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < NUM_SHEEP; i++) { sheep.push(new Sheep()); }
    
    let lastTime = 0;
    function gameLoop(currentTime) { 
        if (lastTime === 0) lastTime = currentTime; 
        const deltaTime = (currentTime - lastTime) / 1000; 
        lastTime = currentTime; 
        clouds.forEach(c => c.update(deltaTime));
        sheep.forEach(s => s.update(deltaTime)); 
        wolves.forEach(w => w.update(deltaTime)); 
        requestAnimationFrame(gameLoop); 
    }
    requestAnimationFrame(gameLoop);
    runNextStage();
    
    gameWorld.addEventListener('pointerdown', (event) => {
        if (!isMusicStarted) { 
            daySound.play().catch(e => {});
            nightSong.play().then(() => nightSong.pause()).catch(e => {});
            isMusicStarted = true; 
        }
        const x = event.clientX - GAME_DIMENSIONS.left;
        const y = event.clientY - GAME_DIMENSIONS.top;
        if (!isShearMode) spawnGrass(x, y);
    });

    scissorsButton.addEventListener('click', () => {
        isShearMode = !isShearMode;
        scissorsButton.classList.toggle('active');
        document.body.style.cursor = isShearMode ? `url('images/scissors/scissors.png'), auto` : 'default';
    });

    shopButton.addEventListener('click', () => shopMenu.classList.remove('hidden'));
    closeShopButton.addEventListener('click', () => shopMenu.classList.add('hidden'));
    shopMenu.addEventListener('click', handleShopTransaction);


    setInterval(() => { playSound(sheepSound); }, 7000 + Math.random() * 8000);
    setInterval(spawnWolf, 1000);
}

function preloadAssets() {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length;

    if (totalAssets === 0) {
        initializeGame();
        return;
    }

    function assetLoaded() {
        loadedCount++;
        const progress = (loadedCount / totalAssets) * 100;
        progressBar.style.width = `${progress}%`;

        if (loadedCount === totalAssets) {
            setTimeout(initializeGame, 500);
        }
    }

    ASSETS_TO_LOAD.forEach(src => {
        if (src.endsWith('.png') || src.endsWith('.jpg')) {
            const img = new Image();
            img.onload = assetLoaded;
            img.onerror = () => {
                console.error(`Не удалось загрузить изображение: ${src}`);
                assetLoaded();
            };
            img.src = src;
        } else if (src.endsWith('.mp3')) {
            const audio = new Audio();
            audio.addEventListener('canplaythrough', assetLoaded, { once: true });
            audio.onerror = () => {
                console.error(`Не удалось загрузить аудио: ${src}`);
                assetLoaded();
            };
            audio.src = src;
        } else {
            assetLoaded(); 
        }
    });
}

window.addEventListener('load', () => {
    if (gameWorld) {
        preloadAssets();
    } else {
        console.error('Критическая ошибка: элемент #game-world не найден!');
    }
});
