// --- НАСТРОЙКИ ИГРЫ ---
const STARTING_CHICKENS = 1;
const NUM_CLOUDS = 4;
const SHEEP_SPEED = 40;
const CHICKEN_SPEED = 45;
const COW_SPEED = 35;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.55;
const EAT_ANIMATION_DURATION = 500;
const WOLF_BASE_SPAWN_CHANCE = 0.08;
const WOLF_SPEED = 55;
const HOUSE_BASE_HEALTH = 100;
const BASE_ANIMAL_CAPACITY = 3;
const CHICKEN_BASE_EGG_CHANCE = 0.1; // Увеличено

// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК (НОЧИ УСКОРЕНЫ НА 20%) ---
const CYCLE_STAGES = [
    { name: "Day 1", frameIndex: 0, duration: 120000 }, 
    { name: "Day 2", frameIndex: 1, duration: 60000 },
    { name: "Day 3", frameIndex: 2, duration: 60000 },  
    { name: "Day 4", frameIndex: 3, duration: 60000 },
    { name: "Day 5", frameIndex: 4, duration: 36000 }, 
    { name: "Day 6", frameIndex: 5, duration: 36000 }, 
    { name: "Day 7", frameIndex: 6, duration: 36000 }, 
    { name: "Day 8", frameIndex: 7, duration: 72000 }
];

// --- Зоны препятствий ---
const OBSTACLES = [ { x: 0, y: 0.6, width: 0.075, height: 0.35 }, { x: 0.925, y: 0.6, width: 0.075, height: 0.35 } ];

// --- ПОИСК ЭЛЕМЕНТОВ DOM ---
const gameWorld = document.getElementById('game-world');
const bg1 = document.getElementById('bg-1');
const bg2 = document.getElementById('bg-2');
const cloudLayer = document.getElementById('cloud-layer');
const grassLayer = document.getElementById('grass-layer');
const backgroundMelody = document.getElementById('background-melody');
const daySound = document.getElementById('day-sound');
const nightSong = document.getElementById('night-song');
const sheepSound = document.getElementById('sheep-sound');
const plantSound = document.getElementById('plant-sound');
const eatSound = document.getElementById('eat-sound');
const wolfAttackSound = document.getElementById('wolf-attack-sound');
const wolfDeadSound = document.getElementById('wolf-dead-sound');
const chickenSound = document.getElementById('chicken-sound');
const chickenAmbientSound = document.getElementById('chicken-ambient-sound');
const cowAmbientSound = document.getElementById('cow-ambient-sound');
const woolAmountSpan = document.getElementById('wool-amount');
const skinAmountSpan = document.getElementById('skin-amount');
const eggAmountSpan = document.getElementById('egg-amount');
const milkAmountSpan = document.getElementById('milk-amount');
const goldAmountSpan = document.getElementById('gold-amount');
const grassSeedAmountSpan = document.getElementById('grass-seed-amount');
const haySeedAmountSpan = document.getElementById('hay-seed-amount');
const grassButton = document.getElementById('grass-button');
const hayButton = document.getElementById('hay-button');
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
const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');
const closeSettingsButton = document.getElementById('close-settings-button');
const soundToggleButton = document.getElementById('sound-toggle-button');
const musicToggleButton = document.getElementById('music-toggle-button');
const languageToggleButton = document.getElementById('language-toggle-button');
const grandfatherDialogue = document.getElementById('grandfather-dialogue');
const dialogueContinueButton = document.getElementById('dialogue-continue');
const dialogueText = document.getElementById('dialogue-text');
const playerMessage = document.getElementById('player-message');


// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const chickenSprites = { front: 'images/chicken/chicken_top.png', back: 'images/chicken/chicken_back.png', left: 'images/chicken/chicken_left.png', right: 'images/chicken/chicken_right.png', eat: 'images/chicken/chicken_eat.png' };
const cowSprites = { front: 'images/cow/cow_top.png', back: 'images/cow/cow_back.png', left: 'images/cow/cow_left.png', right: 'images/cow/cow_right.png', eat: 'images/cow/cow_eat.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const HOUSE_SPRITES = { house_1: 'images/house/house_1.png', house_2: 'images/house/house_2.png', house_3: 'images/house/house_3.png', house_4: 'images/house/house_4.png' };
const HAY_SPRITES = ['images/icons/rostock_small.png', 'images/icons/rostock_sredny.png', 'images/icons/rostock_ready.png'];
const MILK_ICON_SRC = 'images/icons/milk.png';
const GRASS_ICON_SRC = 'images/icons/grass_icon.png';
const REPAIR_ICON_SRC = 'images/icons/repair_icon.png';
const INVENTORY_ICON_SRC = 'images/icons/inventory_icon.png';
const EGG_ICON_SRC = 'images/chicken/egg.png';
const CALCULATOR_ICON_SRC = 'images/icons/calculator_icon.png';
const GOLD_ICON_SRC = 'images/gold/gold.png';
const SETTINGS_ICON_SRC = 'images/icons/settings.png';
const GRANDFATHER_SRC = 'images/grandfather/grandfather.png';


// --- МАССИВ РЕСУРСОВ ДЛЯ ПРЕДЗАГРУЗКИ (ТОЛЬКО ГРАФИКА) ---
const ASSETS_TO_LOAD = [
    ...Object.values(sheepSprites), ...Object.values(wolfSprites), ...Object.values(chickenSprites), ...Object.values(cowSprites),
    ...CLOUD_SPRITES, ...LOCATION_FRAMES, ...Object.values(HOUSE_SPRITES), ...HAY_SPRITES,
    'images/grass/grass.png', 'images/ground/ground.png', 'images/wool/wool.png', 'images/skin/skin.png', EGG_ICON_SRC, MILK_ICON_SRC,
    'images/shop/shop.png', 'images/shop/shop_menu.png', GRANDFATHER_SRC,
    GOLD_ICON_SRC, 'images/tree/tree.png', 'images/brick/brick.png',
    GRASS_ICON_SRC, REPAIR_ICON_SRC, INVENTORY_ICON_SRC, CALCULATOR_ICON_SRC, SETTINGS_ICON_SRC
];

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
let sheep = [], chickens = [], cows = [], wolves = [], clouds = [], grassPatches = [], hayPatches = [];
let currentHouse = null;
let woodCount = 10, brickCount = 0;
let woolCount = 0, skinCount = 0, eggCount = 0, milkCount = 0, goldCount = 30, grassSeedCount = 5, haySeedCount = 0;
let activeBgLayer = bg1, hiddenBgLayer = bg2;
let currentStageIndex = 0, cycleDirection = 1;
let isMusicStarted = false, isPaused = false, isDialogueActive = false;
let currentTool = 'grass';
let wolfSpawnChance = WOLF_BASE_SPAWN_CHANCE;
let GAME_DIMENSIONS = null;
let sheepLevel = 1, chickenLevel = 1, cowLevel = 1, woolPerSheep = 1, eggChance = CHICKEN_BASE_EGG_CHANCE;
let maxAnimals = BASE_ANIMAL_CAPACITY;
let hasRepairHammer = false;

// --- НАСТРОЙКИ ---
let isSoundMuted = false, isMusicMuted = false, currentLanguage = 'rus';

// --- ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ---
function setInitialVolumes() {
    backgroundMelody.volume = 0.4;
    daySound.volume = 0.3; 
    nightSong.volume = 0.3; 
    sheepSound.volume = 0.16;
    plantSound.volume = 0.25; 
    eatSound.volume = 0.25; 
    wolfAttackSound.volume = 0.6; 
    wolfDeadSound.volume = 0.6; 
    chickenSound.volume = 0.5; 
    chickenAmbientSound.volume = 0.13;
    cowAmbientSound.volume = 0.16;
}
setInitialVolumes();

// --- ПЕРЕВОД ---
const translations = {
    'rus': {
        loading: 'ЗАГРУЗКА',
        shop_house_title: 'Дом',
        shop_house1_name: 'Дом 1 (+5 мест)',
        shop_house2_name: 'Дом 2 (+7 мест)',
        shop_house3_name: 'Дом 3 (+10 мест)',
        shop_house4_name: 'Дом 4 (+15 мест)',
        shop_upgrades_title: 'Улучшения',
        shop_upgrade_sheep_lvl: 'Улучшить Овцу (Ур. {level})',
        shop_upgrade_cow_lvl: 'Улучшить Корову (Ур. {level})',
        shop_upgrade_chicken_lvl: 'Улучшить Курицу (Ур. {level})',
        shop_upgrade_autofarm_lvl: 'Авто-Фарм (Ур. {level})',
        shop_upgrade_clickfarm_lvl: 'Клик-Фарм (Ур. {level})',
        shop_buy_title: 'Купить',
        shop_buy_hammer: 'Купить Молот',
        shop_buy_cow: 'Купить Корову',
        shop_buy_sheep: 'Купить Овцу',
        shop_buy_chicken: 'Купить Курицу',
        shop_buy_grass_seed: 'Семена травы (x10)',
        shop_buy_hay_seed: 'Семена сена (x10)',
        shop_buy_wood: 'Купить Дерево',
        shop_buy_brick: 'Купить Кирпич',
        shop_sell_title: 'Продать',
        shop_sell_milk: 'Продать Молоко',
        shop_sell_wool: 'Продать Шерсть',
        shop_sell_skin: 'Продать Шкуру',
        shop_sell_egg: 'Продать Яйцо',
        shop_sell_all: 'Продать Всё',
        game_over_title: 'ИГРА ОКОНЧЕНА',
        game_over_subtitle: 'Всех ваших животных украли!',
        game_over_restart: 'Начать заново',
        settings_title: 'Настройки',
        settings_sound: 'Звук',
        settings_music: 'Музыка',
        settings_language: 'Язык',
        settings_close: 'Закрыть',
        on: 'ВКЛ',
        off: 'ВЫКЛ',
        grandfather_dialogue: 'Ну здравствуй, молодой! Купил землю... с одной курицей?! Ха-ха, фермер от бога!\nСмотри в оба — твари тут свирепые. Загляни в магазин, а то долго не протянешь.',
        dialogue_continue: 'Продолжить',
        no_seeds: 'Нечего сажать, загляни в магазин'
    },
    'eng': {
        loading: 'LOADING',
        shop_house_title: 'House',
        shop_house1_name: 'House 1 (+5 capacity)',
        shop_house2_name: 'House 2 (+7 capacity)',
        shop_house3_name: 'House 3 (+10 capacity)',
        shop_house4_name: 'House 4 (+15 capacity)',
        shop_upgrades_title: 'Upgrades',
        shop_upgrade_sheep_lvl: 'Upgrade Sheep (Lvl {level})',
        shop_upgrade_cow_lvl: 'Upgrade Cow (Lvl {level})',
        shop_upgrade_chicken_lvl: 'Upgrade Chicken (Lvl {level})',
        shop_upgrade_autofarm_lvl: 'Auto-Farm (Lvl {level})',
        shop_upgrade_clickfarm_lvl: 'Click-Farm (Lvl {level})',
        shop_buy_title: 'Buy',
        shop_buy_hammer: 'Buy Hammer',
        shop_buy_cow: 'Buy Cow',
        shop_buy_sheep: 'Buy Sheep',
        shop_buy_chicken: 'Buy Chicken',
        shop_buy_grass_seed: 'Grass Seeds (x10)',
        shop_buy_hay_seed: 'Hay Seeds (x10)',
        shop_buy_wood: 'Buy Wood',
        shop_buy_brick: 'Buy Brick',
        shop_sell_title: 'Sell',
        shop_sell_milk: 'Sell Milk',
        shop_sell_wool: 'Sell Wool',
        shop_sell_skin: 'Sell Skin',
        shop_sell_egg: 'Sell Egg',
        shop_sell_all: 'Sell All',
        game_over_title: 'GAME OVER',
        game_over_subtitle: 'All your animals have been stolen!',
        game_over_restart: 'Restart',
        settings_title: 'Settings',
        settings_sound: 'Sound',
        settings_music: 'Music',
        settings_language: 'Language',
        settings_close: 'Close',
        on: 'ON',
        off: 'OFF',
        grandfather_dialogue: "Well hello, young one! Bought some land... with a single chicken?! Ha-ha, a natural farmer!\nWatch your back - the beasts here are fierce. Visit the shop, or you won't last long.",
        dialogue_continue: 'Continue',
        no_seeds: 'Nothing to plant, check the shop'
    }
};

function typewriterEffect(element, text, callback) {
    let i = 0;
    element.innerHTML = "";
    const interval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 50);
}


function translateUI() {
    const lang = translations[currentLanguage];
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.dataset.translateKey;
        if (lang[key] && !el.closest('.shop-item') && el.id !== 'dialogue-text') {
            el.childNodes[0].nodeValue = lang[key];
        }
    });
    
    soundToggleButton.textContent = lang[isSoundMuted ? 'off' : 'on'];
    musicToggleButton.textContent = lang[isMusicMuted ? 'off' : 'on'];
    languageToggleButton.textContent = currentLanguage.toUpperCase();
    
    if (!shopMenu.classList.contains('hidden')) {
        updateShopUI();
    }
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function isPointInRect(x, y, rect) { return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height; }
function isPointBlocked(px, py) { 
    if (!GAME_DIMENSIONS) return true;
    const nx = px / GAME_DIMENSIONS.width; 
    const ny = py / GAME_DIMENSIONS.height; 
    return OBSTACLES.some(r => isPointInRect(nx, ny, r)); 
}
function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }
function playSound(soundElement) { if (soundElement && !isSoundMuted) { soundElement.currentTime = 0; soundElement.play().catch(e => {}); } }
function updateResourceCounters() {
    woolAmountSpan.textContent = woolCount;
    skinAmountSpan.textContent = skinCount;
    eggAmountSpan.textContent = eggCount;
    milkAmountSpan.textContent = milkCount;
    goldAmountSpan.textContent = Math.floor(goldCount);
    grassSeedAmountSpan.textContent = grassSeedCount;
    haySeedAmountSpan.textContent = haySeedCount;
}

function showPlayerMessage(messageKey) {
    playerMessage.textContent = translations[currentLanguage][messageKey];
    playerMessage.classList.add('show');
    setTimeout(() => {
        playerMessage.classList.remove('show');
    }, 2000);
}

// --- МЕХАНИКА ИГРЫ ---
function spawnGrass(px, py) { 
    if(grassSeedCount <= 0) { 
        showPlayerMessage('no_seeds'); 
        return; 
    } 
    grassSeedCount--; 
    updateResourceCounters(); 
    playSound(plantSound); 
    const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; 
    if (py <= walkableTop || isPointBlocked(px, py)) return; 
    const patchX = clamp(px - 12.5, 0, GAME_DIMENSIONS.width - 25); 
    const patchY = clamp(py - 12.5, walkableTop, GAME_DIMENSIONS.height - 25); 
    const patchElement = document.createElement('img'); 
    patchElement.className = 'grass-patch'; 
    patchElement.src = 'images/grass/grass.png'; 
    patchElement.style.transform = `translate(${patchX}px, ${patchY}px)`; 
    grassLayer.appendChild(patchElement); 
    grassPatches.push({ x: patchX, y: patchY, element: patchElement }); 
    [...sheep].forEach(animal => animal.decideNextAction()); 
}
function spawnHay(px, py) { 
    if(haySeedCount <= 0) { 
        showPlayerMessage('no_seeds'); 
        return; 
    } 
    haySeedCount--; 
    updateResourceCounters(); 
    playSound(plantSound); 
    const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; 
    if (py <= walkableTop || isPointBlocked(px, py)) return; 
    const patchX = clamp(px - 10, 0, GAME_DIMENSIONS.width - 20); 
    const patchY = clamp(py - 10, walkableTop, GAME_DIMENSIONS.height - 20); 
    hayPatches.push(new Hay(patchX, patchY)); 
    [...cows].forEach(cow => cow.decideNextAction()); 
}
function spawnWool(px, py, amount = 1) { woolCount += amount; updateResourceCounters(); const el = document.createElement('img'); el.src = 'images/wool/wool.png'; el.className = 'wool-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'wool-counter'); }
function spawnSkin(px, py) { skinCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = 'images/skin/skin.png'; el.className = 'skin-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'skin-counter'); }
function spawnEgg(px, py) { eggCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = EGG_ICON_SRC; el.className = 'egg-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'egg-counter'); }
function spawnMilk(px, py) { milkCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = MILK_ICON_SRC; el.className = 'milk-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'milk-counter'); }
function spawnWolf() { if (isPaused || isDialogueActive) return; if (Math.random() < wolfSpawnChance) { wolves.push(new Wolf()); } }
function spawnFlyingCoin(startX, startY) { const coin = document.createElement('img'); coin.src = GOLD_ICON_SRC; coin.className = 'flying-coin'; coin.style.transform = `translate(${startX}px, ${startY}px)`; coin.style.visibility = 'visible'; gameWorld.appendChild(coin); animateResourceToUI(coin, 'gold-counter'); }
function animateResourceToUI(element, targetCounterId) { const targetCounter = document.getElementById(targetCounterId); if (!targetCounter) { element.remove(); return; } const gameWorldRect = gameWorld.getBoundingClientRect(); const endRect = targetCounter.getBoundingClientRect(); const endX = endRect.left - gameWorldRect.left + (endRect.width / 2); const endY = endRect.top - gameWorldRect.top + (endRect.height / 2); requestAnimationFrame(() => { element.style.transform = `translate(${endX}px, ${endY}px) scale(0.5)`; element.style.opacity = '0.5'; }); setTimeout(() => { element.remove(); }, 1000); }

// --- УПРАВЛЕНИЕ МУЗЫКОЙ И ФОНОМ ---
function updateMusicState() {
    if (isMusicMuted || !isMusicStarted) {
        backgroundMelody.pause();
        daySound.pause();
        nightSong.pause();
        return;
    }
    backgroundMelody.play().catch(e => {});
    if (currentStageIndex === 4) { daySound.pause(); nightSong.play().catch(e => {}); } 
    else { nightSong.pause(); daySound.play().catch(e => {}); }
}

function updateBackground(frameIndex) { 
    updateMusicState(); 
    const nextImageSrc = LOCATION_FRAMES[frameIndex]; 
    const img = new Image(); 
    img.onload = function() { hiddenBgLayer.style.backgroundImage = `url('${nextImageSrc}')`; activeBgLayer.style.opacity = 0; hiddenBgLayer.style.opacity = 1; [activeBgLayer, hiddenBgLayer] = [hiddenBgLayer, activeBgLayer]; }; 
    img.src = nextImageSrc; 
    
    const isNight = frameIndex === 4;
    clouds.forEach(cloud => cloud.element.classList.toggle('night', isNight));

    if (frameIndex === 3) { // Животные выходят на 4-й день
        [...sheep, ...chickens, ...cows].forEach(animal => {
            if (animal.isHiding) {
                animal.isHiding = false;
                animal.element.style.visibility = 'visible';
                animal.findNewTarget();
            }
        });
    }
    
    let baseChance = WOLF_BASE_SPAWN_CHANCE;
    if (isNight) {
        let nightNumber = frameIndex - 3;
        baseChance *= (1 + nightNumber * 0.1);
    }
    wolfSpawnChance = baseChance;
}

function runNextStage() { 
    if (isPaused || isDialogueActive) { setTimeout(runNextStage, 100); return; }
    if (currentStageIndex >= CYCLE_STAGES.length) { cycleDirection = -1; currentStageIndex = CYCLE_STAGES.length - 2; } 
    if (currentStageIndex < 0) { cycleDirection = 1; currentStageIndex = 1; } 
    const stage = CYCLE_STAGES[currentStageIndex]; 
    updateBackground(stage.frameIndex); 
    currentStageIndex += cycleDirection; 
    setTimeout(runNextStage, stage.duration); 
}

// --- ЛОГИКА МАГАЗИНА ---
function updateShopUI() {
    if (shopMenu.classList.contains('hidden')) return;
    
    const lang = translations[currentLanguage];
    document.getElementById('shop-gold').textContent = Math.floor(goldCount);
    document.getElementById('shop-wood').textContent = woodCount;
    document.getElementById('shop-brick').textContent = brickCount;
    
    document.querySelectorAll('.shop-item .item-name').forEach(el => {
        const key = el.dataset.translateKey;
        if(key && lang[key]) el.textContent = lang[key];
    });

    const capacityInfo = document.getElementById('animal-capacity-info');
    if (capacityInfo) capacityInfo.textContent = `${sheep.length + chickens.length + cows.length}/${maxAnimals}`;

    const upgradeSheepButton = document.getElementById('upgrade-sheep-button');
    upgradeSheepButton.dataset.costGold = 150 * Math.pow(2, sheepLevel - 1);
    upgradeSheepButton.querySelector('.item-name').textContent = lang.shop_upgrade_sheep_lvl.replace('{level}', sheepLevel + 1);
    upgradeSheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeSheepButton.dataset.costGold}`;

    const upgradeCowButton = document.getElementById('upgrade-cow-button');
    upgradeCowButton.dataset.costGold = 250 * Math.pow(2, cowLevel - 1);
    upgradeCowButton.querySelector('.item-name').textContent = lang.shop_upgrade_cow_lvl.replace('{level}', cowLevel + 1);
    upgradeCowButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeCowButton.dataset.costGold}`;
    
    const upgradeChickenButton = document.getElementById('upgrade-chicken-button');
    upgradeChickenButton.dataset.costGold = 100 * Math.pow(2, chickenLevel - 1);
    upgradeChickenButton.querySelector('.item-name').textContent = lang.shop_upgrade_chicken_lvl.replace('{level}', chickenLevel + 1);
    upgradeChickenButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeChickenButton.dataset.costGold}`;
    
    const buyCowButton = document.getElementById('buy-cow-button');
    buyCowButton.dataset.costGold = Math.ceil(200 * Math.pow(1.5, cows.length));
    buyCowButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buyCowButton.dataset.costGold}`;

    const buySheepButton = document.getElementById('buy-sheep-button');
    buySheepButton.dataset.costGold = Math.ceil(50 * Math.pow(1.5, sheep.length));
    buySheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buySheepButton.dataset.costGold}`;

    const buyChickenButton = document.getElementById('buy-chicken-button');
    buyChickenButton.dataset.costGold = Math.ceil(25 * Math.pow(1.5, chickens.length));
    buyChickenButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buyChickenButton.dataset.costGold}`;

    const autoFarmButton = document.getElementById('upgrade-autofarm-button');
    const clickFarmButton = document.getElementById('upgrade-clickfarm-button');

    if(currentHouse) {
        autoFarmButton.classList.remove('hidden');
        clickFarmButton.classList.remove('hidden');
        
        autoFarmButton.dataset.costGold = Math.ceil(100 * Math.pow(2.2, currentHouse.autoFarmLevel - 1));
        autoFarmButton.querySelector('.item-name').textContent = lang.shop_upgrade_autofarm_lvl.replace('{level}', currentHouse.autoFarmLevel + 1);
        autoFarmButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${autoFarmButton.dataset.costGold}`;

        clickFarmButton.dataset.costGold = Math.ceil(50 * Math.pow(1.8, currentHouse.clickFarmLevel - 1));
        clickFarmButton.querySelector('.item-name').textContent = lang.shop_upgrade_clickfarm_lvl.replace('{level}', currentHouse.clickFarmLevel + 1);
        clickFarmButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${clickFarmButton.dataset.costGold}`;
    } else {
        autoFarmButton.classList.add('hidden');
        clickFarmButton.classList.add('hidden');
    }
}


function handleShopTransaction(event) {
    const button = event.target.closest('.shop-item');
    if (!button) return;

    const item = button.dataset.item;
    const costGold = parseInt(button.dataset.costGold) || 0;
    const costWood = parseInt(button.dataset.costWood) || 0;
    const costBrick = parseInt(button.dataset.costBrick) || 0;
    const capacity = parseInt(button.dataset.capacity) || 0;
    const valueGold = parseInt(button.dataset.valueGold) || 0;

    let purchaseSuccess = false;
    const totalAnimals = sheep.length + chickens.length + cows.length;

    if (item === 'upgrade_sheep') { if (goldCount >= costGold) { goldCount -= costGold; sheepLevel++; woolPerSheep++; purchaseSuccess = true; }
    } else if (item === 'upgrade_cow') { if (goldCount >= costGold) { goldCount -= costGold; cowLevel++; purchaseSuccess = true; }
    } else if (item === 'upgrade_chicken') { if (goldCount >= costGold) { goldCount -= costGold; chickenLevel++; eggChance = CHICKEN_BASE_EGG_CHANCE * (1 + chickenLevel * 0.2); purchaseSuccess = true; }
    } else if (item === 'upgrade_autofarm') { if (currentHouse && goldCount >= costGold) { goldCount -= costGold; currentHouse.autoFarmLevel++; currentHouse.updateFarmRates(); purchaseSuccess = true; }
    } else if (item === 'upgrade_clickfarm') { if (currentHouse && goldCount >= costGold) { goldCount -= costGold; currentHouse.clickFarmLevel++; currentHouse.updateFarmRates(); purchaseSuccess = true; }
    } else if (item === 'buy_cow') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; cows.push(new Cow()); purchaseSuccess = true; }
    } else if (item === 'buy_sheep') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; sheep.push(new Sheep()); purchaseSuccess = true; }
    } else if (item === 'buy_chicken') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; chickens.push(new Chicken()); purchaseSuccess = true; }
    } else if (item.startsWith('house')) { if (goldCount >= costGold && woodCount >= costWood && brickCount >= costBrick) { 
        const oldAutoFarmLvl = currentHouse ? currentHouse.autoFarmLevel : 1;
        const oldClickFarmLvl = currentHouse ? currentHouse.clickFarmLevel : 1;
        goldCount -= costGold; woodCount -= costWood; brickCount -= costBrick; 
        if (currentHouse) currentHouse.destroy(); 
        currentHouse = new House(item, capacity, oldAutoFarmLvl, oldClickFarmLvl); 
        purchaseSuccess = true; 
    }
    } else if (item === 'buy_wood') { if (goldCount >= costGold) { goldCount -= costGold; woodCount++; purchaseSuccess = true; }
    } else if (item === 'buy_brick') { if (goldCount >= costGold) { goldCount -= costGold; brickCount++; purchaseSuccess = true; }
    } else if (item === 'buy_grass_seed') { if (goldCount >= costGold) { goldCount -= costGold; grassSeedCount += 10; purchaseSuccess = true; }
    } else if (item === 'buy_hay_seed') { if (goldCount >= costGold) { goldCount -= costGold; haySeedCount += 10; purchaseSuccess = true; }
    } else if (item === 'buy_hammer') { if (goldCount >= costGold && !hasRepairHammer) { goldCount -= costGold; hasRepairHammer = true; repairButton.classList.remove('hidden'); purchaseSuccess = true; }
    } else if (item === 'sell_milk' && milkCount > 0) { goldCount += milkCount * valueGold; milkCount = 0; purchaseSuccess = true; 
    } else if (item === 'sell_wool' && woolCount > 0) { goldCount += woolCount * valueGold; woolCount = 0; purchaseSuccess = true; 
    } else if (item === 'sell_skin' && skinCount > 0) { goldCount += skinCount * valueGold; skinCount = 0; purchaseSuccess = true; 
    } else if (item === 'sell_egg' && eggCount > 0) { goldCount += eggCount * valueGold; eggCount = 0; purchaseSuccess = true; 
    } else if (item === 'sell_all') { let totalGain = (milkCount * 15) + (woolCount * 7) + (skinCount * 10) + (eggCount * 3); if (totalGain > 0) { goldCount += totalGain; milkCount = 0; woolCount = 0; skinCount = 0; eggCount = 0; purchaseSuccess = true; } }

    button.classList.add(purchaseSuccess ? 'purchase-success' : 'purchase-fail');
    setTimeout(() => { button.classList.remove('purchase-success', 'purchase-fail'); }, 500);

    updateResourceCounters();
    updateShopUI();
}

function gameOver() { isPaused = true; gameOverScreen.classList.remove('hidden'); }

// --- ИНИЦИАЛИЗАЦИЯ И ЗАПУСК ---
function startGame() {
    isDialogueActive = false;
    grandfatherDialogue.classList.add('hidden');
    
    let lastTime = 0;
    function gameLoop(currentTime) { 
        if (isPaused || isDialogueActive) { lastTime = currentTime; requestAnimationFrame(gameLoop); return; }
        if (lastTime === 0) lastTime = currentTime; 
        const deltaTime = (currentTime - lastTime) / 1000; 
        lastTime = currentTime; 
        clouds.forEach(c => c.update(deltaTime));
        [...sheep, ...chickens, ...cows, ...wolves].forEach(o => o.update(deltaTime)); 
        
        if (currentHouse) {
            goldCount += currentHouse.autoFarmRate * deltaTime;
            updateResourceCounters();
        }
        requestAnimationFrame(gameLoop); 
    }
    requestAnimationFrame(gameLoop);
    runNextStage();
    
    gameWorld.addEventListener('pointerdown', (event) => {
        if (!isMusicStarted) { 
            isMusicStarted = true; 
            updateMusicState();
        }
        const x = event.clientX - GAME_DIMENSIONS.left;
        const y = event.clientY - GAME_DIMENSIONS.top;
        if (currentTool === 'grass') spawnGrass(x, y); 
        else if (currentTool === 'hay') spawnHay(x,y);
        else if (currentTool === 'repair' && currentHouse) {
            const houseRect = currentHouse.element.getBoundingClientRect();
            if (event.clientX >= houseRect.left && event.clientX <= houseRect.right &&
                event.clientY >= houseRect.top && event.clientY <= houseRect.bottom) {
                currentHouse.repair();
                hasRepairHammer = false;
                repairButton.classList.add('hidden');
                grassButton.click(); // Switch to a default tool
            }
        }
    });

    setInterval(() => { if (!isPaused && sheep.length > 0) playSound(sheepSound); }, 7000 + Math.random() * 8000);
    setInterval(() => { if (!isPaused && chickens.length > 0) playSound(chickenAmbientSound); }, 5000 + Math.random() * 6000);
    setInterval(() => { if (!isPaused && cows.length > 0) playSound(cowAmbientSound); }, 8000 + Math.random() * 7000);
    setInterval(spawnWolf, 1000);
}


function initializeGame() {
    gameContainer.style.display = 'flex';
    loadingScreen.style.display = 'none';
    
    GAME_DIMENSIONS = gameWorld.getBoundingClientRect();
    if (GAME_DIMENSIONS.width === 0) { console.error("Не удалось определить размеры игрового мира."); return; }

    updateResourceCounters();
    settingsButton.style.backgroundImage = `url('${SETTINGS_ICON_SRC}')`;
    grassButton.style.backgroundImage = `url('${GRASS_ICON_SRC}')`;
    hayButton.style.backgroundImage = `url('${HAY_SPRITES[0]}')`;
    repairButton.style.backgroundImage = `url('${REPAIR_ICON_SRC}')`;
    menuToggleButton.style.backgroundImage = `url('${INVENTORY_ICON_SRC}')`;
    resourcesToggleButton.style.backgroundImage = `url('${CALCULATOR_ICON_SRC}')`;
    document.body.style.cursor = `url('${GRASS_ICON_SRC}'), auto`;

    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < STARTING_CHICKENS; i++) { chickens.push(new Chicken()); }
    
    translateUI();
    
    isDialogueActive = true;
    grandfatherDialogue.classList.remove('hidden');
    typewriterEffect(dialogueText, translations[currentLanguage].grandfather_dialogue, () => {
        dialogueContinueButton.classList.remove('hidden');
    });
    
    const toolButtons = {
        'grass': grassButton,
        'hay': hayButton,
        'repair': repairButton
    };

    function setActiveTool(toolName) {
        currentTool = toolName;
        const cursorUrl = toolName === 'grass' ? GRASS_ICON_SRC : toolName === 'hay' ? HAY_SPRITES[0] : REPAIR_ICON_SRC;
        document.body.style.cursor = `url('${cursorUrl}'), auto`;
        Object.values(toolButtons).forEach(btn => btn.classList.remove('active'));
        if (toolButtons[toolName]) toolButtons[toolName].classList.add('active');
    }

    grassButton.addEventListener('click', () => setActiveTool('grass'));
    hayButton.addEventListener('click', () => setActiveTool('hay'));
    repairButton.addEventListener('click', () => { if (hasRepairHammer) setActiveTool('repair'); });

    shopButton.addEventListener('click', () => { 
        if (isDialogueActive) return;
        isPaused = true; 
        updateShopUI(); 
        shopMenu.classList.remove('hidden'); 
    });
    closeShopButton.addEventListener('click', () => { isPaused = false; shopMenu.classList.add('hidden'); });
    shopMenu.addEventListener('click', (e) => {
        if(e.target.classList.contains('shop-section-toggle')) {
            e.target.parentElement.classList.toggle('open');
        } else {
            handleShopTransaction(e);
        }
    });
    restartButton.addEventListener('click', () => { location.reload(); });
    menuToggleButton.addEventListener('click', () => { mainActionsContainer.classList.toggle('open'); });
    resourcesToggleButton.addEventListener('click', () => { document.getElementById('resources-panel-container').classList.toggle('open'); });
    
    settingsButton.addEventListener('click', () => { 
        if (isDialogueActive) return;
        isPaused = true; 
        settingsMenu.classList.remove('hidden'); 
    });
    closeSettingsButton.addEventListener('click', () => { isPaused = false; settingsMenu.classList.add('hidden'); });
    soundToggleButton.addEventListener('click', () => { isSoundMuted = !isSoundMuted; translateUI(); });
    musicToggleButton.addEventListener('click', () => { isMusicMuted = !isMusicMuted; updateMusicState(); translateUI(); });
    languageToggleButton.addEventListener('click', () => { currentLanguage = currentLanguage === 'rus' ? 'eng' : 'rus'; translateUI(); });

    dialogueContinueButton.addEventListener('click', startGame, { once: true });
}

function preloadAssets() {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_LOAD.length;
    if (totalAssets === 0) { initializeGame(); return; }
    function assetLoaded() {
        loadedCount++;
        const progress = (loadedCount / totalAssets) * 100;
        progressBar.style.width = `${progress}%`;
        if (loadedCount === totalAssets) { setTimeout(initializeGame, 500); }
    }
    ASSETS_TO_LOAD.forEach(src => {
        const img = new Image();
        img.onload = assetLoaded;
        img.onerror = () => { console.error(`Не удалось загрузить: ${src}`); assetLoaded(); };
        img.src = src;
    });
}

window.addEventListener('load', () => {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        let now = new Date().getTime();
        if (now - lastTouchEnd <= 300) { event.preventDefault(); }
        lastTouchEnd = now;
    }, false);
    if (gameWorld) { preloadAssets(); } 
    else { console.error('Критическая ошибка: элемент #game-world не найден!'); }
});


