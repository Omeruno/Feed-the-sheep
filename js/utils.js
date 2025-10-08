// ==================================================================
// ==                                                              ==
// ==               ОБРАБОТЧИКИ СОБЫТИЙ И УТИЛИТЫ                  ==
// ==                                                              ==
// ==================================================================
// В этом файле находится логика, отвечающая за реакцию на действия
// игрока (клики, движение мыши) и другие вспомогательные функции.

function handleGameClick(event) {
    if (!isMusicStarted) { 
        isMusicStarted = true; 
        updateMusicState(CYCLE_STAGES[currentStageIndex]?.isNight || false);
    }
    
    const px = event.clientX - GAME_DIMENSIONS.left;
    const py = event.clientY - GAME_DIMENSIONS.top;
    
    if (isDialogueActive) {
        // Позволяем сажать траву во время обучения, если активен этот шаг
        if (currentTool === 'grass') {
            spawnGrass(px, py);
            // Если трава была посажена, можно автоматически перейти к следующему шагу
            if (grassPatches.length > 0) {
                 // Возможно, стоит добавить задержку или условие, чтобы не переключаться мгновенно
            }
        }
        return; // Блокируем остальные клики во время диалога
    }


    if (isPlacing) {
        placeBuilding(px, py);
        return;
    }
    
    if (currentTool === 'grass') spawnGrass(px, py); 
    else if (currentTool === 'hay') spawnHay(px,py);
    else if (currentTool === 'piggy_food') {
        if (pigFoodCount > 0) {
            const clickedTrough = troughs.find(t => px >= t.x && px <= t.x + t.width && py >= t.y && py <= t.y + t.height);
            if (clickedTrough && !clickedTrough.isFull()) {
                pigFoodCount--;
                clickedTrough.fill();
                updateResourceCounters();
                updateInventoryButtons();
            }
        } else { showPlayerMessage('no_food'); }
    }
}

function handleGameMouseMove(event) {
    if (isPlacing && placementGhost) {
        const px = event.clientX - GAME_DIMENSIONS.left;
        const py = event.clientY - GAME_DIMENSIONS.top;
        
        let width, height;
        if (isPlacing === 'sawmill') {
            width = sawmillConfig.width;
            height = sawmillConfig.height;
        } else if (isPlacing === 'rock') {
            width = rockConfig.width;
            height = rockConfig.height;
        } else if (isPlacing === 'trough') {
            width = 45;
            height = 30;
        }

        const ghostX = clamp(px - width/2, 0, GAME_DIMENSIONS.width - width);
        const ghostY = clamp(py - height/2, 0, GAME_DIMENSIONS.height - height);
        
        placementGhost.style.transform = `translate(${ghostX}px, ${ghostY}px)`;

        const isValid = checkPlacementValidity(ghostX, ghostY, width, height);
        placementGhost.classList.toggle('invalid', !isValid);
    }
}


function createPlacementGhost() {
    if (placementGhost) placementGhost.remove();

    placementGhost = document.createElement('img');
    placementGhost.className = 'placement-ghost';
    
    if (isPlacing === 'sawmill') {
        placementGhost.src = SAWMILL_ICON_SRC;
        placementGhost.style.width = `${sawmillConfig.width}px`;
        placementGhost.style.height = `${sawmillConfig.height}px`;
    } else if (isPlacing === 'rock') {
        placementGhost.src = ROCK_ICON_SRC;
        placementGhost.style.width = `${rockConfig.width}px`;
        placementGhost.style.height = `${rockConfig.height}px`;
    } else if (isPlacing === 'trough') {
        placementGhost.src = TROUGH_ICON_SRC;
        placementGhost.style.width = '45px';
        placementGhost.style.height = '30px';
    }

    gameWorld.appendChild(placementGhost);
}

function checkPlacementValidity(x, y, width, height) {
    const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
    if (y < walkableTop) return false;

    const newRect = { x, y, width, height };

    if (currentHouse && checkOverlap(newRect, currentHouse.getRect())) return false;
    if (sawmillArea && checkOverlap(newRect, sawmillArea.getRect())) return false;
    if (rockArea && checkOverlap(newRect, rockArea.getRect())) return false;
    for (const trough of troughs) {
        if (checkOverlap(newRect, trough.getRect())) return false;
    }

    return true;
}

function placeBuilding(px, py) {
    let width, height, config;
    if (isPlacing === 'sawmill') {
        config = sawmillConfig;
    } else if (isPlacing === 'rock') {
        config = rockConfig;
    } else if (isPlacing === 'trough') {
        width = 45;
        height = 30;
    }
    
    if(config) {
      width = config.width;
      height = config.height;
    }

    const placeX = clamp(px - width/2, 0, GAME_DIMENSIONS.width - width);
    const placeY = clamp(py - height/2, 0, GAME_DIMENSIONS.height - height);

    if (!checkPlacementValidity(placeX, placeY, width, height)) {
        showPlayerMessage('cant_place_here');
        return;
    }

    if (isPlacing === 'sawmill') {
        sawmillArea = new ResourceArea(sawmillConfig, placeX, placeY);
        sawmillToPlace--;
    } else if (isPlacing === 'rock') {
        rockArea = new ResourceArea(rockConfig, placeX, placeY);
        rockToPlace--;
    } else if (isPlacing === 'trough') {
        troughs.push(new Trough(placeX, placeY));
        troughToPlace--;
    }
    
    if (placementGhost) placementGhost.remove();
    placementGhost = null;
    isPlacing = null;
    
    setActiveTool(null);
    updateInventoryButtons();
    updateShopUI();
}

function setActiveTool(toolName) {
    playSound(clickSound);
    
    if (isPlacing && isPlacing !== toolName) {
        isPlacing = null;
        if(placementGhost) placementGhost.remove();
        placementGhost = null;
    }
    
    if (toolName === null) {
        currentTool = null;
        isPlacing = null;
        if(placementGhost) {
            placementGhost.remove();
            placementGhost = null;
        }
        document.body.style.cursor = 'default';
        document.querySelectorAll('.tool-button').forEach(btn => btn.classList.remove('active'));
        return;
    }

    if (toolName === 'sawmill' && sawmillToPlace <= 0) { showPlayerMessage('no_item'); return; }
    if (toolName === 'rock' && rockToPlace <= 0) { showPlayerMessage('no_item'); return; }
    if (toolName === 'trough' && troughToPlace <= 0) { showPlayerMessage('no_item'); return; }
    if (toolName === 'piggy_food' && pigFoodCount <= 0) { showPlayerMessage('no_item'); return; }
    if (toolName === 'repair' && !hasRepairHammer) { showPlayerMessage('no_item'); return; }
    
    currentTool = toolName;

    if (['sawmill', 'rock', 'trough'].includes(toolName)) {
        isPlacing = toolName;
        createPlacementGhost();
    }
    
    const toolButtons = { 'grass': grassButton, 'hay': hayButton, 'repair': repairButton, 'trough': troughButton, 'piggy_food': piggyFoodButton, 'sawmill': sawmillButton, 'rock': rockButton };
    
    let cursorUrl = 'default';
    if(toolButtons[toolName]) {
        // Получаем URL из CSS свойства
        const style = window.getComputedStyle(toolButtons[toolName]);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            cursorUrl = bgImage.slice(4, -1).replace(/"/g, "");
        }
    }
    document.body.style.cursor = `url('${cursorUrl}'), auto`;

    Object.values(toolButtons).forEach(btn => btn.classList.remove('active'));
    if (toolButtons[toolName]) toolButtons[toolName].classList.add('active');
}

