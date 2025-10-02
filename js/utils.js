// ==================================================================
// ==                                                              ==
// ==        ОБРАБОТЧИКИ СОБЫТИЙ И ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ         ==
// ==                                                              ==
// ==================================================================
// Этот файл содержит логику для взаимодействия с пользователем:
// клики, перемещение мыши, управление инвентарем и т.д.

function handleGameClick(event) {
    // Если активен инструмент для размещения, вызываем функцию строительства
    if (isPlacing) {
        placeBuilding(event);
        return;
    }
    
    // Если выбран другой инструмент (не для размещения)
    if (currentTool) {
        const px = event.clientX - GAME_DIMENSIONS.left;
        const py = event.clientY - GAME_DIMENSIONS.top;
        
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
}

function handleGameMouseMove(event) {
    if (isPlacing && placementGhost) {
        const px = event.clientX - GAME_DIMENSIONS.left;
        const py = event.clientY - GAME_DIMENSIONS.top;
        
        let width, height;
        if (isPlacing === 'trough') { width = 45; height = 30; }
        else if (isPlacing === 'sawmill') { width = 100; height = 80; }
        else if (isPlacing === 'rock') { width = 80; height = 60; }

        placementGhost.style.transform = `translate(${px - width / 2}px, ${py - height / 2}px)`;

        // Проверка на валидность размещения
        const ghostRect = { x: px - width / 2, y: py - height / 2, width, height };
        const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
        let isValid = true;
        
        if (py - height / 2 < walkableTop) isValid = false;
        
        const allObjects = [currentHouse, sawmillArea, rockArea, ...troughs].filter(Boolean);
        for(const obj of allObjects) {
            if (checkOverlap(ghostRect, obj.getRect())) {
                isValid = false;
                break;
            }
        }

        placementGhost.classList.toggle('invalid', !isValid);
    }
}


function createPlacementGhost() {
    if (placementGhost) placementGhost.remove();
    placementGhost = document.createElement('img');
    placementGhost.className = 'placement-ghost';
    
    if (isPlacing === 'trough') {
        placementGhost.src = TROUGH_ICON_SRC;
        placementGhost.style.width = '45px';
    } else if (isPlacing === 'sawmill') {
        placementGhost.src = SAWMILL_ICON_SRC;
        placementGhost.style.width = '100px';
    } else if (isPlacing === 'rock') {
        placementGhost.src = ROCK_ICON_SRC;
        placementGhost.style.width = '80px';
    }
    
    gameWorld.appendChild(placementGhost);
}


function placeBuilding(event) {
    const px = event.clientX - GAME_DIMENSIONS.left;
    const py = event.clientY - GAME_DIMENSIONS.top;

    let width, height;
    if (isPlacing === 'trough') { width = 45; height = 30; }
    else if (isPlacing === 'sawmill') { width = 100; height = 80; }
    else if (isPlacing === 'rock') { width = 80; height = 60; }
    
    const x = px - width / 2;
    const y = py - height / 2;
    const rect = { x, y, width, height };
    const walkableTop = GAME_DIMENSIONS.height * WALKABLE_TOP_RATIO;
    let canPlace = true;

    if (y < walkableTop) canPlace = false;

    const allObjects = [currentHouse, sawmillArea, rockArea, ...troughs].filter(Boolean);
    for(const obj of allObjects) {
        if (checkOverlap(rect, obj.getRect())) {
            canPlace = false;
            break;
        }
    }

    if (canPlace) {
        if (isPlacing === 'trough') {
            troughs.push(new Trough(x, y));
            troughToPlace--;
        } else if (isPlacing === 'sawmill') {
            sawmillArea = new ResourceArea(sawmillConfig, x, y);
            sawmillToPlace--;
        } else if (isPlacing === 'rock') {
            rockArea = new ResourceArea(rockConfig, x, y);
            rockToPlace--;
        }
        
        updateInventoryButtons();
        setActiveTool(null); // Сбрасываем инструмент после установки
    } else {
        showPlayerMessage('cant_place_here');
    }
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
        if(placementGhost) placementGhost.remove();
        placementGhost = null;
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
    if(toolButtons[toolName] && toolButtons[toolName].style.backgroundImage) {
        cursorUrl = toolButtons[toolName].style.backgroundImage.slice(4, -1).replace(/"/g, "");
    }
    document.body.style.cursor = (cursorUrl && cursorUrl !== 'none') ? `url('${cursorUrl}'), auto` : 'default';

    Object.values(toolButtons).forEach(btn => btn.classList.remove('active'));
    if (toolButtons[toolName]) toolButtons[toolName].classList.add('active');
}

