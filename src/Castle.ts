import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { availableLoc, findResources, manhatDist, visibleEnemy, visiblePilgrims, sortByClosest } from "./utils";
import { constructCoordMessage } from './Communication';

export function handleCastle(self : any): Action | Falsy {
  if (self.me.turn === 1) {
    const karboniteMap = self.karbonite_map;
    const fuelmap = self.fuel_map;
    const resourceLocations =  findResources(karboniteMap, fuelmap);
    const karbLocations = resourceLocations[0];
    const fuelLocations = resourceLocations[1];
    for(let i = 0; i < karbLocations.length; ++i)
    {
      if(manhatDist([self.me.x, self.me.y], karbLocations[i]) < 4)
      {
        self.resourceSpots++;
      }
    }
    for(let i = 0; i < fuelLocations.length; ++i)
    {
      if(manhatDist([self.me.x, self.me.y], fuelLocations[i]) < 4)
      {
        self.resourceSpots++;
      }
    }

    initializeCastle(self);
  }

  if(self.signalQueue.length > 0) {
    checkSignals(self);
    if(self.signalQueue[0] !== undefined) {
      self.log(`Queue Length: ${self.signalQueue.length}, I am broadcasting: ${self.signalQueue[0]}`);
      self.signal(self.signalQueue[0], 1); 
    }
  }

  // Castle build pilgrims at first 2 even turns
  // if (self.me.turn < 6 && self.me.turn % 2 === 0) {
    if(self.me.turn - 1 < self.resourceSpots){
    self.signalQueue.push(orderPilgrim(self));
    self.log(`SIGNAL: ${self.signalQueue[0]}`);
    self.signal(self.signalQueue[0], 1); 
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
  if (self.karbonite >= 10 && self.me.turn >= 6) {
    self.log(`Enough karb to build..`)
    return castleBuild(self);
  }
}

  export function castleBuild(self: any): BuildAction | Falsy {
    const visionMap = self.getVisibleRobotMap();
    const buildLoc: number[] = availableLoc(self.me.x, self.me.y, visionMap, self.map);

    self.log(`Castle health: ${self.me.health}`);
    // TODO: Check for confirmation signal from pilgrim, then shift signalQueue.

     // Pilgrims have been killed off, build new ones
     const pilgrimNum = visiblePilgrims(self)
     if (pilgrimNum < 2 && buildLoc) {
      self.signalQueue.push(orderPilgrim(self));
      self.signal(self.signalQueue[0], 1); 
      self.log(`PILGRIM NUM:${pilgrimNum} Building a pilgrim at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
      return self.buildUnit(SPECS.PILGRIM, buildLoc[0], buildLoc[1]);
    }

    // Check if open location and if enough karb for prophet
    if (self.karbonite >= 25 && buildLoc) {
        // Temporarily only build 1 prophet
        self.log(`Building a prophet at (${buildLoc[0]}, ${buildLoc[1]}) turn (${self.me.turn})`);
        self.signalQueue.push(orderProphet(self));
        self.signal(self.signalQueue[0], 1);
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

function initializeCastle(self: any) {
  self.log("CaStLe InItIaLiZaTiOn");
  self.log("F I N D I N G - - R E S O U R C E S");
  const resourceLocations = findResources(self.karbonite_map, self.fuel_map);
  const myLoc = [self.me.x, self.me.y];
  self.karboniteLocs = sortByClosest(myLoc, resourceLocations[0]);
  self.fuelLocs = sortByClosest(myLoc, resourceLocations[1]);
  self.log(`CLOSEST: ${self.karboniteLocs[0]}`);
}

function orderPilgrim(self: any) {
  // Broadcast a resource location to a pilgrim.
  // Pilgrim should only listen to broadcasts once.
  // Only build as many pilgrims as there are resources (or # resources / 2)
  // Compare resource lengths. Use the bigger one. If equal, choose karbonite.
  // TODO: Make sure to replenish mining locations if a pilgrim dies.
  let resourceLoc;
  if (self.assignResCount.fuel === self.assignResCount.karb) {
    resourceLoc = self.karboniteLocs.shift();
    self.assignResCount.karb += 1;
  }
  else {
    if(self.assignResCount.karb < self.assignResCount.fuel) {
      resourceLoc = self.karboniteLocs.shift();
      self.assignResCount.karb += 1;
    }
    else {
      resourceLoc = self.fuelLocs.shift();
      self.assignResCount.fuel += 1;
    }
  }
  return constructCoordMessage(resourceLoc);
}

function orderProphet(self: any) {
  // Broadcast a resource location to a pilgrim.
  // Pilgrim should only listen to broadcasts once.
  // Only build as many pilgrims as there are resources (or # resources / 2)
  // Compare resource lengths. Use the bigger one. If equal, choose karbonite.
  // TODO: Make sure to replenish mining locations if a pilgrim dies.
  let resourceLoc;
  resourceLoc = self.karboniteLocs.shift();
  return constructCoordMessage(resourceLoc);
}


function checkSignals(self: any) {
  // Checks surrounding robots' signals.
  const visibleRobots = self.getVisibleRobots();
  for(const robot of visibleRobots) {
    if((robot.signal !== undefined || robot.signal >= 0) && robot.signal !== self.id) {
      const index = self.signalQueue.indexOf(robot.signal);
      if (index !== -1) {
        self.log("Removing a message");
        self.signalQueue.splice(index, 1);
      }
    }
  }
}