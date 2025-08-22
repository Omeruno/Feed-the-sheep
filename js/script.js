// --- НАСТРОЙКИ ИГРЫ ---
const STARTING_SHEEP = 1;
const NUM_CLOUDS = 4;
const SHEEP_SPEED = 40;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const GRASS_DISAPPEAR_TIME = 10000;
const GRASS_SIZE = 25;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.55;
const EAT_ANIMATION_DURATION = 500;
const WOLF_BASE_SPAWN_CHANCE = 0.15;
const WOLF_SPEED = 55;
const HOUSE_BASE_HEALTH = 100;
const BASE_SHEEP_CAPACITY = 3;

// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК (НОЧИ УСКОРЕНЫ НА 25%) ---
const CYCLE_STAGES = [
    { name: "Day 1", frameIndex: 0, duration: 120000 }, 
    { name: "Day 2", frameIndex: 1, duration: 60000 },
    { name: "Day 3", frameIndex: 2, duration: 60000 },  
    { name: "Day 4", frameIndex: 3, duration: 60000 },
    { name: "Day 5", frameIndex: 4, duration: 45000 },
    { name: "Day 6", frameIndex: 5, duration: 45000 },
    { name: "Day 7", frameIndex: 6, duration: 45000 },
    { name: "Day 8", frameIndex: 7, duration: 90000 }
];

// --- Зоны препятствий (уменьшены, чтобы расширить зону ходьбы) ---
const OBSTACLES = [ { x: 0, y: 0.6, width: 0.15, height: 0.35 }, { x: 0.85, y: 0.6, width: 0.15, height: 0.35 } ];

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
const grassButton = document.getElementById('grass-button');
const shopButton = document.getElementById('shop-button');
const repairButton = document.getElementById('repair-button');
const shopMenu = document.getElementById('shop-menu');
const closeShopButton = document.getElementById('close-shop-button');
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const gameContainer = document.getElementById('game-container');
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');
const menuToggleButton = document.getElementById('menu-toggle-button');
const mainActionsContainer = document.getElementById('main-actions-container');


// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const baldSheepSprites = { front: 'images/sheep/baldsheep/sheep_bald_front.png', back: 'images/sheep/baldsheep/sheep_bald_back.png', left: 'images/sheep/baldsheep/sheep_bald_left.png', right: 'images/sheep/baldsheep/sheep_bald_right.png', eat: 'images/sheep/baldsheep/sheep_bald_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const HOUSE_SPRITES = { house_1: 'images/house/house_1.png', house_2: 'images/house/house_2.png', house_3: 'images/house/house_3.png', house_4: 'images/house/house_4.png' };
const HUNGER_ICON_SRC = 'images/icons/hunger_icon.png';
const GRASS_ICON_SRC = 'images/icons/grass_icon.png';
const SCISSORS_ICON_SRC = 'images/scissors/scissors.png';
const REPAIR_ICON_SRC = 'images/icons/repair_icon.png';

// --- МАССИВ РЕСУРСОВ ДЛЯ ПРЕДЗАГРУЗКИ (ТОЛЬКО ГРАФИКА) ---
const ASSETS_TO_LOAD = [
    ...Object.values(sheepSprites), ...Object.values(baldSheepSprites), ...Object.values(wolfSprites),
    ...CLOUD_SPRITES, ...LOCATION_FRAMES, ...Object.values(HOUSE_SPRITES),
    'images/grass/grass.png', 'images/ground/ground.png', 'images/wool/wool.png', 'images/skin/skin.png',
    SCISSORS_ICON_SRC, 'images/shop/shop.png', 'images/shop/shop_menu.png',
    'images/gold/gold.png', 'images/tree/tree.png', 'images/brick/brick.png',
    HUNGER_ICON_SRC, GRASS_ICON_SRC, REPAIR_ICON_SRC
];

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
let sheep = [];
let wolves = [];
let clouds = [];
let grassPatches = [];
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
let currentTool = 'scissors';
let isPaused = false;
let wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE;
let GAME_DIMENSIONS = null;
let scissorsLevel = 1;
let woolPerShear = 1;
let maxSheep = BASE_SHEEP_CAPACITY;
let hasRepairHammer = false;

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
    constructor(type, capacity) {
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
        this.capacity = capacity;
        maxSheep = this.capacity;

        this.hpBarContainer = document.createElement('div');
        this.hpBarContainer.className = 'hp-bar-container';
        this.hpBar = document.createElement('div');
        this.hpBar.className = 'hp-bar';
        this.hpBarContainer.appendChild(this.hpBar);
        gameWorld.appendChild(this.hpBarContainer);
        this.updateHpBar();
    }

    updateHpBar() {
        this.hpBar.style.width = `${(this.health / HOUSE_BASE_HEALTH) * 100}%`;
        this.hpBarContainer.style.transform = `translate(${this.x + 25}px, ${this.y - 10}px)`;
        this.hpBarContainer.style.visibility = 'visible';
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHpBar();
        this.element.classList.add('taking-damage');
        setTimeout(() => this.element.classList.remove('taking-damage'), 100);

        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    repair() {
        this.health = HOUSE_BASE_HEALTH;
        this.updateHpBar();
    }

    destroy() {
        this.element.remove();
        this.hpBarContainer.remove();
        currentHouse = null;
        maxSheep = BASE_SHEEP_CAPACITY;
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
        
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;

        const minX = horizontalMargin;
        const maxX = GAME_DIMENSIONS.width - horizontalMargin;
        const minY = walkableTop + verticalMargin;
        const maxY = GAME_DIMENSIONS.height - verticalMargin;

        do { 
            startX = minX + Math.random() * (maxX - minX);
            startY = minY + Math.random() * (maxY - minY);
            attempts++; 
            if (attempts > 50) break; 
        } while (isPointBlocked(startX, startY));

        this.x = startX; this.y = startY; this.element.style.transform = `translate(${this.x}px, ${this.y}px)`; this.element.style.visibility = 'visible';
        this.targetX = this.x; this.targetY = this.y; this.isWaiting = true; this.isEating = false; this.isSheared = false; this.isScared = false; this.isHiding = false; this.isHungry = false;
        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
        this.element.addEventListener('pointerdown', (e) => { e.stopPropagation(); this.tryShear(); });
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        let foundGrass = false;
        if (this.isHungry) {
            foundGrass = this.findNearestGrass();
        }
        
        if (!foundGrass) {
            this.findNewTarget();
        }
    }

    findNearestGrass() {
        if (grassPatches.length === 0) return false;

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
            return true;
        }
        return false;
    }

    findNewTarget() {
        if (this.isHiding) return;
        let newTargetX, newTargetY, attempts = 0;
        
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;

        const minX = horizontalMargin;
        const maxX = GAME_DIMENSIONS.width - horizontalMargin;
        const minY = walkableTop + verticalMargin;
        const maxY = GAME_DIMENSIONS.height - verticalMargin;

        do { 
            newTargetX = minX + Math.random() * (maxX - minX);
            newTargetY = minY + Math.random() * (maxY - minY);
            attempts++; 
            if (attempts > 50) break; 
        } while (isPointBlocked(newTargetX, newTargetY));

        this.targetX = newTargetX; this.targetY = newTargetY;
    }

    update(deltaTime) {
        if (this.isHiding || this.isEating || this.isScared) return;

        const isNight = currentStageIndex >= 3;
        if (isNight && currentHouse) {
            this.targetX = currentHouse.x + 25;
            this.targetY = currentHouse.y + 50;
            const dx_h = this.targetX - this.x;
            const dy_h = this.targetY - this.y;
            const distance_h = Math.sqrt(dx_h * dx_h + dy_h * dy_h);
            if (distance_h < 10) {
                this.isHiding = true;
                this.element.style.visibility = 'hidden';
                this.hungerIcon.style.visibility = 'hidden';
                return;
            }
        }

        const currentSprites = this.isSheared ? baldSheepSprites : sheepSprites;

        for (let i = grassPatches.length - 1; i >= 0; i--) {
            const grass = grassPatches[i];
            const distanceToGrass = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
            if (distanceToGrass < EAT_RADIUS) {
                this.isEating = true;
                this.element.src = currentSprites.eat;
                playSound(eatSound);
                setTimeout(() => {
                    grass.element.src = 'images/ground/ground.png';
                    grassPatches.splice(i, 1);
                    this.element.src = currentSprites.front;
                    this.isEating = false;
                    if (this.isHungry) {
                        this.isSheared = false;
                        this.isHungry = false;
                        this.hungerIcon.style.visibility = 'hidden';
                    }
                    this.decideNextAction();
                    
                    setTimeout(() => {
                        grass.element.style.transition = 'opacity 0.5s';
                        grass.element.style.opacity = 0;
                        setTimeout(() => grass.element.remove(), 500);
                    }, GRASS_DISAPPEAR_TIME);
                }, EAT_ANIMATION_DURATION);
                return;
            }
        }
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget < 1) {
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.waitTimer = setTimeout(() => {
                    this.isWaiting = false;
                    this.decideNextAction();
                }, MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME));
            }
        } else {
            const moveX = (dx / distanceToTarget) * SHEEP_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * SHEEP_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.element.src = dx > 0 ? currentSprites.right : currentSprites.left;
            } else {
                this.element.src = dy > 0 ? currentSprites.front : currentSprites.back;
            }
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }

        this.hungerIcon.style.transform = `translate(${this.x + 3}px, ${this.y - 14}px)`;
    }

    tryShear() {
        if (currentTool === 'scissors' && !this.isSheared) {
            this.isSheared = true;
            this.isHungry = true;
            this.hungerIcon.style.visibility = 'visible';
            spawnWool(this.x, this.y, woolPerShear);
            this.decideNextAction();
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
        this.x = this.fromLeft ? -50 : GAME_DIMENSIONS.width + 50;
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
        const isNight = currentStageIndex >= 3;
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
                if(this.draggedSheep) this.draggedSheep.element.remove();
                const wolfIndex = wolves.indexOf(this);
                if (wolfIndex > -1) wolves.splice(wolfIndex, 1);
                const sheepIndex = sheep.indexOf(this.draggedSheep);
                if (sheepIndex > -1) {
                    sheep.splice(sheepIndex, 1);
                    if (sheep.length === 0) {
                        gameOver();
                    }
                }
                return;
            }
            const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
            this.x += moveX;
            this.element.src = this.fromLeft ? wolfSprites.left : wolfSprites.right;
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            if(this.draggedSheep) {
                this.draggedSheep.x = this.x + (this.fromLeft ? 15 : -15);
                this.draggedSheep.y = this.y;
                this.draggedSheep.element.style.transform = `translate(${this.draggedSheep.x}px, ${this.draggedSheep.y}px)`;
            }
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
            targetX = GAME_DIMENSIONS.width / 2;
            targetY = GAME_DIMENSIONS.height * 0.8;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 && this.targetSheep) {
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
            this.draggedSheep.decideNextAction();
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
            s.decideNextAction();
        }
    });
}
function spawnWool(px, py, amount = 1) {
    woolCount += amount;
    updateResourceCounters();
    const woolElement = document.createElement('img');
    woolElement.src = 'images/wool/wool.png';
    woolElement.className = 'wool-item';
    woolElement.style.transform = `translate(${px}px, ${py}px)`;
    woolElement.style.visibility = 'visible';
    gameWorld.appendChild(woolElement);
    animateResourceToUI(woolElement, 'wool-counter');
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
    animateResourceToUI(skinElement, 'skin-counter');
}
function spawnWolf() {
    if (isPaused) return;
    if (Math.random() < wolfSpawnChance) {
        wolves.push(new Wolf());
    }
}

function animateResourceToUI(element, targetCounterId) {
    const targetCounter = document.getElementById(targetCounterId);
    if (!targetCounter) {
        element.remove();
        return;
    }

    const gameWorldRect = gameWorld.getBoundingClientRect();
    const endRect = targetCounter.getBoundingClientRect();
    
    const endX = endRect.left - gameWorldRect.left + (endRect.width / 2);
    const endY = endRect.top - gameWorldRect.top + (endRect.height / 2);

    requestAnimationFrame(() => {
        element.style.transform = `translate(${endX}px, ${endY}px) scale(0.5)`;
        element.style.opacity = '0.5';
    });

    setTimeout(() => {
        element.remove();
    }, 1000);
}

// --- УПРАВЛЕНИЕ МУЗЫКОЙ И ФОНОМ ---
function manageBackgroundMusic(frameIndex) { 
    if (!isMusicStarted) return; 
    if (frameIndex >= 3) { // Ночь с 4-го дня
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
    
    const isNight = frameIndex >= 3;
    clouds.forEach(cloud => cloud.element.classList.toggle('night', isNight));

    if (frameIndex === 2) { // Овцы выходят на 3-й день
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
    
    let baseChance = WOLF_BASE_SPAWN_CHANCE;
    if (frameIndex >= 4 && frameIndex <= 7) {
        baseChance *= (1 + (frameIndex - 4) * 0.1);
    } else if (frameIndex < 4) {
        const daysPastPeak = 7 - (currentStageIndex - 1);
        if (daysPastPeak > 0 && daysPastPeak <= 4) {
             baseChance *= (1 + (4 - daysPastPeak) * 0.1);
        }
    }

    wolfSpawnChance = isNight ? baseChance * 1.10 : baseChance;
}
function runNextStage() { 
    if (isPaused) {
        setTimeout(runNextStage, 100);
        return;
    }
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
function updateShopUI() {
    document.getElementById('shop-gold').textContent = goldCount;
    document.getElementById('shop-wood').textContent = woodCount;
    document.getElementById('shop-brick').textContent = brickCount;
    document.getElementById('sheep-capacity-info').textContent = `${sheep.length}/${maxSheep}`;

    const upgradeButton = document.getElementById('upgrade-scissors-button');
    const nextLevel = scissorsLevel + 1;
    const cost = 150 * Math.pow(2, scissorsLevel - 1);
    upgradeButton.dataset.costGold = cost;
    upgradeButton.querySelector('.item-name').textContent = `Upgrade Scissors (Lvl ${nextLevel})`;
    upgradeButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${cost}`;

    const buySheepButton = document.getElementById('buy-sheep-button');
    const sheepCost = 50 * Math.pow(1.5, sheep.length - 1);
    buySheepButton.dataset.costGold = Math.ceil(sheepCost);
    buySheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${Math.ceil(sheepCost)}`;
}

function handleShopTransaction(event) {
    const button = event.target.closest('.shop-item');
    if (!button) return;

    const item = button.dataset.item;
    const costGold = parseInt(button.dataset.costGold) || 0;
    const costWood = parseInt(button.dataset.costWood) || 0;
    const costBrick = parseInt(button.dataset.costBrick) || 0;
    const valueGold = parseInt(button.dataset.valueGold) || 0;
    const capacity = parseInt(button.dataset.capacity) || 0;

    let purchaseSuccess = false;

    if (item === 'upgrade_scissors') {
        if (goldCount >= costGold) {
            goldCount -= costGold;
            scissorsLevel++;
            woolPerShear++;
            purchaseSuccess = true;
        }
    } else if (item === 'buy_sheep') {
        if (goldCount >= costGold && sheep.length < maxSheep) {
            goldCount -= costGold;
            sheep.push(new Sheep());
            purchaseSuccess = true;
        }
    } else if (item.startsWith('house')) {
        if (goldCount >= costGold && woodCount >= costWood && brickCount >= costBrick) {
            goldCount -= costGold;
            woodCount -= costWood;
            brickCount -= costBrick;
            if (currentHouse) currentHouse.destroy();
            currentHouse = new House(item, capacity);
            purchaseSuccess = true;
        }
    } else if (item === 'wood') {
        if (goldCount >= costGold) {
            goldCount -= costGold;
            woodCount++;
            purchaseSuccess = true;
        }
    } else if (item === 'brick') {
        if (goldCount >= costGold) {
            brickCount++;
            purchaseSuccess = true;
        }
    } else if (item === 'sell_wool' && woolCount > 0) {
        woolCount--;
        goldCount += valueGold;
        purchaseSuccess = true;
    } else if (item === 'sell_skin' && skinCount > 0) {
        skinCount--;
        goldCount += valueGold;
        purchaseSuccess = true;
    } else if (item === 'buy_hammer') {
        if (goldCount >= costGold && !hasRepairHammer) {
            goldCount -= costGold;
            hasRepairHammer = true;
            repairButton.classList.remove('hidden');
            purchaseSuccess = true;
        }
    }

    button.classList.add(purchaseSuccess ? 'purchase-success' : 'purchase-fail');
    setTimeout(() => {
        button.classList.remove('purchase-success', 'purchase-fail');
    }, 500);

    updateResourceCounters();
    updateShopUI();
}

function gameOver() {
    isPaused = true;
    gameOverScreen.classList.remove('hidden');
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
    scissorsButton.style.backgroundImage = `url('${SCISSORS_ICON_SRC}')`;
    grassButton.style.backgroundImage = `url('${GRASS_ICON_SRC}')`;
    repairButton.style.backgroundImage = `url('${REPAIR_ICON_SRC}')`;
    document.body.style.cursor = `url('${SCISSORS_ICON_SRC}'), auto`;

    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < STARTING_SHEEP; i++) { sheep.push(new Sheep()); }
    
    let lastTime = 0;
    function gameLoop(currentTime) { 
        if (isPaused) {
            lastTime = currentTime;
            requestAnimationFrame(gameLoop);
            return;
        }
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
        if (currentTool === 'grass') {
            spawnGrass(x, y);
        } else if (currentTool === 'repair' && currentHouse) {
            const houseRect = currentHouse.element.getBoundingClientRect();
            if (event.clientX >= houseRect.left && event.clientX <= houseRect.right &&
                event.clientY >= houseRect.top && event.clientY <= houseRect.bottom) {
                currentHouse.repair();
                hasRepairHammer = false;
                repairButton.classList.add('hidden');
                scissorsButton.click();
            }
        }
    });

    scissorsButton.addEventListener('click', () => {
        currentTool = 'scissors';
        document.body.style.cursor = `url('${SCISSORS_ICON_SRC}'), auto`;
        scissorsButton.classList.add('active');
        grassButton.classList.remove('active');
        repairButton.classList.remove('active');
    });

    grassButton.addEventListener('click', () => {
        currentTool = 'grass';
        document.body.style.cursor = `url('${GRASS_ICON_SRC}'), auto`;
        grassButton.classList.add('active');
        scissorsButton.classList.remove('active');
        repairButton.classList.remove('active');
    });

    repairButton.addEventListener('click', () => {
        if (hasRepairHammer) {
            currentTool = 'repair';
            document.body.style.cursor = `url('${REPAIR_ICON_SRC}'), auto`;
            repairButton.classList.add('active');
            scissorsButton.classList.remove('active');
            grassButton.classList.remove('active');
        }
    });

    shopButton.addEventListener('click', () => {
        isPaused = true;
        updateShopUI();
        shopMenu.classList.remove('hidden');
    });
    closeShopButton.addEventListener('click', () => {
        isPaused = false;
        shopMenu.classList.add('hidden');
    });
    shopMenu.addEventListener('click', handleShopTransaction);
    restartButton.addEventListener('click', () => {
        location.reload();
    });
    menuToggleButton.addEventListener('click', () => {
        mainActionsContainer.classList.toggle('open');
    });


    setInterval(() => { if (!isPaused) playSound(sheepSound); }, 7000 + Math.random() * 8000);
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
        } else {
            assetLoaded();
        }
    });
}

window.addEventListener('load', () => {
    // ИСПРАВЛЕНИЕ: Добавляем обработчик для отмены двойного тапа на iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        let now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    if (gameWorld) {
        preloadAssets();
    } else {
        console.error('Критическая ошибка: элемент #game-world не найден!');
    }
});
