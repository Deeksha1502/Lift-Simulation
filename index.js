let lifts = [];
let floors = 0;
let requestQueue = [];

function isValidate(floorCount, liftCount) {
  if (
    floorCount == '-' ||
    floorCount == '+' ||
    liftCount == '-' ||
    liftCount == '+' ||
    liftCount == 'e' ||
    liftCount == 'e'
  ) {
    alert('Invalid input Please enter the floor and lift value greater than or equal to 1 ');
    return;
  }
}

function initializeSimulation() {
  const floorCount = parseInt(document.getElementById('floorCount').value);
  const liftCount = parseInt(document.getElementById('liftCount').value);

  if (
    isNaN(floorCount) ||
    isNaN(liftCount) ||
    floorCount < 1 ||
    liftCount < 0 ||
    isValidate(floorCount, liftCount)
  ) {
    alert('Please enter the floor and lift value greater than or equal to 1 ');
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

  const liftOnFloor = lifts.find((lift) => lift.currentFloor === targetFloor && !lift.isMoving);
  if (liftOnFloor) {
    openAndCloseDoors(liftOnFloor);
    return;
  }

  const nearestAvailableLift = findNearestAvailableLift(targetFloor);

  if (nearestAvailableLift) {
    moveLift(nearestAvailableLift, targetFloor, direction);
  } else {
    requestQueue.push({ targetFloor, direction });
  }
}

function findNearestAvailableLift(targetFloor) {
  return lifts.reduce((nearest, lift) => {
    if (lift.isMoving) return nearest;
    const distance = Math.abs(lift.currentFloor - targetFloor);
    return !nearest || distance < Math.abs(nearest.currentFloor - targetFloor) ? lift : nearest;
  }, null);
}

function moveLift(lift, targetFloor, direction) {
  lift.isMoving = true;
  lift.targetFloor = targetFloor;
  lift.direction = direction;

  const moveTime = Math.abs(targetFloor - lift.currentFloor) * 2000;
  lift.element.style.transition = `bottom ${moveTime}ms ease-in-out`;
  lift.element.style.bottom = `${(targetFloor - 1) * 100}px`;

  setTimeout(() => {
    lift.currentFloor = targetFloor;
    openAndCloseDoors(lift);
    enableButtons(targetFloors);
  }, moveTime);
}

function openAndCloseDoors(lift) {
  openDoors(lift);
  setTimeout(() => closeDoors(lift), 2000);
}

function openDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.add('open');
}

function closeDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.remove('open');
  setTimeout(() => {
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
      moveLift(availableLift, nextRequest.targetFloor, nextRequest.direction);
    }
  }
}
function enableButtons(floor) {
  const upButton = document.getElementById(`up-${floor}`);
  const downButton = document.getElementById(`down-${floor}`);
  if (upButton) upButton.disabled = false;
  if (downButton) downButton.disabled = false;
}

function enableAllButtons() {
  for (let i = 1; i <= floors; i++) {
    enableButtons(i);
  }
}
