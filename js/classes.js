// ==================================================================
// ==                       КЛАССЫ ОБЪЕКТОВ                        ==
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
        maxAnimals = this.capacity;

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
        maxAnimals = BASE_ANIMAL_CAPACITY;
        [...sheep, ...chickens].forEach(animal => {
            animal.isHiding = false;
            animal.element.style.visibility = 'visible';
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

class Chicken {
    constructor() {
        this.element = document.createElement('img');
        this.element.className = 'chicken';
        this.element.src = chickenSprites.front;
        gameWorld.appendChild(this.element);

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
        this.targetX = this.x; this.targetY = this.y; this.isWaiting = true; this.isEating = false; this.isScared = false; this.isHiding = false;
        this.waitTimer = setTimeout(() => this.decideNextAction(), Math.random() * MAX_WAIT_TIME);
    }

    decideNextAction() {
        this.isWaiting = false;
        clearTimeout(this.waitTimer);
        this.findNewTarget();
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
                return;
            }
        }

        if (Math.random() < CHICKEN_EGG_CHANCE * deltaTime) {
            spawnEgg(this.x, this.y);
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
            const moveX = (dx / distanceToTarget) * CHICKEN_SPEED * deltaTime;
            const moveY = (dy / distanceToTarget) * CHICKEN_SPEED * deltaTime;
            this.x += moveX;
            this.y += moveY;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.element.src = dx > 0 ? chickenSprites.right : chickenSprites.left;
            } else {
                this.element.src = dy > 0 ? chickenSprites.front : chickenSprites.back;
            }
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
        this.targetAnimal = this.findTarget();
        this.targetHouse = null;
        this.isScared = false;
        this.isCapturing = false;
        this.isAttacking = false;
        this.isDragging = false; 
        this.draggedAnimal = null; 
        this.element.addEventListener('pointerdown', () => this.scare());
    }

    findTarget() {
        const availableAnimals = [...sheep, ...chickens].filter(a => !a.isScared && !a.isHiding);
        return availableAnimals.length > 0 ? availableAnimals[Math.floor(Math.random() * availableAnimals.length)] : null;
    }

    update(deltaTime) {
        const isNight = currentStageIndex >= 3;
        if (isNight && currentHouse && [...sheep, ...chickens].some(a => a.isHiding)) {
            this.targetHouse = currentHouse;
            this.targetAnimal = null;
        } else {
            this.targetHouse = null;
            if (!this.targetAnimal || this.targetAnimal.isScared || this.targetAnimal.isHiding) {
                this.targetAnimal = this.findTarget();
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
                    if (this.draggedAnimal.hungerIcon) this.draggedAnimal.hungerIcon.remove();
                }
                const wolfIndex = wolves.indexOf(this);
                if (wolfIndex > -1) wolves.splice(wolfIndex, 1);
                
                let sheepIndex = sheep.indexOf(this.draggedAnimal);
                if (sheepIndex > -1) sheep.splice(sheepIndex, 1);

                let chickenIndex = chickens.indexOf(this.draggedAnimal);
                if (chickenIndex > -1) chickens.splice(chickenIndex, 1);

                if (sheep.length === 0 && chickens.length === 0) {
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
            targetX = GAME_DIMENSIONS.width / 2;
            targetY = GAME_DIMENSIONS.height * 0.8;
        }

        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15 && (this.targetAnimal || this.targetHouse)) {
            if (this.targetHouse) this.attackHouse(this.targetHouse);
            else if (this.targetAnimal) this.capture(this.targetAnimal);
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
        
        if (target instanceof Chicken) {
            playSound(chickenSound);
        } else {
            playSound(wolfAttackSound);
        }

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
