// ==================================================================
// ==                                                              ==
// ==                      КЛАССЫ ОБЪЕКТОВ                         ==
// ==                                                              ==
// ==================================================================
// В этом файле хранятся "чертежи" для всех игровых объектов:
// овец, кур, волков, домов и облаков.

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
    constructor(type, capacity, initialAutoFarmLevel = 1, initialClickFarmLevel = 1) {
        this.element = document.createElement('img');
        this.element.className = 'house';
        this.element.src = HOUSE_SPRITES[type];
        
        this.x = GAME_DIMENSIONS.width / 2 - 50;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        this.y = walkableTop + (GAME_DIMENSIONS.height - walkableTop) / 2 - 50;
        
        this.layerThreshold = this.y + 60; 

        // Set the base transform for positioning
        this.element.style.setProperty('--x-pos', `${this.x}px`);
        this.element.style.setProperty('--y-pos', `${this.y}px`);
        this.element.style.transform = `translate(var(--x-pos), var(--y-pos))`;
        
        this.element.style.visibility = 'visible';
        gameWorld.appendChild(this.element);
        
        this.health = HOUSE_BASE_HEALTH;
        this.capacity = capacity;
        maxAnimals = this.capacity;
        this.level = parseInt(type.split('_')[1]);

        this.hpBarContainer = document.createElement('div');
        this.hpBarContainer.className = 'hp-bar-container';
        this.hpBar = document.createElement('div');
        this.hpBar.className = 'hp-bar';
        this.hpBarContainer.appendChild(this.hpBar);
        gameWorld.appendChild(this.hpBarContainer);
        this.updateHpBar();

        this.autoFarmLevel = initialAutoFarmLevel;
        this.clickFarmLevel = initialClickFarmLevel;
        this.updateFarmRates();

        this.element.addEventListener('pointerdown', (event) => this.handleClick(event));
    }
    
    updateFarmRates() {
        this.autoFarmRate = 0.18 * this.autoFarmLevel; // +20% base income per level
        this.clickFarmValue = 0.6 * this.clickFarmLevel; // +20% base income per level
    }

    handleClick(event) {
        event.stopPropagation();

        if (currentTool === 'repair') {
            if (hasRepairHammer) {
                this.repair();
                hasRepairHammer = false;
                updateInventoryButtons();
                setActiveTool('grass'); // Возвращаемся к инструменту по умолчанию
            }
            return; // Прерываем выполнение, чтобы не фармить монеты
        }
        
        if(isPaused) return;
        playSound(clickSound);
        goldCount += this.clickFarmValue;
        updateResourceCounters();
        this.element.classList.add('clicked');
        setTimeout(() => this.element.classList.remove('clicked'), 100);
        spawnFlyingCoin(this.x + 50, this.y + 20);
    }

    updateHpBar() {
        this.hpBar.style.width = `${(this.health / HOUSE_BASE_HEALTH) * 100}%`;
        const barX = this.x + (this.element.offsetWidth / 2) - 25;
        const barY = this.y - 10;
        this.hpBarContainer.style.transform = `translate(${barX}px, ${barY}px)`;
        this.hpBarContainer.style.visibility = 'visible';
    }

    showDamageEffect() {
        this.element.classList.add('taking-damage-effect');
        setTimeout(() => {
            this.element.classList.remove('taking-damage-effect');
        }, 150); // Duration of the effect in ms
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHpBar();
        this.showDamageEffect();
        playSound(damageHouseSound);
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
        maxAnimals = BASE_ANIMAL_CAPACITY;
        [...sheep, ...chickens, ...cows, ...pigs].forEach(animal => {
            animal.isHiding = false;
            animal.element.style.visibility = 'visible';
        });
        updateShopUI();
    }
}

class Sheep {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'sheep';
        this.element.src = sheepSprites.front;
        gameWorld.appendChild(this.element);

        let startX, startY;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;

        const minX = horizontalMargin;
        const maxX = GAME_DIMENSIONS.width - horizontalMargin;
        const minY = walkableTop + verticalMargin;
        const maxY = GAME_DIMENSIONS.height - verticalMargin;

        startX = minX + Math.random() * (maxX - minX);
        startY = minY + Math.random() * (maxY - minY);

        this.x = startX; this.y = startY;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        
        this.targetX = this.x; this.targetY = this.y;
        this.isWaiting = true; this.isEating = false; this.isScared = false; this.isHiding = false;
        
        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        let foundGrass = this.findNearestGrass();
        if (!foundGrass) {
            this.findNewTarget();
        }
    }

    findNearestGrass() {
        if (grassPatches.length === 0) return false;
        let closestGrass = null;
        let minDistance = Infinity;
        grassPatches.forEach(grass => {
            const distance = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
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

        for (let i = grassPatches.length - 1; i >= 0; i--) {
            const grass = grassPatches[i];
            const distanceToGrass = Math.sqrt(Math.pow(this.x - grass.x, 2) + Math.pow(this.y - grass.y, 2));
            if (distanceToGrass < EAT_RADIUS) {
                this.isEating = true;
                this.element.src = sheepSprites.eat;
                playSound(eatSound);
                setTimeout(() => {
                    grass.element.remove();
                    grassPatches.splice(i, 1);
                    this.element.src = sheepSprites.front;
                    this.isEating = false;
                    spawnWool(this.x, this.y, woolPerSheep);
                    this.decideNextAction();
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
                this.element.src = sheepSprites.front;
                this.waitTimer = setTimeout(() => this.decideNextAction(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME));
            }
        } else {
            const moveX = (dx / distanceToTarget) * SHEEP_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * SHEEP_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            this.element.src = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? sheepSprites.right : sheepSprites.left) : (dy > 0 ? sheepSprites.front : sheepSprites.back);
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }
}


class Chicken {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'chicken';
        this.element.src = chickenSprites.front;
        gameWorld.appendChild(this.element);

        let startX, startY;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;
        startX = horizontalMargin + Math.random() * (GAME_DIMENSIONS.width - 2 * horizontalMargin);
        startY = (walkableTop + verticalMargin) + Math.random() * (greenFieldHeight - 2 * verticalMargin);

        this.x = startX; this.y = startY;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        
        this.targetX = this.x; this.targetY = this.y;
        this.isWaiting = true; this.isEating = false; this.isScared = false; this.isHiding = false;
        
        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        if (Math.random() < 0.3) {
            this.peck();
        } else {
            this.findNewTarget();
        }
    }

    peck() {
        this.isEating = true; 
        this.element.src = chickenSprites.eat;
        setTimeout(() => { this.element.src = chickenSprites.front; }, 150);
        setTimeout(() => { this.element.src = chickenSprites.eat; }, 300);
        setTimeout(() => { this.element.src = chickenSprites.front; }, 450);
        setTimeout(() => {
            this.isEating = false;
            this.element.src = chickenSprites.front;
            this.findNewTarget();
        }, 600);
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

        if (Math.random() < eggChance * deltaTime) {
            spawnEgg(this.x, this.y);
        }
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

        if (distanceToTarget < 1) {
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.element.src = chickenSprites.front;
                this.waitTimer = setTimeout(() => this.decideNextAction(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME));
            }
        } else {
            const moveX = (dx / distanceToTarget) * CHICKEN_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * CHICKEN_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            this.element.src = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? chickenSprites.right : chickenSprites.left) : (dy > 0 ? chickenSprites.front : chickenSprites.back);
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        }
    }
}

class Cow {
    constructor() {
        this.element = document.createElement('img'); this.element.className = 'cow'; this.element.src = cowSprites.front;
        gameWorld.appendChild(this.element); 
        
        let startX, startY;
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        const greenFieldHeight = GAME_DIMENSIONS.height - walkableTop;
        const horizontalMargin = GAME_DIMENSIONS.width * 0.20;
        const verticalMargin = greenFieldHeight * 0.20;
        startX = horizontalMargin + Math.random() * (GAME_DIMENSIONS.width - 2 * horizontalMargin);
        startY = (walkableTop + verticalMargin) + Math.random() * (greenFieldHeight - 2 * verticalMargin);

        this.x = startX; this.y = startY;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
        this.element.style.visibility = 'visible';
        
        this.targetX = this.x; this.targetY = this.y;
        this.isWaiting = true; this.isEating = false; this.isScared = false; this.isHiding = false;
        
        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        let foundHay = this.findNearestHay();
        if (!foundHay) {
            this.findNewTarget();
        }
    }

    findNearestHay() {
        const readyHay = hayPatches.filter(h => h.isReady);
        if (readyHay.length === 0) return false;
        let closestHay = null;
        let minDistance = Infinity;
        readyHay.forEach(hay => {
            const distance = Math.sqrt(Math.pow(this.x - hay.x, 2) + Math.pow(this.y - hay.y, 2));
            if (distance < minDistance) {
                minDistance = distance;
                closestHay = hay;
            }
        });
        if (closestHay) {
            this.targetX = closestHay.x;
            this.targetY = closestHay.y;
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

        for (let i = hayPatches.length - 1; i >= 0; i--) {
            const hay = hayPatches[i];
            if (!hay.isReady) continue;
            const distanceToHay = Math.sqrt(Math.pow(this.x - hay.x, 2) + Math.pow(this.y - hay.y, 2));
            if (distanceToHay < EAT_RADIUS) {
                this.isEating = true;
                this.element.src = cowSprites.eat;
                playSound(eatSound);
                setTimeout(() => {
                    hay.destroy();
                    hayPatches.splice(i, 1);
                    this.element.src = cowSprites.front;
                    this.isEating = false;
                    spawnMilk(this.x, this.y);
                    this.decideNextAction();
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
                this.element.src = cowSprites.front;
                this.waitTimer = setTimeout(() => this.decideNextAction(), MIN_WAIT_TIME + Math.random() * (MAX_WAIT_TIME - MIN_WAIT_TIME));
            }
        } else {
            const moveX = (dx / distanceToTarget) * COW_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * COW_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            this.element.src = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? cowSprites.right : cowSprites.left) : (dy > 0 ? cowSprites.front : cowSprites.back);
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
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
        this.targetAnimal = null;
        this.targetHouse = null;
        this.isScared = false;
        this.isCapturing = false;
        this.isAttacking = false;
        this.isDragging = false; 
        this.draggedAnimal = null; 
        
        this.element.addEventListener('pointerdown', (event) => {
            event.stopPropagation(); // <-- Останавливаем "протекание" клика
            this.scare();
        });

        this.findTarget(); // Первоначальный поиск цели
    }

    findTarget() {
        const availableAnimals = [...sheep, ...chickens, ...cows, ...pigs].filter(a => !a.isScared && !a.isHiding);
        this.targetAnimal = availableAnimals.length > 0 ? availableAnimals[Math.floor(Math.random() * availableAnimals.length)] : null;
    }

    update(deltaTime) {
        if (currentHouse) {
            this.element.style.zIndex = this.y > currentHouse.layerThreshold ? '6' : '4';
        }

        // Логика определения цели (чтобы не переключаться с дома на животное)
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
                if(this.draggedAnimal) {
                    this.draggedAnimal.element.remove();
                }
                const wolfIndex = wolves.indexOf(this);
                if (wolfIndex > -1) wolves.splice(wolfIndex, 1);
                
                let sheepIndex = sheep.indexOf(this.draggedAnimal); if (sheepIndex > -1) sheep.splice(sheepIndex, 1);
                let chickenIndex = chickens.indexOf(this.draggedAnimal); if (chickenIndex > -1) chickens.splice(chickenIndex, 1);
                let cowIndex = cows.indexOf(this.draggedAnimal); if(cowIndex > -1) cows.splice(cowIndex, 1);
                let pigIndex = pigs.indexOf(this.draggedAnimal); if(pigIndex > -1) pigs.splice(pigIndex, 1);

                if (sheep.length === 0 && chickens.length === 0 && cows.length === 0 && pigs.length === 0) {
                    gameOver();
                }
                return;
            }
            const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
            this.x += moveX;
            this.element.src = this.fromLeft ? wolfSprites.left : wolfSprites.right;
            this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
            if(this.draggedAnimal) {
                this.draggedAnimal.x = this.x + (this.fromLeft ? 15 : -15);
                this.draggedAnimal.y = this.y;
                this.draggedAnimal.element.style.transform = `translate(${this.draggedAnimal.x}px, ${this.draggedAnimal.y}px)`;
            }
            return;
        }

        if (this.isScared || this.isCapturing) return;

        let targetX, targetY;
        if (this.targetHouse) {
            targetX = this.targetHouse.x + 50;
            targetY = this.targetHouse.y + 50;
        } else if (this.targetAnimal) {
            targetX = this.targetAnimal.x;
            targetY = this.targetAnimal.y;
        } else {
            // Если целей нет, волк просто уходит
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
             // Волк ушел за экран
             this.element.remove();
             const wolfIndex = wolves.indexOf(this);
             if (wolfIndex > -1) wolves.splice(wolfIndex, 1);
             return;
        }

        const moveX = (dx / distance) * WOLF_SPEED * deltaTime;
        const moveY = (dy / distance) * WOLF_SPEED * deltaTime;
        
        this.x += moveX;
        this.y += moveY;

        if (currentHouse && this.y < currentHouse.y + 50) { // Не позволяет заходить за дом
            this.y = currentHouse.y + 50;
        }

        if (Math.abs(dx) > Math.abs(dy)) { this.element.src = dx > 0 ? wolfSprites.right : wolfSprites.left; } 
        else { this.element.src = dy > 0 ? wolfSprites.front : wolfSprites.back; }
        this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    attackHouse(house) {
        if (this.isAttacking) return;
        this.isAttacking = true;
        this.element.src = wolfSprites.attack;
        house.takeDamage(10);
        setTimeout(() => { this.isAttacking = false; }, 1000);
    }

    capture(target) {
        if (this.isCapturing || this.isDragging) return;
        
        if (target instanceof Chicken) playSound(chickenSound);
        else if (target instanceof Cow) playSound(cowAmbientSound);
        else playSound(wolfAttackSound);

        this.isCapturing = true; 
        this.isAttacking = true; 
        this.element.src = wolfSprites.attack;
        setTimeout(() => {
            this.isAttacking = false;
            this.isDragging = true;
            this.draggedAnimal = target;
            target.isScared = true;
        }, 500);
    }
    
    scare() {
        if (this.isScared) return;
        playSound(wolfDeadSound);
        this.isScared = true;
        if (this.isDragging && this.draggedAnimal) {
            this.draggedAnimal.isScared = false;
            this.draggedAnimal.decideNextAction();
        }
        spawnSkin(this.x, this.y);
        this.element.style.opacity = 0;
        setTimeout(() => { this.element.remove(); const wolfIndex = wolves.indexOf(this); if (wolfIndex > -1) wolves.splice(wolfIndex, 1); }, 500);
    }
}


class Hay {
    constructor(px, py) {
        this.x = px;
        this.y = py;
        this.stage = 0; // 0: small, 1: medium, 2: ready
        this.isReady = false;

        this.element = document.createElement('img');
        this.element.className = 'hay-patch';
        this.element.src = 'images/icons/rostock_small.png';
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(0.5)`;
        grassLayer.appendChild(this.element);
        
        // Animate appearance
        requestAnimationFrame(() => {
            this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(1)`;
        });

        setTimeout(() => this.growToMedium(), 3000);
    }

    growToMedium() {
        if(this.stage !== 0) return;
        this.stage = 1;
        this.element.src = 'images/icons/rostock_sredny.png';
        setTimeout(() => this.growToReady(), 5000);
    }

    growToReady() {
        if(this.stage !== 1) return;
        this.stage = 2;
        this.isReady = true;
        this.element.src = 'images/icons/rostock_ready.png';
    }

     destroy() {
        this.element.style.opacity = 0;
        setTimeout(() => this.element.remove(), 500);
    }
}

