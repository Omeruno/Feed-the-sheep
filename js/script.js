// --- НАСТРОЙКИ ИГРЫ ---
const STARTING_CHICKENS = 1;
const NUM_CLOUDS = 4;
const SHEEP_SPEED = 40;
const CHICKEN_SPEED = 45;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const GRASS_DISAPPEAR_TIME = 10000;
const GRASS_SIZE = 25;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.55;
const EAT_ANIMATION_DURATION = 500;
const WOLF_BASE_SPAWN_CHANCE = 0.08;
const WOLF_SPEED = 55;
const HOUSE_BASE_HEALTH = 100;
const BASE_ANIMAL_CAPACITY = 3;
const CHICKEN_EGG_CHANCE = 0.05;

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
const OBSTACLES = [ { x: 0, y: 0.6, width: 0.075, height: 0.35 }, { x: 0.925, y: 0.6, width: 0.075, height: 0.35 } ];

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
const chickenSound = document.getElementById('chicken-sound');
const chickenAmbientSound = document.getElementById('chicken-ambient-sound');
const woolAmountSpan = document.getElementById('wool-amount');
const skinAmountSpan = document.getElementById('skin-amount');
const eggAmountSpan = document.getElementById('egg-amount');
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
const resourcesToggleButton = document.getElementById('resources-toggle-button');


// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const baldSheepSprites = { front: 'images/sheep/baldsheep/sheep_bald_front.png', back: 'images/sheep/baldsheep/sheep_bald_back.png', left: 'images/sheep/baldsheep/sheep_bald_left.png', right: 'images/sheep/baldsheep/sheep_bald_right.png', eat: 'images/sheep/baldsheep/sheep_bald_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const chickenSprites = { front: 'images/chicken/chicken_top.png', back: 'images/chicken/chicken_back.png', left: 'images/chicken/chicken_left.png', right: 'images/chicken/chicken_right.png', eat: 'images/chicken/chicken_eat.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const HOUSE_SPRITES = { house_1: 'images/house/house_1.png', house_2: 'images/house/house_2.png', house_3: 'images/house/house_3.png', house_4: 'images/house/house_4.png' };
const HUNGER_ICON_SRC = 'images/icons/hunger_icon.png';
const GRASS_ICON_SRC = 'images/icons/grass_icon.png';
const SCISSORS_ICON_SRC = 'images/scissors/scissors.png';
const REPAIR_ICON_SRC = 'images/icons/repair_icon.png';
const INVENTORY_ICON_SRC = 'images/icons/inventory_icon.png';
const EGG_ICON_SRC = 'images/chicken/egg.png';
const CALCULATOR_ICON_SRC = 'images/icons/calculator_icon.png';

// --- МАССИВ РЕСУРСОВ ДЛЯ ПРЕДЗАГРУЗКИ (ТОЛЬКО ГРАФИКА) ---
const ASSETS_TO_LOAD = [
    ...Object.values(sheepSprites), ...Object.values(baldSheepSprites), ...Object.values(wolfSprites), ...Object.values(chickenSprites),
    ...CLOUD_SPRITES, ...LOCATION_FRAMES, ...Object.values(HOUSE_SPRITES),
    'images/grass/grass.png', 'images/ground/ground.png', 'images/wool/wool.png', 'images/skin/skin.png', EGG_ICON_SRC,
    SCISSORS_ICON_SRC, 'images/shop/shop.png', 'images/shop/shop_menu.png',
    'images/gold/gold.png', 'images/tree/tree.png', 'images/brick/brick.png',
    HUNGER_ICON_SRC, GRASS_ICON_SRC, REPAIR_ICON_SRC, INVENTORY_ICON_SRC, CALCULATOR_ICON_SRC
];

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
let sheep = [];
let chickens = [];
let wolves = [];
let clouds = [];
let grassPatches = [];
let currentHouse = null;
let woolCount = 0;
let skinCount = 0;
let eggCount = 0;
let goldCount = 30;
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
let maxAnimals = BASE_ANIMAL_CAPACITY;
let hasRepairHammer = false;

// --- ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ---
if (daySound) daySound.volume = 0.3; if (nightSong) nightSong.volume = 0.3; if (sheepSound) sheepSound.volume = 0.5; if (plantSound) plantSound.volume = 0.25; if (eatSound) eatSound.volume = 0.25; if (wolfAttackSound) wolfAttackSound.volume = 0.6; if (wolfDeadSound) wolfDeadSound.volume = 0.6; if(chickenSound) chickenSound.volume = 0.5; if(chickenAmbientSound) chickenAmbientSound.volume = 0.4;

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
    eggAmountSpan.textContent = eggCount;
    goldAmountSpan.textContent = goldCount;
    woodAmountSpan.textContent = woodCount;
    brickAmountSpan.textContent = brickCount;
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
    
    [...sheep, ...chickens].forEach(animal => {
        if (animal.isHungry && animal.isWaiting) {
            animal.decideNextAction();
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

function spawnEgg(px, py) {
    eggCount++;
    updateResourceCounters();
    const eggElement = document.createElement('img');
    eggElement.src = EGG_ICON_SRC;
    eggElement.className = 'egg-item';
    eggElement.style.transform = `translate(${px}px, ${py}px)`;
    eggElement.style.visibility = 'visible';
    gameWorld.appendChild(eggElement);
    animateResourceToUI(eggElement, 'egg-counter');
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
        [...sheep, ...chickens].forEach(animal => {
            if (animal.isHiding) {
                animal.isHiding = false;
                animal.element.style.visibility = 'visible';
                if (animal.hungerIcon && animal.hungerIcon.style.visibility === 'visible') {
                    animal.hungerIcon.style.visibility = 'visible';
                }
                animal.findNewTarget();
            }
        });
    }
    
    let baseChance = WOLF_BASE_SPAWN_CHANCE;
    if (isNight) {
        let nightNumber = frameIndex - 2; // night 1, 2, 3...
        baseChance *= (1 + nightNumber * 0.1);
    }
    wolfSpawnChance = baseChance;
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
    document.getElementById('animal-capacity-info').textContent = `${sheep.length + chickens.length}/${maxAnimals}`;

    const upgradeButton = document.getElementById('upgrade-scissors-button');
    const nextLevel = scissorsLevel + 1;
    const cost = 150 * Math.pow(2, scissorsLevel - 1);
    upgradeButton.dataset.costGold = cost;
    upgradeButton.querySelector('.item-name').textContent = `Upgrade Scissors (Lvl ${nextLevel})`;
    upgradeButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${cost}`;

    const buySheepButton = document.getElementById('buy-sheep-button');
    const sheepCost = 50 * Math.pow(1.5, sheep.length);
    buySheepButton.dataset.costGold = Math.ceil(sheepCost);
    buySheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${Math.ceil(sheepCost)}`;

    const buyChickenButton = document.getElementById('buy-chicken-button');
    const chickenCost = 25 * Math.pow(1.5, chickens.length);
    buyChickenButton.dataset.costGold = Math.ceil(chickenCost);
    buyChickenButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${Math.ceil(chickenCost)}`;
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
        if (goldCount >= costGold && (sheep.length + chickens.length) < maxAnimals) {
            goldCount -= costGold;
            sheep.push(new Sheep());
            purchaseSuccess = true;
        }
    } else if (item === 'buy_chicken') {
        if (goldCount >= costGold && (sheep.length + chickens.length) < maxAnimals) {
            goldCount -= costGold;
            chickens.push(new Chicken());
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
            goldCount -= costGold;
            brickCount++;
            purchaseSuccess = true;
        }
    } else if (item === 'sell_wool' && woolCount > 0) {
        goldCount += woolCount * valueGold;
        woolCount = 0;
        purchaseSuccess = true;
    } else if (item === 'sell_skin' && skinCount > 0) {
        goldCount += skinCount * valueGold;
        skinCount = 0;
        purchaseSuccess = true;
    } else if (item === 'sell_egg' && eggCount > 0) {
        goldCount += eggCount * valueGold;
        eggCount = 0;
        purchaseSuccess = true;
    } else if (item === 'sell_all') {
        let totalGain = (woolCount * 7) + (skinCount * 10) + (eggCount * 3);
        if (totalGain > 0) {
            goldCount += totalGain;
            woolCount = 0;
            skinCount = 0;
            eggCount = 0;
            purchaseSuccess = true;
        }
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
    menuToggleButton.style.backgroundImage = `url('${INVENTORY_ICON_SRC}')`;
    resourcesToggleButton.style.backgroundImage = `url('${CALCULATOR_ICON_SRC}')`;
    document.body.style.cursor = `url('${SCISSORS_ICON_SRC}'), auto`;

    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < STARTING_CHICKENS; i++) { chickens.push(new Chicken()); }
    
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
        chickens.forEach(c => c.update(deltaTime));
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
    resourcesToggleButton.addEventListener('click', () => {
        document.getElementById('resources-panel-container').classList.toggle('open');
    });


    setInterval(() => { if (!isPaused && sheep.length > 0) playSound(sheepSound); }, 7000 + Math.random() * 8000);
    setInterval(() => { if (!isPaused && chickens.length > 0) playSound(chickenAmbientSound); }, 5000 + Math.random() * 6000);
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
