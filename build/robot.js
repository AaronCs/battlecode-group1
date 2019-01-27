import { SPECS, BCAbstractRobot } from 'battlecode';

// const Attack = {};
// Attack.attackFirst = (self) =>
function attackFirst(self) {
  // Get all visible robots within the robots vision radius
  const visibleRobots = self.getVisibleRobots();
  // Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range\
  const listLength = visibleRobots.length;
  // let x = 0; // keep track of number of robots in attackableRobots array
  let i;
  for (i = 0; i < listLength; ++i) {
    const rob = visibleRobots[i];
    // Check if the robot just showed up because of radio broadcast
    if (!self.isVisible(rob)) {
      continue;
    }
    // Check if robot is friendly
    if (self.me.team === rob.team) {
      continue;
    }
    self.log('ROBOT: ' + rob.id + ' is an enemy within vision');
    const dist =
      Math.pow(rob.x - self.me.x, 2) + Math.pow(rob.y - self.me.y, 2);
    if (
      SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist &&
      dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1]
    ) {
      self.log('CAN ATTACK ROBOT:' + rob.id);
      const robotToAttack = new Array(2);
      robotToAttack[0] = rob.x - self.me.x;
      robotToAttack[1] = rob.y - self.me.y;
      return robotToAttack;
    }
  }
}

function castleBuild(self) {
  const units = [1, 2, 3, 4];
  const buildLoc = self.randomValidLoc();
  self.log(`Castle health: ${self.me.health}`);
  // Repeat while castle has enough karbonite for at least one pilgrim
  while (self.karbonite >= 10) {
    const unitToBuild = units[Math.floor(Math.random() * units.length)];
    switch (unitToBuild) {
      case 1: {
        if (self.karbonite >= 10) {
          self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
        }
      }
      case 2: {
        if (self.karbonite >= 20) {
          self.log(`Building a crusader at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.CRUSADER, buildLoc[0], buildLoc[1]);
        }
      }
      case 3: {
        if (self.karbonite >= 25) {
          self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
        }
      }
      case 4: {
        if (self.karbonite >= 30) {
          self.log(`Building a preacher at (${buildLoc[0]}, ${buildLoc[1]})`);
          return self.buildUnit(SPECS.PREACHER, buildLoc[0], buildLoc[1]);
        }
      }
    }
  }
}
function pilgrimBuild(self) {
  self.log(`Pilgrim health: ${self.me.health}`);
  // Robot needs to be carrying resources to be able to build
}

class MyRobot extends BCAbstractRobot {
  constructor() {
    super(...arguments);
    this.step = 0;
    this.adjChoices = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];
  }
  turn() {
    this.step++;
    const choice = this.randomValidLoc();
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        this.log(`Pilgrim health: ${this.me.health}`);
        if (this.step % 2 === 0) {
          return pilgrimBuild(this);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.CRUSADER: {
        this.log(`Crusader health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.PROPHET: {
        this.log(`Prophet health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.PREACHER: {
        this.log(`Preacher health: ${this.me.health}`);
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
        return this.move(choice[0], choice[1]);
      }
      case SPECS.CASTLE: {
        // If castle can't build, it tries to attack
        if (this.karbonite >= 10) {
          return castleBuild(this);
        }
        const attackingCoordinates = attackFirst(this);
        if (attackingCoordinates) {
          return this.attack(attackingCoordinates[0], attackingCoordinates[1]);
        }
      }
    }
  }
  randomValidLoc() {
    // TODO: Possibly check if a unit is in the desired space for movement?
    const mapDim = this.map[0].length;
    let rand = Math.floor(Math.random() * this.adjChoices.length);
    let loc = this.adjChoices[rand];
    let counter = 0;
    do {
      if (this.me.y + loc[1] >= mapDim) {
        loc[1] = -1;
      }
      if (this.me.y + loc[1] < 0) {
        loc[1] = 1;
      }
      if (this.me.x + loc[0] >= mapDim) {
        loc[0] = -1;
      }
      if (this.me.x + loc[0] < 0) {
        loc[0] = 1;
      }
      rand = (rand + 1) % this.adjChoices.length;
      counter++;
    } while (
      !this.map[this.me.y + loc[1]][this.me.x + loc[0]] &&
      counter < this.adjChoices.length
    );
    if (counter >= this.adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }
  simpleValidLoc() {
    let i = 0;
    while (
      !this.map[this.me.y + this.adjChoices[i][1]][
        this.me.x + this.adjChoices[i][0]
      ] &&
      i < this.adjChoices.length
    ) {
      // Makes sure the terrain is passable.
      // this.map is indexed as [y][x]
      i++;
    }
    return this.adjChoices[i];
  }
}
// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();
