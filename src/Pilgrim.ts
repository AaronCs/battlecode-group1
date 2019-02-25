import { availableLoc, closestMiningLocation, findClosestFriendlyCastles, simplePathFinder, visiblePilgrims } from "./utils";
import { parseMessage, constructCoordMessage } from "./Communication";

const KARBONITE = 1
const FUEL = 2

export function handlePilgrim(self: any): Action | Falsy {
    self.log(" > > > PILGRIM TIME > > >");
    // let action: Action | Falsy = undefined;
    const visibleRobots = self.getVisibleRobotMap();
    if (self.me.turn === 1) {
      initializePilgrim(self);
    }

    if (self.destination === undefined) {
      if (self.resourceLocation[0] === -1 && self.resourceLocation[1] === -1) {
        readCastleSignal(self);
      }
      /*
      if(self.resourceLocation === undefined) {
        findDiffMining(self);
      }
      */
      self.log(`MY DEST IS ${self.resourceLocation}`)
      self.destination = self.resourceLocation;
      const robotMap = self.getVisibleRobotMap();
      self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
      self.goMining = true;
      // self.log(` > > > CLOSEST MINING SPOT AT ${self.destination}> > >`);
    }

    let full;
	
    if (self.me.karbonite === 20 || self.me.fuel === 100) {
      full = true;
      // TODO: Make pilgrim walk back to castle if inventory is full.
      self.log("---FULL INVENTORY, RETURNING TO BASE---");
      self.goMining = false;
      const castleToGo = self.originalCastleLoc;
      /*
      let closestCastle = findClosestFriendlyCastles(self);
      if (closestCastle === undefined) {
        // closestCastle = self.originalCastleLoc;
        self.log("CLOSEST CASTLE ++++++" + self.originalCastleLoc);
        castleToGo = self.originalCastleLoc;
      }
      else{
        castleToGo = [closestCastle.x, closestCastle.y];
      }
      */

      // const dx = closestCastle.x - self.me.x;
      // const dy = closestCastle.y - self.me.y;
      const dx = castleToGo[0] - self.me.x;
      const dy = castleToGo[1] - self.me.y;

      const dist = Math.pow(dx, 2) + Math.pow(dy, 2);

      // If castle is in adjacent square, give resources
      if (dist <= 2) {
        self.log(`GIVING RESOURCES TO CASTLE [${dx},${dy}] AWAY`);
        self.destination = undefined;
        return self.give(dx, dy, self.me.karbonite, self.me.fuel);
      }
      
      // Not near castle, set destination queue to nav to base
      const validLoc = availableLoc(self.me.x, self.me.y, visibleRobots, self.map);
      // self.destination = [closestCastle.x + validLoc[0], closestCastle.y + validLoc[1]];
      self.destination = [castleToGo[0] + validLoc[0], castleToGo[1] + validLoc[1]];
      self.log("DESTINATION TO RETURN TO CASTLE:::" + self.destination);
      self.destinationQueue = simplePathFinder(self.map, visibleRobots,[self.me.x, self.me.y], self.destination);
      self.log(` > > > MY LOCATION (${self.me.x}, ${self.me.y})> > >`);
      self.log(` > > > CLOSEST CASTLE AT ${self.destination}> > >`);
    }

    // Mine or set mining location to destination if not full and at location
    if (self.me.x === self.destination[0] && self.me.y === self.destination[1] && !full) {
      // If on destination and is going mining, mine.
      if (self.goMining === true) {
        self.log("CURRENTLY MINING");
        return (self.mine());
      }
      self.destination = undefined;
    }

    if(visibleRobots[self.destination[1]][self.destination[0]] > 0 && !full) {
      self.log("I AM A DUMB ROBOT")
      // findDiffMining(self);
      // TODO: Make path finder faster
      // TODO: Keep track of occupied mining locations.
      // self.destinationQueue = simplePathFinder(self.map, visibleRobots,[self.me.x, self.me.y], self.destination);
    }

    // Move to destination
    if (self.destinationQueue.length !== 0) {
      // If the destination queue has coordinates and my current location is the 
      // same as my next move's location, then pop next destination and set nextMove to it.
      if(self.runPathAgain === 1)
      {
        self.log("DO NOTHING");
        self.runPathAgain = 0;
        self.log("NEXT MOVE =======" + self.nextMove);
      }
      else{
        self.nextMove = self.destinationQueue.pop();
        self.log("NEXT MOVE =======" + self.nextMove);
      }
      if(visibleRobots[self.nextMove[1]][self.nextMove[0]] > 0) {
        self.log("THERE'S A DUMB ROBOT IN THE WAY");
        self.runPathAgain = 1;
        return null;
        self.destinationQueue = simplePathFinder(self.map, visibleRobots,[self.me.x, self.me.y], self.destination);
        self.destinationQueue.pop();
        self.nextMove = self.destinationQueue.pop();
        self.log("ROBOTO IN WAY NEXT MOVE IS NOW::::" + self.nextMove);
        self.log(`Destination: ${self.destination}, QUEUE: ${self.destinationQueue.reverse()}`)
      }

      const moveX = self.nextMove[0] - self.me.x;
      const moveY = self.nextMove[1] - self.me.y;
      self.log(`> > > Next Move: ${self.nextMove} > > >`)
      self.log(`> > > MOVING ${moveX}, ${moveY} > > >`)
      return self.move(moveX, moveY);
    }
  }

// Sets pilgrims' initial mining job
export function initializePilgrim(self: any) {
    self.log("> > > FINDING THINGS > > >");
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    // self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`)
    const castle = findClosestFriendlyCastles(self);
    self.originalCastleLoc = [castle.x, castle.y];
    self.resourceLocation = parseMessage(castle.signal);
    // self.resourceLocation = [0, 0];
    self.log(`MESSAGE: ${castle.signal}`);
    self.log(`LOC: ${self.resourceLocation}`);
    self.log("RESOURCE LOCATION:::" + self.resourceLocation);
    if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
      const message = constructCoordMessage(self.resourceLocation);
      self.signal(message, 1);
    }
    // self.log(`VISPILGS < 1: ${visiblePilgrims(self) < 1} RESRC LOC: ${self.resourceLocation}, pilnum${visiblePilgrims(self)}`);
}

function readCastleSignal(self: any) {
    const castle = findClosestFriendlyCastles(self);
    self.resourceLocation = parseMessage(castle.signal);
    if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
      const message = constructCoordMessage(self.resourceLocation);
      self.signal(message, 1);
    }
}

export function findDiffMining(self: any) {
    // It's like initializePilgrim, but the opposite.
    const visibleRobots = self.getVisibleRobotMap();
    // 1st pilgrim mines karbonite. 2nd pilgrim mines fuel
    // Even pilgrims mine karbonite, odd pilgrims mine fuel.
    self.resourceToMine = (self.resourceToMine === KARBONITE) ? FUEL : KARBONITE;
    self.log(`I AM PILGRIM NUMBER: ${visiblePilgrims(self)}`)
    self.resourceLocation = ((self.resourceToMine === KARBONITE)) ?
        closestMiningLocation([self.me.x, self.me.y], self.karbonite_map, visibleRobots) :
        closestMiningLocation([self.me.x, self.me.y], self.fuel_map, visibleRobots);
}

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}