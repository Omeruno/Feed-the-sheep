// ==================================================================
// ==                                                              ==
// ==               ДОПОЛНИТЕЛЬНЫЕ КЛАССЫ ОБЪЕКТОВ                 ==
// ==                                                              ==
// ==================================================================
// Здесь хранятся классы для новых игровых механик.

// +++ КЛАСС ДЛЯ ЗОНЫ ДОБЫЧИ РЕСУРСОВ (ОБЩИЙ) +++
class ResourceArea {
    constructor(config, x, y) {
        this.type = config.type;
        this.width = config.width;
        this.height = config.height;
        this.x = x;
        this.y = y;
        this.level = 1;
        this.isFarming = false;
        this.isReady = false;
        this.timerId = null;
        this.remainingTime = 0;
        this.sprites = config.sprites;
        this.requiredHouseLevel = config.requiredHouseLevel;
        this.messageKey = config.messageKey;
        this.resourceIcon = config.resourceIcon;
        this.resourceCounterId = config.resourceCounterId;
        this.addResource = config.addResource;

        this.container = document.createElement('div');
        this.container.className = 'resource-area';
        this.container.style.width = `${this.width}px`;
        this.container.style.height = `${this.height}px`;
        this.container.style.transform = `translate(${this.x}px, ${this.y}px)`;
        gameWorld.appendChild(this.container);

        this.createVisuals();
        this.createUI();

        this.container.addEventListener('click', () => this.handleClick());
    }

    createVisuals() {
        this.visual = document.createElement('img');
        this.visual.src = this.sprites[0];
        this.visual.className = 'resource-area-visual';
        this.container.appendChild(this.visual);
    }

    createUI() {
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'resource-progress-container hidden';
        
        this.progressBar = document.createElement('div');
        this.progressBar.className = 'resource-progress-bar';
        
        this.timerText = document.createElement('span');
        this.timerText.className = 'resource-timer';
        
        this.progressContainer.appendChild(this.progressBar);
        this.progressContainer.appendChild(this.timerText);
        this.container.appendChild(this.progressContainer);

        this.collectIcon = document.createElement('img');
        this.collectIcon.src = this.resourceIcon;
        this.collectIcon.className = 'collect-icon hidden';
        this.container.appendChild(this.collectIcon);
    }

    handleClick() {
        if (this.isFarming || isPlacing) return;

        // Для каменоломни нужна проверка на уровень дома 3
        if (this.type === 'rock' && (!currentHouse || currentHouse.level < this.requiredHouseLevel)) {
            showPlayerMessage(this.messageKey);
            return;
        }
        // Для лесопилки нужен дом любого уровня
        if (this.type === 'sawmill' && !currentHouse) {
             showPlayerMessage(this.messageKey);
            return;
        }

        if (this.isReady) {
            this.collect();
        } else {
            this.startFarming();
        }
    }

    startFarming() {
        this.isFarming = true;
        this.collectIcon.classList.add('hidden');
        this.progressContainer.classList.remove('hidden');
        
        const baseTime = 60; // 60 секунд
        const timeToFarm = baseTime / this.level;
        this.remainingTime = timeToFarm;

        this.timerId = setInterval(() => {
            this.remainingTime--;
            const progress = 100 - (this.remainingTime / timeToFarm) * 100;
            this.progressBar.style.width = `${progress}%`;
            this.timerText.textContent = `${Math.floor(this.remainingTime)}s`;

            if (this.remainingTime <= 0) {
                this.finishFarming();
            }
        }, 1000);
    }
    
    finishFarming() {
        clearInterval(this.timerId);
        this.isFarming = false;
        this.isReady = true;
        this.progressContainer.classList.add('hidden');
        this.collectIcon.classList.remove('hidden');
        this.progressBar.style.width = '0%';
    }

    collect() {
        this.isReady = false;
        this.collectIcon.classList.add('hidden');
        const amount = this.level * 5; // 5 ресурсов за уровень
        this.addResource(amount);
        
        const rect = this.container.getBoundingClientRect();
        const startX = rect.left + rect.width / 2 - GAME_DIMENSIONS.left;
        const startY = rect.top + rect.height / 2 - GAME_DIMENSIONS.top;

        for (let i = 0; i < amount; i++) {
            setTimeout(() => {
                const flyingResource = document.createElement('img');
                flyingResource.src = this.resourceIcon;
                flyingResource.className = 'flying-coin'; // Re-use styling
                flyingResource.style.transform = `translate(${startX + (Math.random()-0.5)*20}px, ${startY + (Math.random()-0.5)*20}px)`;
                flyingResource.style.visibility = 'visible';
                gameWorld.appendChild(flyingResource);
                animateResourceToUI(flyingResource, this.resourceCounterId);
            }, i * 100);
        }
    }

    upgrade() {
        this.level++;
        this.updateImage();
    }

    updateImage() {
        let imageIndex = 0;
        if (this.level >= 5) imageIndex = 1;
        if (this.level >= 10) imageIndex = 2;
        if (this.level >= 15) imageIndex = 3;
        
        this.visual.src = this.sprites[imageIndex];
    }
    
    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    destroy() {
        clearInterval(this.timerId);
        this.container.remove();
        if (this.type === 'sawmill') sawmillArea = null;
        if (this.type === 'rock') rockArea = null;
        updateShopUI();
    }
}


// +++ НОВЫЙ КЛАСС ДЛЯ СВИНЬИ +++
class Pig {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'pig';
        this.element.src = pigSprites.front;
        gameWorld.appendChild(this.element);

        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;
        this.x = (horizontalMargin) + Math.random() * (GAME_DIMENSIONS.width - 2 * horizontalMargin);
        this.y = (walkableTop + verticalMargin) + Math.random() * (greenFieldHeight - 2 * verticalMargin);

        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';

        this.targetX = this.x; this.targetY = this.y;
        this.isWaiting = true; this.isEating = false; this.isScared = false; this.isHiding = false;

        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        let foundTrough = this.findNearestTrough();
        if (!foundTrough) {
            this.findNewTarget();
        }
    }

    findNearestTrough() {
        const fullTroughs = troughs.filter(t => !t.isEmpty());
        if (fullTroughs.length === 0) return false;
        
        let closestTrough = null;
        let minDistance = Infinity;
        fullTroughs.forEach(trough => {
            const distance = Math.sqrt(Math.pow(this.x - trough.x, 2) + Math.pow(this.y - trough.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestTrough = trough;
            }
        });

        if (closestTrough) {
            this.targetX = closestTrough.x;
            this.targetY = closestTrough.y;
            return true;
        }
        return false;
    }

    findNewTarget() {
        if (this.isHiding) return;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;
        this.targetX = (horizontalMargin) + Math.random() * (GAME_DIMENSIONS.width - 2 * horizontalMargin);
        this.targetY = (walkableTop + verticalMargin) + Math.random() * (greenFieldHeight - 2 * verticalMargin);
    }

    update(deltaTime) {
        if (currentHouse) {
            this.element.style.zIndex = this.y > currentHouse.layerThreshold ? '6' : '4';
        }

        if (this.isHiding || this.isEating || this.isScared) return;

        const stage = CYCLE_STAGES.find(s => s.frameIndex === (currentStageIndex > 0 ? currentStageIndex - 1 : 0)) || CYCLE_STAGES[0];
        if (stage.isNight && currentHouse) {
            this.targetX = currentHouse.x + 25;
            this.targetY = currentHouse.y + 50;
            const distanceToHouse = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2));
            if (distanceToHouse < 10) {
                this.isHiding = true;
                this.element.style.visibility = 'hidden';
                return;
            }
        }
        
        const fullTroughs = troughs.filter(t => !t.isEmpty());
        for (let trough of fullTroughs) {
            const distanceToTrough = Math.sqrt(Math.pow(this.x - trough.x, 2) + Math.pow(this.y - trough.y, 2));
            if (distanceToTrough < EAT_RADIUS + 5) { // Увеличим радиус для кормушки
                this.isEating = true;
                this.element.src = pigSprites.eat;
                playSound(eatSound);
                
                setTimeout(() => {
                    trough.consume(PIG_EAT_AMOUNT);
                    this.isEating = false;
                    this.element.src = pigSprites.front;
                    const currentMeatChance = PIG_BASE_MEAT_CHANCE + (pigLevel - 1) * 0.1;
                    if(Math.random() < currentMeatChance) {
                       spawnMeat(this.x, this.y);
                    }
                    this.decideNextAction();
                }, EAT_ANIMATION_DURATION * 1.5); // Едят дольше
                return;
            }
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget < 1) {
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.element.src = pigSprites.front;
                this.waitTimer = setTimeout(() => this.decideNextAction(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME));
            }
        } else {
            const moveX = (dx / distanceToTarget) * PIG_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * PIG_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            this.element.src = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? pigSprites.right : pigSprites.left) : (dy > 0 ? pigSprites.front : pigSprites.back);
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }
}

// +++ НОВЫЙ КЛАСС ДЛЯ КОРМУШКИ +++
class Trough {
    constructor(px, py) {
        this.x = px;
        this.y = py;
        this.width = 45;
        this.height = 30;
        this.food = 0;
        this.level = troughLevel;
        this.capacity = TROUGH_BASE_CAPACITY * this.level;

        this.element = document.createElement('img');
        this.element.className = 'trough';
        this.element.src = troughSprites.empty;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        gameWorld.appendChild(this.element);

        this.foodBarContainer = document.createElement('div');
        this.foodBarContainer.className = 'food-bar-container';
        this.foodBar = document.createElement('div');
        this.foodBar.className = 'food-bar';
        this.foodBarContainer.appendChild(this.foodBar);
        gameWorld.appendChild(this.foodBarContainer);
        
        this.updateFoodBar();
    }

    upgrade() {
        this.level = troughLevel;
        this.capacity = TROUGH_BASE_CAPACITY * (1 + (this.level -1) * 0.5); // Улучшение дает +50% к емкости
        this.updateFoodBar();
    }

    updateFoodBar() {
        this.foodBar.style.width = `${(this.food / this.capacity) * 100}%`;
        this.foodBarContainer.style.transform = `translate(${this.x + 2.5}px, ${this.y - 10}px)`;
        this.foodBarContainer.style.visibility = this.food > 0 ? 'visible' : 'hidden';
    }

    fill() {
        this.food = this.capacity;
        this.element.src = troughSprites.full;
        this.updateFoodBar();
    }

    consume(amount) {
        this.food = Math.max(0, this.food - amount);
        if (this.food === 0) {
            this.element.src = troughSprites.empty;
             // Сообщить свиньям, что еда кончилась
            pigs.forEach(pig => {
                if(Math.sqrt(Math.pow(pig.x - this.x, 2) + Math.pow(pig.y - this.y, 2)) < 50) {
                    pig.decideNextAction();
                }
            });
        }
        this.updateFoodBar();
    }

    isEmpty() {
        return this.food <= 0;
    }
    
    isFull() {
        return this.food >= this.capacity;
    }

    getRect() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    destroy() {
        this.element.remove();
        this.foodBarContainer.remove();
        const index = troughs.indexOf(this);
        if (index > -1) {
            troughs.splice(index, 1);
        }
    }
}

// +++ НОВЫЙ КЛАСС ДЛЯ ЛИСЫ +++
class Fox {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'fox';
        this.element.src = foxSprites.left;
        gameWorld.appendChild(this.element);
        playSound(foxSound);

        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -50 : GAME_DIMENSIONS.width + 50;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + Math.random() * (GAME_DIMENSIONS.height - walkableTop - 30);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        
        this.targetAnimal = null;
        this.targetHouse = null;
        this.isDying = false;
        this.isJumping = false;
        this.isCapturing = false;
        this.isAttacking = false;
        this.isDragging = false; 
        this.draggedAnimal = null; 
        
        this.element.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            this.handleClick();
        });

        this.findTarget();
    }

    findTarget() {
        const availableAnimals = [...sheep, ...chickens, ...cows, ...pigs].filter(a => !a.isScared && !a.isHiding);
        this.targetAnimal = availableAnimals.length > 0 ? availableAnimals[Math.floor(Math.random() * availableAnimals.length)] : null;
    }

    update(deltaTime) {
        if (this.isDying || this.isJumping) return;
        
        if (currentHouse) {
            this.element.style.zIndex = this.y > currentHouse.layerThreshold ? '6' : '4';
        }

        const stage = CYCLE_STAGES.find(s => s.frameIndex === (currentStageIndex > 0 ? currentStageIndex - 1 : 0)) || CYCLE_STAGES[0];
        const anyAnimalHiding = [...sheep, ...chickens, ...cows, ...pigs].some(a => a.isHiding);

        if (stage.isNight && currentHouse && anyAnimalHiding) {
            this.targetHouse = currentHouse;
            this.targetAnimal = null;
        } else {
            this.targetHouse = null;
            if (!this.targetAnimal || this.targetAnimal.isScared || this.targetAnimal.isHiding) {
                this.findTarget();
            }
        }

        if (this.isAttacking) return;
        
        if (this.isDragging && this.draggedAnimal) {
            const exitX = this.fromLeft ? -50 : GAME_DIMENSIONS.width + 50;
            const exitY = this.y;
            const dx = exitX - this.x;
            const dy = exitY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 10) {
                this.element.remove();
                if(this.draggedAnimal) { this.draggedAnimal.element.remove(); }
                const foxIndex = foxes.indexOf(this);
                if (foxIndex > -1) foxes.splice(foxIndex, 1);
                
                let sheepIndex = sheep.indexOf(this.draggedAnimal); if (sheepIndex > -1) sheep.splice(sheepIndex, 1);
                let chickenIndex = chickens.indexOf(this.draggedAnimal); if (chickenIndex > -1) chickens.splice(chickenIndex, 1);
                let cowIndex = cows.indexOf(this.draggedAnimal); if(cowIndex > -1) cows.splice(cowIndex, 1);
                let pigIndex = pigs.indexOf(this.draggedAnimal); if(pigIndex > -1) pigs.splice(pigIndex, 1);

                if (sheep.length === 0 && chickens.length === 0 && cows.length === 0 && pigs.length === 0) { gameOver(); }
                return;
            }
            const moveX = (dx / distance) * FOX_SPEED * deltaTime;
            this.x += moveX;
            this.element.src = this.fromLeft ? foxSprites.left : foxSprites.right;
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            if(this.draggedAnimal) {
                this.draggedAnimal.x = this.x + (this.fromLeft ? 15 : -15);
                this.draggedAnimal.y = this.y;
                this.draggedAnimal.element.style.transform = `translate(${this.draggedAnimal.x}px, ${this.draggedAnimal.y}px)`;
            }
            return;
        }

        if (this.isCapturing) return;

        let targetX, targetY;
        if (this.targetHouse) {
            targetX = this.targetHouse.x + 50;
            targetY = this.targetHouse.y + 50;
        } else if (this.targetAnimal) {
            targetX = this.targetAnimal.x;
            targetY = this.targetAnimal.y;
        } else {
            targetX = this.fromLeft ? GAME_DIMENSIONS.width + 50 : -50;
            targetY = this.y;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 && (this.targetAnimal || this.targetHouse)) {
            if (this.targetHouse) this.attackHouse(this.targetHouse);
            else if (this.targetAnimal) this.capture(this.targetAnimal);
            return;
        }
        
        if (distance < 1 && !this.targetAnimal && !this.targetHouse) {
            this.element.remove();
            const foxIndex = foxes.indexOf(this);
            if (foxIndex > -1) foxes.splice(foxIndex, 1);
            return;
        }

        const moveX = (dx / distance) * FOX_SPEED * deltaTime;
        const moveY = (dy / distance) * FOX_SPEED * deltaTime;
        this.x += moveX;
        this.y += moveY;

        if (currentHouse && this.y < currentHouse.y + 50) { // Не позволяет заходить за дом
            this.y = currentHouse.y + 50;
        }
        
        this.element.src = dx > 0 ? foxSprites.right : foxSprites.left;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    attackHouse(house) {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.element.src = foxSprites.attack;
        house.takeDamage(10);
        setTimeout(() => { this.isAttacking = false; }, 1000);
    }

    capture(target) {
        if (this.isCapturing || this.isDragging) return;
        if (target instanceof Chicken) playSound(chickenSound);
        else playSound(wolfAttackSound);

        this.isCapturing = true; 
        this.isAttacking = true; 
        this.element.src = foxSprites.attack;
        setTimeout(() => {
            this.isAttacking = false;
            this.isDragging = true;
            this.draggedAnimal = target;
            target.isScared = true;
        }, 500);
    }
    
    handleClick() {
        if (this.isDying || this.isJumping) return;

        if (Math.random() < 0.35) { // 35% шанс на прыжок
            this.isJumping = true;
            this.element.src = foxSprites.up;
            const originalY = this.y;
            this.y -= 25; // Прыжок вверх
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            
            setTimeout(() => {
                this.y = originalY;
                this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
                this.isJumping = false;
            }, 300);

        } else { // 65% шанс умереть
            this.isDying = true;
            playSound(wolfDeadSound);
            if (this.isDragging && this.draggedAnimal) {
                this.draggedAnimal.isScared = false;
                this.draggedAnimal.decideNextAction();
            }
            spawnFoxSkin(this.x, this.y);
            this.element.style.opacity = 0;
            setTimeout(() => { 
                this.element.remove(); 
                const foxIndex = foxes.indexOf(this); 
                if (foxIndex > -1) foxes.splice(foxIndex, 1); 
            }, 500);
        }
    }
}

// +++ НОВЫЙ КЛАСС ДЛЯ МЕДВЕДЯ +++
class Bear {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'bear';
        this.element.src = bearSprites.left;
        gameWorld.appendChild(this.element);
        playSound(bearSound);

        this.fromLeft = Math.random() < 0.5;
        this.x = this.fromLeft ? -80 : GAME_DIMENSIONS.width + 80;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + Math.random() * (GAME_DIMENSIONS.height - walkableTop - 60);
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        
        this.health = BEAR_HEALTH;
        this.maxHealth = BEAR_HEALTH;
        this.isDying = false;
        this.isAttacking = false;
        this.targetAnimal = null;

        this.hpBarContainer = document.createElement('div');
        this.hpBarContainer.className = 'hp-bar-container';
        this.hpBar = document.createElement('div');
        this.hpBar.className = 'hp-bar';
        this.hpBarContainer.appendChild(this.hpBar);
        gameWorld.appendChild(this.hpBarContainer);
        this.updateHpBar();

        this.element.addEventListener('pointerdown', (event) => {
            event.stopPropagation();
            this.takeDamage();
        });
    }

    updateHpBar() {
        this.hpBar.style.width = `${(this.health / this.maxHealth) * 100}%`;
        const barX = this.x + (this.element.offsetWidth / 2) - 25;
        const barY = this.y - 15;
        this.hpBarContainer.style.transform = `translate(${barX}px, ${barY}px)`;
        this.hpBarContainer.style.visibility = 'visible';
    }

    takeDamage() {
        if (this.isDying) return;
        this.health--;
        this.updateHpBar();
        playSound(bearDamageSound);
        
        this.element.src = bearSprites.damage;
        setTimeout(() => {
            if (!this.isAttacking && !this.isDying) {
               this.element.src = this.x > (GAME_DIMENSIONS.width / 2) ? bearSprites.left : bearSprites.right;
            }
        }, 200);

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        if (this.isDying) return;
        this.isDying = true;
        playSound(wolfDeadSound);
        spawnBearSkin(this.x, this.y);

        this.element.style.opacity = 0;
        this.hpBarContainer.remove();
        setTimeout(() => {
            this.element.remove();
            const index = bears.indexOf(this);
            if (index > -1) bears.splice(index, 1);
        }, 500);
    }
    
    findTargetAnimal() {
        const availableAnimals = [...sheep, ...chickens, ...cows, ...pigs].filter(a => !a.isScared && !a.isHiding);
        if (availableAnimals.length > 0) {
            this.targetAnimal = availableAnimals.reduce((closest, current) => {
                const distToClosest = Math.sqrt(Math.pow(this.x - closest.x, 2) + Math.pow(this.y - closest.y, 2));
                const distToCurrent = Math.sqrt(Math.pow(this.x - current.x, 2) + Math.pow(this.y - current.y, 2));
                return distToCurrent < distToClosest ? current : closest;
            });
        } else {
            this.targetAnimal = null;
        }
    }

    update(deltaTime) {
        if (this.isDying || this.isAttacking) {
            this.updateHpBar(); // Keep HP bar in position during attack
            return;
        }

        let targetX, targetY;
        
        if (currentHouse && currentHouse.health > 0) {
            this.targetAnimal = null;
            targetX = currentHouse.x + 50; // Aim for the center of the house
            targetY = currentHouse.y + 50;
        } else {
            if (!this.targetAnimal || this.targetAnimal.isScared) {
                this.findTargetAnimal();
            }
            if (this.targetAnimal) {
                 targetX = this.targetAnimal.x;
                 targetY = this.targetAnimal.y;
            } else {
                // If there's no house and no animals, the bear just leaves
                targetX = this.fromLeft ? GAME_DIMENSIONS.width + 80 : -80;
                targetY = this.y;
            }
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 25) {
            if (currentHouse && currentHouse.health > 0) {
                this.attackHouse(currentHouse);
            } else if (this.targetAnimal) {
                this.attackAnimal(this.targetAnimal);
            }
            return;
        } else if (distance < 1 && (!currentHouse || currentHouse.health <= 0) && !this.targetAnimal) {
            // Bear left the screen
            this.element.remove();
            this.hpBarContainer.remove();
            const index = bears.indexOf(this);
            if (index > -1) bears.splice(index, 1);
            return;
        }

        const moveX = (dx / distance) * BEAR_SPEED * deltaTime;
        const moveY = (dy / distance) * BEAR_SPEED * deltaTime;
        this.x += moveX;
        this.y += moveY;

        if (currentHouse && this.y < currentHouse.y + 50) {
            this.y = currentHouse.y + 50;
        }

        this.element.src = dx > 0 ? bearSprites.right : bearSprites.left;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.updateHpBar();
    }

    attackHouse(house) {
        if (this.isAttacking || this.isDying) return;
        this.isAttacking = true;
        this.element.src = bearSprites.attack;
        playSound(bearAttackSound);
        
        setTimeout(() => {
            if (house) house.takeDamage(BEAR_DAMAGE);
        }, 200); // Damage applies mid-animation

        setTimeout(() => {
            this.isAttacking = false;
            if (this.isDying) return;
            this.element.src = this.x > (GAME_DIMENSIONS.width / 2) ? bearSprites.left : bearSprites.right;
        }, 1200); // Duration of attack animation
    }
    
    attackAnimal(animal) {
        if (this.isAttacking || this.isDying) return;
        this.isAttacking = true;
        this.element.src = bearSprites.attack;
        playSound(bearAttackSound);
        
        setTimeout(() => {
            if (animal && !animal.isScared) {
                animal.element.remove();
                
                let animalArrays = [sheep, chickens, cows, pigs];
                for (let arr of animalArrays) {
                    const index = arr.indexOf(animal);
                    if (index > -1) {
                        arr.splice(index, 1);
                        break;
                    }
                }

                if (sheep.length === 0 && chickens.length === 0 && cows.length === 0 && pigs.length === 0) {
                    gameOver();
                }
            }
        }, 500);

        setTimeout(() => {
            this.isAttacking = false;
            this.targetAnimal = null; // Find new target after killing
            if (this.isDying) return;
        }, 1200);
    }
}

