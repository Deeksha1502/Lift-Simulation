let lifts = [];
let floors = 0;

function initializeSimulation() {
  const floorCount = parseInt(document.getElementById('floorCount').value);
  const liftCount = parseInt(document.getElementById('liftCount').value);

  if (isNaN(floorCount) || isNaN(liftCount) || floorCount < 1 || liftCount < 0) {
    alert('Please enter the floor and lift value greater than or equal to 1 ');
    return;
  }

  floors = floorCount;
  lifts = [];
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

  const availableLift = lifts.find((lift) => !lift.isMoving);

  if (targetFloor === 1) {
    openDoors(availableLift);
  }

  if (availableLift) {
    moveLift(availableLift, targetFloor, direction);
  } else {
    console.log('.');

    if (button) {
      button.disabled = false;
    }
  }
}

function moveLift(lift, targetFloor, direction) {
  if (lift.isMoving || targetFloor === lift.currentFloor) return;
  lift.isMoving = true;
  lift.targetFloor = targetFloor;
  lift.direction = direction;

  const moveTime = Math.abs(targetFloor - lift.currentFloor) * 2000;
  lift.element.style.transition = `bottom ${moveTime}ms ease-in-out`;
  lift.element.style.bottom = `${(targetFloor - 1) * 100}px`;

  setTimeout(() => {
    lift.currentFloor = targetFloor;
    openDoors(lift);

    const upButton = document.getElementById(`up-${targetFloor}`);
    const downButton = document.getElementById(`down-${targetFloor}`);
    if (upButton) upButton.disabled = false;
    if (downButton) downButton.disabled = false;
  }, moveTime);
}

function openDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.add('open');
  setTimeout(() => closeDoors(lift), 2000);
}

function closeDoors(lift) {
  const doors = lift.element.querySelector('.doors');
  doors.classList.remove('open');
  setTimeout(() => {
    lift.isMoving = false;
    lift.targetFloor = null;
    lift.direction = null;
  }, 500);
}
