import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { availableLoc, visibleEnemy, visiblePilgrims } from "./utils";

export function handleCastle(self : any): Action | Falsy {
    // Castle build pilgrims at first 2 turns
    if (self.me.turn < 3) {
      self.log(`TURN: ${self.me.turn}`)
      const buildLoc: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
      // Have each castle build pilgrims in first 2 turns
      if (buildLoc){
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
      }
    }

    // Check for enemies first
    if (visibleEnemy(self.getVisibleRobots(), self.me.team)){
      const attackCoords = attackFirst(self);
      if (attackCoords) {
        self.log(`Visible enemy robot in attack range at (${attackCoords[0]}, ${attackCoords[0]})`);
        self.log(`ATTACKING!`);
        return self.attack(attackCoords[0], attackCoords[1]);
      }
      self.log(`Visible enemy robot is out of attack range`);
    }
    // Check if enough karb to build
    if (self.karbonite >= 10) {
      self.log(`Enough karb to build..`)
      return castleBuild(self);
    }
  }

  export function castleBuild(self: BCAbstractRobot): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap, self.map);

    self.log(`Castle health: ${self.me.health}`);

     // Pilgrims have been killed off, build new ones
     const pilgrimNum = visiblePilgrims(self)
     if (pilgrimNum < 2 && buildLoc) {
        self.log(`PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and if enough karb for prophet
    if (self.karbonite >= 25 && buildLoc) {
        // Temporarily only build 1 prophet
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PROPHET, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and enough karb for pilgrim 
	/*
    else if (self.karbonite >= 10 && buildLoc && (self.me.turn % 1000)){
        self.log(`Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }
	*/
}