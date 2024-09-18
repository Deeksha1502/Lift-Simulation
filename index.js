let lifts = [];
let floors = 0;
let requestQueue = [];

function initializeSimulation() {
  const floorCount = parseInt(document.getElementById('floorCount').value);
  const liftCount = parseInt(document.getElementById('liftCount').value);

  if (isNaN(floorCount) || !floorCount || floorCount < 2) {
    alert('Please enter the floor value greater than 1 ');
    return;
  }

  if (isNaN(liftCount) || !liftCount || liftCount < 1) {
    alert('Please enter the lift value greater than or equal to 1 ');
    return;
  }
  floors = floorCount;
  lifts = [];
  requestQueue = [];
  const simulation = document.getElementById('simulation');
  simulation.innerHTML = '';

  const building = createBuilding(floorCount, liftCount);
  simulation.appendChild(building);

  const liftsContainer = building.querySelector('.lifts-container');
  for (let i = 0; i < liftCount; i++) {
    const liftShaft = createLiftShaft(floorCount);
    liftsContainer.appendChild(liftShaft);
    lifts.push({
      element: liftShaft.querySelector('.lift'),
      currentFloor: 1,
      targetFloor: null,
      isMoving: false,
      direction: null,
      doorsOperating: false,
    });
  }
}

function createBuilding(floorCount) {
  const building = document.createElement('div');
  building.className = 'building';
  building.style.height = `${floorCount * 100}px`;

  const floorsContainer = document.createElement('div');
  floorsContainer.className = 'floors-container';
  building.appendChild(floorsContainer);

  for (let i = 1; i <= floorCount; i++) {
    const floor = document.createElement('div');
    floor.className = 'floor';
    floor.innerHTML = `
                    <span class="floor-text">Floor ${i}</span>
                    ${
                      i < floorCount || floorCount === 1
                        ? `<button class="up-button" onclick="callLift(${i}, 'up')" id="up-${i}">Up</button>`
                        : ''
                    }
                    ${
                      i > 1
                        ? `<button class="down-button" onclick="callLift(${i}, 'down')" id="down-${i}">Down</button>`
                        : ''
                    }
                `;
    floorsContainer.appendChild(floor);
  }

  const liftsContainer = document.createElement('div');
  liftsContainer.className = 'lifts-container';
  building.appendChild(liftsContainer);

  return building;
}

function createLiftShaft() {
  const liftShaft = document.createElement('div');
  liftShaft.className = 'lift-shaft';
  liftShaft.innerHTML = `
                <div class="lift">
                    <div class="doors">
                        <div class="door left-door"></div>
                        <div class="door right-door"></div>
                    </div>
                </div>
            `;
  return liftShaft;
}

function callLift(targetFloor, direction) {
  const button = document.getElementById(`${direction}-${targetFloor}`);
  if (button) {
    button.disabled = true;
  }

  const liftMoving = lifts.find((lift) => lift.targetFloor === targetFloor && lift.isMoving);
  if (liftMoving) {
    return;
  }

  const liftOnFloor = lifts.find(
    (lift) => lift.currentFloor === targetFloor && !lift.isMoving && !lift.doorsOperating
  );
  if (liftOnFloor) {
    openAndCloseDoors(liftOnFloor);
    return;
  }

  const nearestAvailableLift = findNearestAvailableLift(targetFloor);

  if (nearestAvailableLift) {
    prepareLiftMovement(nearestAvailableLift, targetFloor, direction);
  } else {
    requestQueue.push({ targetFloor, direction });
  }
}
function prepareLiftMovement(lift, targetFloor, direction) {
  lift.targetFloor = targetFloor;
  lift.direction = direction;
  if (lift.doorsOperating) {
    return;
  }
  if (lift.currentFloor !== targetFloor) {
    closeDoorsAndMove(lift);
  } else {
    openAndCloseDoors(lift);
  }
}

function closeDoorsAndMove(lift) {
  if (lift.doorsOperating) return;
  lift.doorsOperating = true;
  const doors = lift.element.querySelector('.doors');
  doors.classList.remove('open');
  setTimeout(() => {
    lift.doorsOperating = false;
    moveLift(lift);
  }, 2000);
}
function findNearestAvailableLift(targetFloor) {
  return lifts.reduce((nearest, lift) => {
    if (lift.isMoving || lift.doorsOperating) return nearest;
    const distance = Math.abs(lift.currentFloor - targetFloor);
    return !nearest || distance < Math.abs(nearest.currentFloor - targetFloor) ? lift : nearest;
  }, null);
}

function moveLift(lift) {
  lift.isMoving = true;
  const targetFloor = lift.targetFloor;

  const moveTime = Math.abs(targetFloor - lift.currentFloor) * 3500;
  lift.element.style.transition = `bottom ${moveTime}ms ease-in-out`;
  lift.element.style.bottom = `${(targetFloor - 1) * 100}px`;

  setTimeout(() => {
    lift.currentFloor = targetFloor;
    lift.isMoving = false;
    openAndCloseDoors(lift);

    // enableButtons(targetFloor);
  }, moveTime);
}

function openAndCloseDoors(lift) {
  if (lift.doorsOperating) return;
  lift.doorsOperating = true;
  openDoors(lift);
  setTimeout(() => closeDoors(lift), 3000);
}

function openDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.add('open');
}

function closeDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.remove('open');
  setTimeout(() => {
    lift.doorsOperating = false;
    resetLiftState(lift);
    checkQueue();
    enableButtons(lift.currentFloor);
  }, 500);
}

function resetLiftState(lift) {
  lift.isMoving = false;
  lift.targetFloor = null;
  lift.direction = null;
}

function checkQueue() {
  if (requestQueue.length > 0) {
    const availableLift = findNearestAvailableLift(requestQueue[0].targetFloor);
    if (availableLift) {
      const nextRequest = requestQueue.shift();

      setTimeout(() => {
        prepareLiftMovement(availableLift, nextRequest.targetFloor, nextRequest.direction);
      }, 0);
    }
  }
}
function enableButtons(floors) {
  for (let i = 1; i <= floors; i++) {
    const upButton = document.getElementById(`up-${i}`);
    const downButton = document.getElementById(`down-${i}`);
    if (upButton) upButton.disabled = false;
    if (downButton) downButton.disabled = false;
  }
}

function enableAllButtons() {
  enableButtons(floors);
}
