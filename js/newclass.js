// ==================================================================
// ==                 ДОПОЛНИТЕЛЬНЫЕ КЛАССЫ ОБЪЕКТОВ                ==
// ==================================================================
// Здесь хранятся классы для новых игровых механик,
// таких как свиньи и кормушки.

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
}

