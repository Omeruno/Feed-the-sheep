// --- НАСТРОЙКИ ИГРЫ ---
const STARTING_CHICKENS = 1;
const NUM_CLOUDS = 4;
const SHEEP_SPEED = 40;
const CHICKEN_SPEED = 45;
const COW_SPEED = 35;
const PIG_SPEED = 38;
const MIN_WAIT_TIME = 2000;
const MAX_WAIT_TIME = 5000;
const EAT_RADIUS = 20;
const WALKABLE_TOP_RATIO = 0.55;
const EAT_ANIMATION_DURATION = 500;
const HOUSE_BASE_HEALTH = 100;
const BASE_ANIMAL_CAPACITY = 3;
const CHICKEN_BASE_EGG_CHANCE = 0.1;
const TROUGH_BASE_CAPACITY = 100;
const PIG_EAT_AMOUNT = 25;
const PIG_BASE_MEAT_CHANCE = 0.4;

// --- НАСТРОЙКИ ВРАГОВ ---
const WOLF_SPEED = 55;
const FOX_SPEED = 60;
const BEAR_SPEED = 30;
const BEAR_HEALTH = 6;
const BEAR_DAMAGE = 25;


// --- НАСТРОЙКИ ВРЕМЕНИ СУТОК ---
const CYCLE_STAGES = [
    { name: "Day 1", frameIndex: 0, duration: 120000, isNight: false },
    { name: "Day 2", frameIndex: 1, duration: 60000, isNight: false },
    { name: "Day 3", frameIndex: 2, duration: 60000, isNight: false },
    { name: "Day 4", frameIndex: 3, duration: 60000, isNight: false },
    { name: "Day 5", frameIndex: 4, duration: 36000, isNight: true },
    { name: "Day 6", frameIndex: 5, duration: 36000, isNight: true },
    { name: "Day 7", frameIndex: 6, duration: 36000, isNight: true },
    { name: "Day 8", frameIndex: 7, duration: 72000, isNight: true }
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
const foxSound = document.getElementById('fox-sound');
const chickenAmbientSound = document.getElementById('chicken-ambient-sound');
const cowAmbientSound = document.getElementById('cow-ambient-sound');
const clickSound = document.getElementById('click-sound');
const bearSound = document.getElementById('bear-sound');
const bearAttackSound = document.getElementById('bear-attack-sound');
const bearDamageSound = document.getElementById('bear-damage-sound');
const damageHouseSound = document.getElementById('damage-house-sound');

const woolAmountSpan = document.getElementById('wool-amount');
const skinAmountSpan = document.getElementById('skin-amount');
const eggAmountSpan = document.getElementById('egg-amount');
const milkAmountSpan = document.getElementById('milk-amount');
const meatAmountSpan = document.getElementById('meat-amount');
const foxSkinAmountSpan = document.getElementById('fox-skin-amount');
const bearSkinAmountSpan = document.getElementById('bear-skin-amount');
const goldAmountSpan = document.getElementById('gold-amount');
const grassSeedAmountSpan = document.getElementById('grass-seed-amount');
const haySeedAmountSpan = document.getElementById('hay-seed-amount');
const pigFoodAmountSpan = document.getElementById('pig-food-amount');
const woodAmountSpan = document.getElementById('wood-amount');
const brickAmountSpan = document.getElementById('brick-amount');

const grassButton = document.getElementById('grass-button');
const hayButton = document.getElementById('hay-button');
const troughButton = document.getElementById('trough-button');
const piggyFoodButton = document.getElementById('piggy-food-button');
const shopButton = document.getElementById('shop-button');
const repairButton = document.getElementById('repair-button');
const sawmillButton = document.getElementById('sawmill-button');
const rockButton = document.getElementById('rock-button');

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
const godButton = document.getElementById('god-button');


// --- ИГРОВЫЕ РЕСУРСЫ ---
const sheepSprites = { front: 'images/sheep/sheep_front.png', back: 'images/sheep/sheep_back.png', left: 'images/sheep/sheep_left.png', right: 'images/sheep/sheep_right.png', eat: 'images/sheep/sheep_eat.png' };
const wolfSprites = { front: 'images/wolf/wolf_front.png', back: 'images/wolf/wolf_back.png', left: 'images/wolf/wolf_left.png', right: 'images/wolf/wolf_right.png', attack: 'images/wolf/wolf_atack.png' };
const foxSprites = { left: 'images/fox/fox_left.png', right: 'images/fox/fox_right.png', attack: 'images/fox/fox_attack.png', up: 'images/fox/fox_up.png' };
const bearSprites = { left: 'images/bear/bear_left.png', right: 'images/bear/bear_right.png', attack: 'images/bear/bear_attack.png', damage: 'images/bear/bear_damage.png'};
const chickenSprites = { front: 'images/chicken/chicken_top.png', back: 'images/chicken/chicken_back.png', left: 'images/chicken/chicken_left.png', right: 'images/chicken/chicken_right.png', eat: 'images/chicken/chicken_eat.png' };
const cowSprites = { front: 'images/cow/cow_top.png', back: 'images/cow/cow_back.png', left: 'images/cow/cow_left.png', right: 'images/cow/cow_right.png', eat: 'images/cow/cow_eat.png' };
const pigSprites = { front: 'images/pig/pig_top.png', back: 'images/pig/pig_back.png', left: 'images/pig/pig_left.png', right: 'images/pig/pig_right.png', eat: 'images/pig/pig_eat.png' };
const troughSprites = { empty: 'images/pig/trough_topN.png', full: 'images/pig/trough_topY.png' };
const CLOUD_SPRITES = ['images/clouds/cloud_1.png', 'images/clouds/cloud_2.png', 'images/clouds/cloud_3.png', 'images/clouds/cloud_4.png'];
const LOCATION_FRAMES = [ 'images/location/day_1.png','images/location/day_2.png','images/location/day_3.png','images/location/day_4.png','images/location/day_5.png','images/location/day_6.png','images/location/day_7.png','images/location/day_8.png' ];
const HOUSE_SPRITES = { house_1: 'images/house/house_1.png', house_2: 'images/house/house_2.png', house_3: 'images/house/house_3.png', house_4: 'images/house/house_4.png' };
const HAY_SPRITES = ['images/icons/rostock_small.png', 'images/icons/rostock_sredny.png', 'images/icons/rostock_ready.png'];
const SAWMILL_SPRITES = ['images/sawmill/sawmill_1.png', 'images/sawmill/sawmill_2.png', 'images/sawmill/sawmill_3.png', 'images/sawmill/sawmill_4.png'];
const ROCK_SPRITES = ['images/rock/rock_1.png', 'images/rock/rock_2.png', 'images/rock/rock_3.png', 'images/rock/rock_4.png'];

const MILK_ICON_SRC = 'images/icons/milk.png';
const GRASS_ICON_SRC = 'images/icons/grass_icon.png';
const REPAIR_ICON_SRC = 'images/icons/repair_icon.png';
const INVENTORY_ICON_SRC = 'images/icons/inventory_icon.png';
const EGG_ICON_SRC = 'images/chicken/egg.png';
const MEAT_ICON_SRC = 'images/pig/meat.png';
const PIGGY_FOOD_ICON_SRC = 'images/pig/piggy_food.png';
const TROUGH_ICON_SRC = 'images/pig/trough_topN.png';
const FOX_SKIN_SRC = 'images/fox/fox_skin.png';
const BEAR_SKIN_SRC = 'images/bear/bear_skin.png';
const CALCULATOR_ICON_SRC = 'images/icons/calculator_icon.png';
const GOLD_ICON_SRC = 'images/gold/gold.png';
const WOOD_ICON_SRC = 'images/tree/tree.png';
const BRICK_ICON_SRC = 'images/brick/brick.png';
const SETTINGS_ICON_SRC = 'images/icons/settings.png';
const GRANDFATHER_SRC = 'images/grandfather/grandfather.png';
const SAWMILL_ICON_SRC = 'images/sawmill/sawmill_1.png';
const ROCK_ICON_SRC = 'images/rock/rock_1.png';

// --- КОНФИГУРАЦИЯ ПОСТРОЕК (ПЕРЕМЕЩЕНО СЮДА) ---
const sawmillConfig = {
    type: 'sawmill',
    width: 100,
    height: 80,
    sprites: SAWMILL_SPRITES,
    requiredHouseLevel: 1,
    messageKey: 'need_house_lvl_1',
    resourceIcon: WOOD_ICON_SRC,
    resourceCounterId: 'wood-counter',
    addResource: (amount) => { woodCount += amount; }
};

const rockConfig = {
    type: 'rock',
    width: 80,
    height: 60,
    sprites: ROCK_SPRITES,
    requiredHouseLevel: 3,
    messageKey: 'need_house_lvl_3',
    resourceIcon: BRICK_ICON_SRC,
    resourceCounterId: 'brick-counter',
    addResource: (amount) => { brickCount += amount; }
};


// --- МАССИВ РЕСУРСОВ ДЛЯ ПРЕДЗАГРУЗКИ ---
const ASSETS_TO_LOAD = [
    ...Object.values(sheepSprites), ...Object.values(wolfSprites), ...Object.values(chickenSprites), ...Object.values(cowSprites), ...Object.values(pigSprites), ...Object.values(troughSprites), ...Object.values(foxSprites), ...Object.values(bearSprites),
    ...CLOUD_SPRITES, ...LOCATION_FRAMES, ...Object.values(HOUSE_SPRITES), ...HAY_SPRITES, ...SAWMILL_SPRITES, ...ROCK_SPRITES,
    'images/grass/grass.png', 'images/ground/ground.png', 'images/wool/wool.png', 'images/skin/skin.png', EGG_ICON_SRC, MILK_ICON_SRC, MEAT_ICON_SRC, PIGGY_FOOD_ICON_SRC, FOX_SKIN_SRC, BEAR_SKIN_SRC,
    'images/shop/shop.png', 'images/shop/shop_menu.png', GRANDFATHER_SRC,
    GOLD_ICON_SRC, WOOD_ICON_SRC, BRICK_ICON_SRC,
    GRASS_ICON_SRC, REPAIR_ICON_SRC, INVENTORY_ICON_SRC, CALCULATOR_ICON_SRC, SETTINGS_ICON_SRC, TROUGH_ICON_SRC
];

// --- ХРАНИЛИЩЕ ОБЪЕКТОВ И СОСТОЯНИЙ ---
let sheep = [], chickens = [], cows = [], pigs = [], wolves = [], clouds = [], grassPatches = [], hayPatches = [], troughs = [], foxes = [], bears = [];
let currentHouse = null;
let sawmillArea = null, rockArea = null;
let woodCount = 10, brickCount = 0;
let woolCount = 0, skinCount = 0, eggCount = 0, milkCount = 0, meatCount = 0, goldCount = 500, grassSeedCount = 0, haySeedCount = 0, pigFoodCount = 0, troughToPlace = 0, foxSkinCount = 0, bearSkinCount = 0;
let sawmillToPlace = 0, rockToPlace = 0;

let activeBgLayer = bg1, hiddenBgLayer = bg2;
let currentStageIndex = 0, cycleDirection = 1;
let isMusicStarted = false, isPaused = false, isDialogueActive = false;
let currentTool = null;
let GAME_DIMENSIONS = null;
let sheepLevel = 1, chickenLevel = 1, cowLevel = 1, pigLevel = 1, troughLevel = 1, woolPerSheep = 1, eggChance = CHICKEN_BASE_EGG_CHANCE;
let maxAnimals = BASE_ANIMAL_CAPACITY;
let hasRepairHammer = false;

let isPlacing = null; // 'trough', 'sawmill', 'rock'
let placementGhost = null;

let uiTargetCoordsCache = {};

// --- НАСТРОЙКИ ---
let isSoundMuted = false, isMusicMuted = false, currentLanguage = 'rus';

// --- ИНИЦИАЛИЗАЦИЯ ГРОМКОСТИ ---
function setInitialVolumes() {
    backgroundMelody.volume = 0.4; daySound.volume = 0.3; nightSong.volume = 0.3; sheepSound.volume = 0.16;
    plantSound.volume = 0.25; eatSound.volume = 0.25; wolfAttackSound.volume = 0.6; wolfDeadSound.volume = 0.6;
    chickenSound.volume = 0.5; chickenAmbientSound.volume = 0.13; cowAmbientSound.volume = 0.16; clickSound.volume = 0.5;
    foxSound.volume = 0.6; bearSound.volume = 0.7; bearAttackSound.volume = 0.7; bearDamageSound.volume = 0.8; damageHouseSound.volume = 0.8;
}
setInitialVolumes();

// --- ПЕРЕВОД ---
const translations = {
    'rus': {
        loading: 'ЗАГРУЗКА', shop_house_title: 'Дом', shop_house1_name: 'Дом 1 (+5 мест)',
        shop_house2_name: 'Дом 2 (+7 мест)', shop_house3_name: 'Дом 3 (+10 мест)', shop_house4_name: 'Дом 4 (+15 мест)',
        shop_upgrades_title: 'Улучшения', shop_upgrade_sawmill_lvl: 'Улучшить Лесопилку (Ур. {level})', shop_upgrade_rock_lvl: 'Улучшить Карьер (Ур. {level})',
        shop_upgrade_sheep_lvl: 'Улучшить Овцу (Ур. {level})', shop_upgrade_cow_lvl: 'Улучшить Корову (Ур. {level})',
        shop_upgrade_chicken_lvl: 'Улучшить Курицу (Ур. {level})', shop_upgrade_pig_lvl: 'Улучшить Свинью (Ур. {level})',
        shop_upgrade_trough_lvl: 'Улучшить Кормушку (Ур. {level})', shop_upgrade_autofarm_lvl: 'Авто-Фарм (Ур. {level})',
        shop_upgrade_clickfarm_lvl: 'Клик-Фарм (Ур. {level})', shop_buy_title: 'Купить', shop_buy_animals: 'Животные',
        shop_buy_food: 'Еда', shop_buy_materials: 'Материалы', shop_buy_hammer: 'Купить Молот',
        shop_buy_pig: 'Купить Свинью', shop_buy_cow: 'Купить Корову', shop_buy_sheep: 'Купить Овцу',
        shop_buy_chicken: 'Купить Курицу', shop_buy_trough: 'Купить Кормушку', shop_buy_piggy_food: 'Еда для свиней (x1)',
        shop_buy_grass_seed: 'Семена травы (x10)', shop_buy_hay_seed: 'Семена сена (x10)',
        shop_buy_sawmill: 'Купить Лесопилку', shop_buy_rock: 'Купить Карьер', shop_buildings_title: 'Сооружения',
        shop_sell_all: 'Продать Всё', game_over_title: 'ИГРА ОКОНЧЕНА', game_over_subtitle: 'Всех ваших животных украли!',
        game_over_restart: 'Начать заново', settings_title: 'Настройки', settings_sound: 'Звук',
        settings_music: 'Музыка', settings_language: 'Язык', settings_close: 'Закрыть', on: 'ВКЛ', off: 'ВЫКЛ',
        grandfather_dialogue: 'Ну здравствуй, молодой! Купил землю... с одной курицей?! Ха-ха, фермер от бога!\nСмотри в оба — твари тут свирепые. Загляни в магазин, а то долго не протянешь.',
        dialogue_continue: 'Продолжить', no_seeds: 'Нечего сажать, загляни в магазин', no_food: 'Нет еды, загляни в магазин',
        cant_place_here: 'Здесь нельзя ставить!', no_item: 'Предмет закончился', need_house_lvl_1: 'Нужно построить дом',
        need_house_lvl_3: 'Нужен дом 3-го уровня'
    },
    'eng': {
        loading: 'LOADING', shop_house_title: 'House', shop_house1_name: 'House 1 (+5 capacity)',
        shop_house2_name: 'House 2 (+7 capacity)', shop_house3_name: 'House 3 (+10 capacity)', shop_house4_name: 'House 4 (+15 capacity)',
        shop_upgrades_title: 'Upgrades', shop_upgrade_sawmill_lvl: 'Upgrade Sawmill (Lvl {level})', shop_upgrade_rock_lvl: 'Upgrade Quarry (Lvl {level})',
        shop_upgrade_sheep_lvl: 'Upgrade Sheep (Lvl {level})', shop_upgrade_cow_lvl: 'Upgrade Cow (Lvl {level})',
        shop_upgrade_chicken_lvl: 'Upgrade Chicken (Lvl {level})', shop_upgrade_pig_lvl: 'Upgrade Pig (Lvl {level})',
        shop_upgrade_trough_lvl: 'Upgrade Trough (Lvl {level})', shop_upgrade_autofarm_lvl: 'Auto-Farm (Lvl {level})',
        shop_upgrade_clickfarm_lvl: 'Click-Farm (Lvl {level})', shop_buy_title: 'Buy', shop_buy_animals: 'Animals',
        shop_buy_food: 'Food', shop_buy_materials: 'Materials', shop_buy_hammer: 'Buy Hammer',
        shop_buy_pig: 'Buy Pig', shop_buy_cow: 'Buy Cow', shop_buy_sheep: 'Buy Sheep',
        shop_buy_chicken: 'Buy Chicken', shop_buy_trough: 'Buy Trough', shop_buy_piggy_food: 'Piggy Food (x1)',
        shop_buy_grass_seed: 'Grass Seeds (x10)', shop_buy_hay_seed: 'Hay Seeds (x10)',
        shop_buy_sawmill: 'Buy Sawmill', shop_buy_rock: 'Buy Quarry', shop_buildings_title: 'Buildings',
        shop_sell_all: 'Sell All', game_over_title: 'GAME OVER', game_over_subtitle: 'All your animals have been stolen!',
        game_over_restart: 'Restart', settings_title: 'Settings', settings_sound: 'Sound',
        settings_music: 'Music', settings_language: 'Language', settings_close: 'Close', on: 'ON', off: 'OFF',
        grandfather_dialogue: "Well hello, young one! Bought some land... with a single chicken?! Ha-ha, a natural farmer!\nWatch your back - the beasts here are fierce. Visit the shop, or you won't last long.",
        dialogue_continue: 'Continue', no_seeds: 'Nothing to plant, check the shop', no_food: 'No food, check the shop',
        cant_place_here: 'Cannot place here!', no_item: 'Item is out of stock', need_house_lvl_1: 'Build a house first',
        need_house_lvl_3: 'Requires House Level 3'
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
        if (lang[key]) {
             if (el.id !== 'dialogue-text') {
                if(el.childNodes.length > 0 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                     el.childNodes[0].nodeValue = lang[key];
                } 
                else if (el.querySelector('span')) {
                     el.querySelector('span').textContent = lang[key];
                }
            }
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
function checkOverlap(rect1, rect2) {
    if (!rect1 || !rect2) return false;
    return !(rect1.x > rect2.x + rect2.width || rect1.x + rect1.width < rect2.x || rect1.y > rect2.y + rect2.height || rect1.y + rect1.height < rect2.y);
}

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
    woolAmountSpan.textContent = woolCount; skinAmountSpan.textContent = skinCount; eggAmountSpan.textContent = eggCount;
    milkAmountSpan.textContent = milkCount; meatAmountSpan.textContent = meatCount; foxSkinAmountSpan.textContent = foxSkinCount;
    bearSkinAmountSpan.textContent = bearSkinCount; goldAmountSpan.textContent = Math.floor(goldCount);
    grassSeedAmountSpan.textContent = grassSeedCount; haySeedAmountSpan.textContent = haySeedCount;
    pigFoodAmountSpan.textContent = pigFoodCount; woodAmountSpan.textContent = woodCount; brickAmountSpan.textContent = brickCount;
}

function showPlayerMessage(messageKey) {
    playerMessage.textContent = translations[currentLanguage][messageKey];
    playerMessage.classList.add('show');
    setTimeout(() => {
        playerMessage.classList.remove('show');
    }, 2000);
}

// --- МЕХАНИКА ИГРЫ ---
function spawnGrass(px, py) { if(grassSeedCount <= 0) { showPlayerMessage('no_seeds'); return; } grassSeedCount--; updateResourceCounters(); updateInventoryButtons(); playSound(plantSound); const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; if (py <= walkableTop || isPointBlocked(px, py)) return; const patchX = clamp(px - 12.5, 0, GAME_DIMENSIONS.width - 25); const patchY = clamp(py - 12.5, walkableTop, GAME_DIMENSIONS.height - 25); const patchElement = document.createElement('img'); patchElement.className = 'grass-patch'; patchElement.src = 'images/grass/grass.png'; patchElement.style.transform = `translate(${patchX}px, ${patchY}px)`; grassLayer.appendChild(patchElement); grassPatches.push({ x: patchX, y: patchY, element: patchElement }); [...sheep].forEach(animal => animal.decideNextAction()); }
function spawnHay(px, py) { if(haySeedCount <= 0) { showPlayerMessage('no_seeds'); return; } haySeedCount--; updateResourceCounters(); updateInventoryButtons(); playSound(plantSound); const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO; if (py <= walkableTop || isPointBlocked(px, py)) return; const patchX = clamp(px - 10, 0, GAME_DIMENSIONS.width - 20); const patchY = clamp(py - 10, walkableTop, GAME_DIMENSIONS.height - 20); hayPatches.push(new Hay(patchX, patchY)); [...cows].forEach(cow => cow.decideNextAction()); }
function spawnWool(px, py, amount = 1) { woolCount += amount; updateResourceCounters(); const el = document.createElement('img'); el.src = 'images/wool/wool.png'; el.className = 'wool-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'wool-counter'); }
function spawnSkin(px, py) { skinCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = 'images/skin/skin.png'; el.className = 'skin-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'skin-counter'); }
function spawnFoxSkin(px, py) { foxSkinCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = FOX_SKIN_SRC; el.className = 'fox-skin-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'fox-skin-counter'); }
function spawnBearSkin(px, py) { bearSkinCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = BEAR_SKIN_SRC; el.className = 'bear-skin-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'bear-skin-counter'); }
function spawnEgg(px, py) { eggCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = EGG_ICON_SRC; el.className = 'egg-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'egg-counter'); }
function spawnMilk(px, py) { milkCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = MILK_ICON_SRC; el.className = 'milk-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'milk-counter'); }
function spawnMeat(px, py) { meatCount++; updateResourceCounters(); const el = document.createElement('img'); el.src = MEAT_ICON_SRC; el.className = 'meat-item'; el.style.transform = `translate(${px}px, ${py}px)`; el.style.visibility = 'visible'; gameWorld.appendChild(el); animateResourceToUI(el, 'meat-counter'); }

function spawnFlyingCoin(startX, startY) { const coin = document.createElement('img'); coin.src = GOLD_ICON_SRC; coin.className = 'flying-coin'; coin.style.transform = `translate(${startX}px, ${startY}px)`; coin.style.visibility = 'visible'; gameWorld.appendChild(coin); animateResourceToUI(coin, 'gold-counter'); }
function animateResourceToUI(element, targetCounterId) {
    let coords = uiTargetCoordsCache[targetCounterId];
    if (!coords) {
        const targetCounter = document.getElementById(targetCounterId);
        if (!targetCounter) { element.remove(); return; }
        const gameWorldRect = gameWorld.getBoundingClientRect();
        const endRect = targetCounter.getBoundingClientRect();
        coords = {
            x: endRect.left - gameWorldRect.left + (endRect.width / 2),
            y: endRect.top - gameWorldRect.top + (endRect.height / 2)
        };
        uiTargetCoordsCache[targetCounterId] = coords;
    }

    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    
    requestAnimationFrame(() => {
        element.style.transform = `translate(${coords.x + offsetX}px, ${coords.y + offsetY}px) scale(0.5)`;
        element.style.opacity = '0.5';
    });
    
    setTimeout(() => {
        element.remove();
    }, 1000);
}

// --- УПРАВЛЕНИЕ МУЗЫКОЙ И ФОНОМ ---
function updateMusicState(isNight) {
    if (isMusicMuted || !isMusicStarted) {
        backgroundMelody.pause(); daySound.pause(); nightSong.pause();
        return;
    }
    backgroundMelody.play().catch(e => {});
    if (isNight) { 
        daySound.pause(); nightSong.play().catch(e => {}); 
    } else { 
        nightSong.pause(); daySound.play().catch(e => {}); 
    }
}

function updateBackground(stage) { 
    updateMusicState(stage.isNight); 
    const nextImageSrc = LOCATION_FRAMES[stage.frameIndex]; 
    const img = new Image(); 
    img.onload = function() { hiddenBgLayer.style.backgroundImage = `url('${nextImageSrc}')`; activeBgLayer.style.opacity = 0; hiddenBgLayer.style.opacity = 1; [activeBgLayer, hiddenBgLayer] = [hiddenBgLayer, activeBgLayer]; }; 
    img.src = nextImageSrc; 
    
    clouds.forEach(cloud => cloud.element.classList.toggle('night', stage.isNight));

    if (!stage.isNight) {
        [...sheep, ...chickens, ...cows, ...pigs].forEach(animal => {
            if (animal.isHiding) {
                animal.isHiding = false;
                animal.element.style.visibility = 'visible';
                animal.findNewTarget();
            }
        });
    }
}

function runNextStage() { 
    if (isPaused || isDialogueActive) { setTimeout(runNextStage, 100); return; }
    if (currentStageIndex >= CYCLE_STAGES.length) { cycleDirection = -1; currentStageIndex = CYCLE_STAGES.length - 2; } 
    if (currentStageIndex < 0) { cycleDirection = 1; currentStageIndex = 1; } 
    const stage = CYCLE_STAGES[currentStageIndex]; 
    updateBackground(stage); 
    currentStageIndex += cycleDirection; 
    setTimeout(runNextStage, stage.duration); 
}

// --- ЛОГИКА ИНВЕНТАРЯ ---
function updateInventoryButtons() {
    sawmillButton.classList.toggle('hidden', sawmillToPlace <= 0);
    rockButton.classList.toggle('hidden', rockToPlace <= 0);
    repairButton.classList.toggle('hidden', !hasRepairHammer);
    troughButton.classList.toggle('hidden', troughToPlace <= 0);
    piggyFoodButton.classList.toggle('hidden', pigFoodCount <= 0);
    grassButton.classList.toggle('hidden', grassSeedCount <= 0);
    hayButton.classList.toggle('hidden', haySeedCount <= 0);

    if (currentTool && document.querySelector(`#${currentTool}-button`)?.classList.contains('hidden')) {
        const firstVisibleButton = document.querySelector('#action-buttons-panel .tool-button:not(.hidden)');
        if (firstVisibleButton) {
            setActiveTool(firstVisibleButton.id.replace('-button', ''));
        } else {
             setActiveTool(null);
        }
    }
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

    const totalAnimals = sheep.length + chickens.length + cows.length + pigs.length;
    const capacityInfo = document.getElementById('animal-capacity-info');
    if (capacityInfo) capacityInfo.textContent = `${totalAnimals}/${maxAnimals}`;
    
    // Показываем/скрываем апгрейды
    document.getElementById('upgrade-sawmill-button').classList.toggle('hidden', !sawmillArea);
    document.getElementById('upgrade-rock-button').classList.toggle('hidden', !rockArea);
    document.getElementById('upgrades-separator').classList.toggle('hidden', !sawmillArea && !rockArea);
    document.getElementById('upgrade-sheep-button').classList.toggle('hidden', sheep.length === 0);
    document.getElementById('upgrade-cow-button').classList.toggle('hidden', cows.length === 0);
    document.getElementById('upgrade-chicken-button').classList.toggle('hidden', chickens.length === 0);
    document.getElementById('upgrade-pig-button').classList.toggle('hidden', pigs.length === 0);
    document.getElementById('upgrade-trough-button').classList.toggle('hidden', troughs.length === 0);


    if (sawmillArea) {
        const upgradeSawmillButton = document.getElementById('upgrade-sawmill-button');
        upgradeSawmillButton.dataset.costGold = Math.ceil(100 * Math.pow(1.8, sawmillArea.level - 1));
        upgradeSawmillButton.querySelector('.item-name').textContent = lang.shop_upgrade_sawmill_lvl.replace('{level}', sawmillArea.level + 1);
        upgradeSawmillButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeSawmillButton.dataset.costGold}`;
    }
    if (rockArea) {
        const upgradeRockButton = document.getElementById('upgrade-rock-button');
        upgradeRockButton.dataset.costGold = Math.ceil(200 * Math.pow(2, rockArea.level - 1));
        upgradeRockButton.querySelector('.item-name').textContent = lang.shop_upgrade_rock_lvl.replace('{level}', rockArea.level + 1);
        upgradeRockButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeRockButton.dataset.costGold}`;
    }

    const upgradePigButton = document.getElementById('upgrade-pig-button');
    upgradePigButton.dataset.costGold = Math.ceil(180 * Math.pow(2.2, pigLevel - 1));
    upgradePigButton.querySelector('.item-name').textContent = lang.shop_upgrade_pig_lvl.replace('{level}', pigLevel + 1);
    upgradePigButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradePigButton.dataset.costGold}`;
    
    const upgradeTroughButton = document.getElementById('upgrade-trough-button');
    upgradeTroughButton.dataset.costGold = Math.ceil(80 * Math.pow(2, troughLevel - 1));
    upgradeTroughButton.querySelector('.item-name').textContent = lang.shop_upgrade_trough_lvl.replace('{level}', troughLevel + 1);
    upgradeTroughButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeTroughButton.dataset.costGold}`;

    const upgradeSheepButton = document.getElementById('upgrade-sheep-button');
    upgradeSheepButton.dataset.costGold = Math.ceil(150 * Math.pow(2, sheepLevel - 1));
    upgradeSheepButton.querySelector('.item-name').textContent = lang.shop_upgrade_sheep_lvl.replace('{level}', sheepLevel + 1);
    upgradeSheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeSheepButton.dataset.costGold}`;

    const upgradeCowButton = document.getElementById('upgrade-cow-button');
    upgradeCowButton.dataset.costGold = Math.ceil(250 * Math.pow(2, cowLevel - 1));
    upgradeCowButton.querySelector('.item-name').textContent = lang.shop_upgrade_cow_lvl.replace('{level}', cowLevel + 1);
    upgradeCowButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeCowButton.dataset.costGold}`;
    
    const upgradeChickenButton = document.getElementById('upgrade-chicken-button');
    upgradeChickenButton.dataset.costGold = Math.ceil(100 * Math.pow(2, chickenLevel - 1));
    upgradeChickenButton.querySelector('.item-name').textContent = lang.shop_upgrade_chicken_lvl.replace('{level}', chickenLevel + 1);
    upgradeChickenButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${upgradeChickenButton.dataset.costGold}`;
    
    // --- Обновление цен на животных ---
    const buyPigButton = document.getElementById('buy-pig-button');
    buyPigButton.dataset.costGold = Math.ceil(120 * Math.pow(1.5, pigs.length));
    buyPigButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buyPigButton.dataset.costGold}`;

    const buyCowButton = document.getElementById('buy-cow-button');
    buyCowButton.dataset.costGold = Math.ceil(200 * Math.pow(1.5, cows.length));
    buyCowButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buyCowButton.dataset.costGold}`;

    const buySheepButton = document.getElementById('buy-sheep-button');
    buySheepButton.dataset.costGold = Math.ceil(50 * Math.pow(1.5, sheep.length));
    buySheepButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buySheepButton.dataset.costGold}`;

    const buyChickenButton = document.getElementById('buy-chicken-button');
    buyChickenButton.dataset.costGold = Math.ceil(25 * Math.pow(1.5, chickens.length));
    buyChickenButton.querySelector('.cost-resource').innerHTML = `<img src="images/gold/gold.png" alt="gold"> ${buyChickenButton.dataset.costGold}`;
    
    // --- Обновление улучшений дома ---
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
    
    // --- Логика отображения домов ---
    const houseButtons = {
        1: document.querySelector('[data-item="house_1"]'),
        2: document.querySelector('[data-item="house_2"]'),
        3: document.querySelector('[data-item="house_3"]'),
        4: document.querySelector('[data-item="house_4"]')
    };
    const currentHouseLevel = currentHouse ? currentHouse.level : 0;
    for (let level in houseButtons) {
        if (houseButtons[level]) {
            const isVisible = parseInt(level) === currentHouseLevel + 1;
            houseButtons[level].classList.toggle('hidden', !isVisible);
        }
    }
     if (currentHouseLevel === 0) {
        houseButtons[1].classList.remove('hidden');
    }
    
    // Скрываем кнопки покупки, если сооружение уже есть или в инвентаре
    document.querySelector('[data-item="buy_sawmill"]').classList.toggle('hidden', !!sawmillArea || sawmillToPlace > 0);
    document.querySelector('[data-item="buy_rock"]').classList.toggle('hidden', !!rockArea || rockToPlace > 0);
}


function handleShopTransaction(event) {
    const button = event.target.closest('.shop-item');
    if (!button) return;
    playSound(clickSound);
    const item = button.dataset.item;
    const costGold = parseInt(button.dataset.costGold) || 0;
    const costWood = parseInt(button.dataset.costWood) || 0;
    const costBrick = parseInt(button.dataset.costBrick) || 0;
    const capacity = parseInt(button.dataset.capacity) || 0;

    let purchaseSuccess = false;
    const totalAnimals = sheep.length + chickens.length + cows.length + pigs.length;

    if (item === 'upgrade_sawmill') { if (sawmillArea && goldCount >= costGold) { goldCount -= costGold; sawmillArea.upgrade(); purchaseSuccess = true; }
    } else if (item === 'upgrade_rock') { if (rockArea && goldCount >= costGold) { goldCount -= costGold; rockArea.upgrade(); purchaseSuccess = true; }
    } else if (item === 'buy_sawmill') { if (goldCount >= 250 && !sawmillArea && sawmillToPlace === 0) { goldCount -= 250; sawmillToPlace++; purchaseSuccess = true; }
    } else if (item === 'buy_rock') { if (goldCount >= 400 && !rockArea && rockToPlace === 0) { goldCount -= 400; rockToPlace++; purchaseSuccess = true; }
    } else if (item === 'upgrade_pig') { if (goldCount >= costGold) { goldCount -= costGold; pigLevel++; purchaseSuccess = true; }
    } else if (item === 'upgrade_trough') { if (goldCount >= costGold) { goldCount -= costGold; troughLevel++; troughs.forEach(t => t.upgrade()); purchaseSuccess = true; }
    } else if (item === 'upgrade_sheep') { if (goldCount >= costGold) { goldCount -= costGold; sheepLevel++; woolPerSheep++; purchaseSuccess = true; }
    } else if (item === 'upgrade_cow') { if (goldCount >= costGold) { goldCount -= costGold; cowLevel++; purchaseSuccess = true; }
    } else if (item === 'upgrade_chicken') { if (goldCount >= costGold) { goldCount -= costGold; chickenLevel++; eggChance = CHICKEN_BASE_EGG_CHANCE * (1 + chickenLevel * 0.2); purchaseSuccess = true; }
    } else if (item === 'upgrade_autofarm') { if (currentHouse && goldCount >= costGold) { goldCount -= costGold; currentHouse.autoFarmLevel++; currentHouse.updateFarmRates(); purchaseSuccess = true; }
    } else if (item === 'upgrade_clickfarm') { if (currentHouse && goldCount >= costGold) { goldCount -= costGold; currentHouse.clickFarmLevel++; currentHouse.updateFarmRates(); purchaseSuccess = true; }
    } else if (item === 'buy_pig') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; pigs.push(new Pig()); purchaseSuccess = true; }
    } else if (item === 'buy_cow') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; cows.push(new Cow()); purchaseSuccess = true; }
    } else if (item === 'buy_sheep') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; sheep.push(new Sheep()); purchaseSuccess = true; }
    } else if (item === 'buy_chicken') { if (goldCount >= costGold && totalAnimals < maxAnimals) { goldCount -= costGold; chickens.push(new Chicken()); purchaseSuccess = true; }
    } else if (item.startsWith('house')) { 
        const itemLevel = parseInt(item.split('_')[1]);
        const requiredLevel = currentHouse ? currentHouse.level + 1 : 1;

        if (itemLevel === requiredLevel && goldCount >= costGold && woodCount >= costWood && brickCount >= costBrick) { 
            const oldAutoFarmLvl = currentHouse ? currentHouse.autoFarmLevel : 1;
            const oldClickFarmLvl = currentHouse ? currentHouse.clickFarmLevel : 1;
            goldCount -= costGold; woodCount -= costWood; brickCount -= costBrick; 
            if (currentHouse) currentHouse.destroy(); 
            currentHouse = new House(item, capacity, oldAutoFarmLvl, oldClickFarmLvl); 
            purchaseSuccess = true; 
        }
    } else if (item === 'buy_grass_seed') { if (goldCount >= costGold) { goldCount -= costGold; grassSeedCount += 10; purchaseSuccess = true; }
    } else if (item === 'buy_hay_seed') { if (goldCount >= costGold) { goldCount -= costGold; haySeedCount += 10; purchaseSuccess = true; }
    } else if (item === 'buy_trough') { if (goldCount >= costGold) { goldCount -= costGold; troughToPlace++; purchaseSuccess = true; }
    } else if (item === 'buy_piggy_food') { if (goldCount >= costGold) { goldCount -= costGold; pigFoodCount++; purchaseSuccess = true; }
    } else if (item === 'buy_hammer') { if (goldCount >= costGold && !hasRepairHammer) { goldCount -= costGold; hasRepairHammer = true; purchaseSuccess = true; }
    } else if (item === 'sell_all') { let totalGain = (woodCount * 2) + (brickCount * 5) + (meatCount * 25) + (milkCount * 15) + (woolCount * 7) + (skinCount * 10) + (eggCount * 3) + (foxSkinCount * 15) + (bearSkinCount * 50); if (totalGain > 0) { goldCount += totalGain; woodCount=0; brickCount=0; meatCount = 0; milkCount = 0; woolCount = 0; skinCount = 0; eggCount = 0; foxSkinCount = 0; bearSkinCount=0; purchaseSuccess = true; } }

    button.classList.add(purchaseSuccess ? 'purchase-success' : 'purchase-fail');
    setTimeout(() => { button.classList.remove('purchase-success', 'purchase-fail'); }, 500);

    updateResourceCounters();
    updateInventoryButtons();
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
        [...sheep, ...chickens, ...cows, ...pigs, ...wolves, ...foxes, ...bears].forEach(o => o.update(deltaTime)); 
        
        if (currentHouse) {
            goldCount += currentHouse.autoFarmRate * deltaTime;
            updateResourceCounters();
        }
        requestAnimationFrame(gameLoop); 
    }
    requestAnimationFrame(gameLoop);
    runNextStage();
    
    gameWorld.addEventListener('pointerdown', handleGameClick);
    gameWorld.addEventListener('pointermove', handleGameMouseMove);

    setInterval(() => { if (!isPaused && sheep.length > 0) playSound(sheepSound); }, 7000 + Math.random() * 8000);
    setInterval(() => { if (!isPaused && chickens.length > 0) playSound(chickenAmbientSound); }, 5000 + Math.random() * 6000);
    setInterval(() => { if (!isPaused && cows.length > 0) playSound(cowAmbientSound); }, 8000 + Math.random() * 7000);
    enemySpawner();
}

function enemySpawner() {
    try {
        if (isPaused || isDialogueActive) {
            setTimeout(enemySpawner, 1000); 
            return;
        }

        const stage = CYCLE_STAGES.find(s => s.frameIndex === (currentStageIndex > 0 ? currentStageIndex - 1 : 0)) || CYCLE_STAGES[0];
        const dayNumber = stage.frameIndex <= 3 ? stage.frameIndex + 1 : 8 - stage.frameIndex;
        const difficultyModifier = 1 + (dayNumber - 1) * 0.1;
        
        let baseMinDelay = 7000, baseMaxDelay = 9000;
        
        if (stage.isNight) {
            baseMinDelay = 4000;
            baseMaxDelay = 6000;
        }

        const minDelay = baseMinDelay / difficultyModifier;
        const maxDelay = baseMaxDelay / difficultyModifier;

        const isBearSeason = [5, 6, 7].includes(stage.frameIndex);
        if (isBearSeason && bears.length === 0 && Math.random() < 0.25) { 
             bears.push(new Bear());
        } else {
            const rand = Math.random();
            if (rand < 0.60) {
                wolves.push(new Wolf());
            } else {
                foxes.push(new Fox());
            }

            if (stage.isNight && Math.random() < 0.3 * difficultyModifier) {
                 setTimeout(() => {
                    if (isPaused || isDialogueActive) return;
                    if (Math.random() < 0.60) wolves.push(new Wolf());
                    else foxes.push(new Fox());
                }, 1000);
            }
        }
        
        const nextSpawnTime = minDelay + Math.random() * (maxDelay - minDelay);
        setTimeout(enemySpawner, nextSpawnTime);
    } catch(e) {
        console.error("Error in enemySpawner:", e);
        setTimeout(enemySpawner, 10000); 
    }
}


function initializeGame() {
    gameContainer.style.display = 'flex';
    loadingScreen.style.display = 'none';
    
    GAME_DIMENSIONS = gameWorld.getBoundingClientRect();
    if (GAME_DIMENSIONS.width === 0) { console.error("Could not determine game world dimensions."); return; }

    updateResourceCounters();
    updateInventoryButtons();
    settingsButton.style.backgroundImage = `url('${SETTINGS_ICON_SRC}')`;
    grassButton.style.backgroundImage = `url('${GRASS_ICON_SRC}')`;
    hayButton.style.backgroundImage = `url('${HAY_SPRITES[0]}')`;
    troughButton.style.backgroundImage = `url('${TROUGH_ICON_SRC}')`;
    sawmillButton.style.backgroundImage = `url('${SAWMILL_ICON_SRC}')`;
    rockButton.style.backgroundImage = `url('${ROCK_ICON_SRC}')`;
    piggyFoodButton.style.backgroundImage = `url('${PIGGY_FOOD_ICON_SRC}')`;
    repairButton.style.backgroundImage = `url('${REPAIR_ICON_SRC}')`;
    menuToggleButton.style.backgroundImage = `url('${INVENTORY_ICON_SRC}')`;
    resourcesToggleButton.style.backgroundImage = `url('${CALCULATOR_ICON_SRC}')`;
    document.body.style.cursor = 'default';

    for (let i = 0; i < NUM_CLOUDS; i++) { clouds.push(new Cloud()); }
    for (let i = 0; i < STARTING_CHICKENS; i++) { chickens.push(new Chicken()); }
    
    translateUI();
    
    isDialogueActive = true;
    grandfatherDialogue.classList.remove('hidden');
    typewriterEffect(dialogueText, translations[currentLanguage].grandfather_dialogue, () => {
        dialogueContinueButton.classList.remove('hidden');
    });
    
    grassButton.addEventListener('click', () => setActiveTool('grass'));
    hayButton.addEventListener('click', () => setActiveTool('hay'));
    troughButton.addEventListener('click', () => setActiveTool('trough'));
    sawmillButton.addEventListener('click', () => setActiveTool('sawmill'));
    rockButton.addEventListener('click', () => setActiveTool('rock'));
    piggyFoodButton.addEventListener('click', () => setActiveTool('piggy_food'));
    repairButton.addEventListener('click', () => { if (hasRepairHammer) setActiveTool('repair'); });

    shopButton.addEventListener('click', () => { 
        playSound(clickSound);
        if (isDialogueActive) return;
        isPaused = true; 
        updateShopUI(); 
        shopMenu.classList.remove('hidden'); 
    });
    closeShopButton.addEventListener('click', () => { playSound(clickSound); isPaused = false; shopMenu.classList.add('hidden'); });
    
    shopMenu.addEventListener('click', (e) => {
        const target = e.target.closest('button, h3');
        if (!target) return;
    
        if (target.classList.contains('shop-tab-button')) {
            playSound(clickSound);
            shopMenu.querySelectorAll('.shop-tab-button, .shop-tab-content').forEach(el => el.classList.remove('active'));
            target.classList.add('active');
            const tabContentId = 'shop-tab-' + target.dataset.tab;
            document.getElementById(tabContentId)?.classList.add('active');
        } else if (target.classList.contains('shop-subsection-toggle')) {
            playSound(clickSound);
            target.parentElement.classList.toggle('open');
        } else if (target.classList.contains('shop-item')) {
            handleShopTransaction(e);
        }
    });

    restartButton.addEventListener('click', () => { playSound(clickSound); location.reload(); });
    menuToggleButton.addEventListener('click', () => { playSound(clickSound); mainActionsContainer.classList.toggle('open'); });
    resourcesToggleButton.addEventListener('click', () => { playSound(clickSound); document.getElementById('resources-panel-container').classList.toggle('open'); });
    
    settingsButton.addEventListener('click', () => { 
        playSound(clickSound);
        if (isDialogueActive) return;
        isPaused = true; 
        settingsMenu.classList.remove('hidden'); 
    });
    closeSettingsButton.addEventListener('click', () => { playSound(clickSound); isPaused = false; settingsMenu.classList.add('hidden'); });
    soundToggleButton.addEventListener('click', () => { playSound(clickSound); isSoundMuted = !isSoundMuted; translateUI(); });
    musicToggleButton.addEventListener('click', () => { playSound(clickSound); isMusicMuted = !isMusicMuted; updateMusicState(CYCLE_STAGES[currentStageIndex > 0 ? currentStageIndex-1:0]?.isNight || false); translateUI(); });
    languageToggleButton.addEventListener('click', () => { playSound(clickSound); currentLanguage = currentLanguage === 'rus' ? 'eng' : 'rus'; translateUI(); });
    godButton.addEventListener('click', () => { playSound(clickSound); goldCount += 1000000; updateResourceCounters(); });

    dialogueContinueButton.addEventListener('click', startGame, { once: true });
    
    window.addEventListener('resize', () => { 
        uiTargetCoordsCache = {};
        GAME_DIMENSIONS = gameWorld.getBoundingClientRect(); 
    });
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
        img.onerror = () => { console.error(`Failed to load: ${src}`); assetLoaded(); };
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
    else { console.error('Critical Error: #game-world element not found!'); }
});

