import { SPECS } from 'battlecode';
import { attackFirst, rushCastle } from "./Attack";
import { availableLoc, enemyCastle, horizontalFlip, manhatDist, simplePathFinder, findClosestFriendlyCastles } from "./utils"
import { parseMessage, constructCoordMessage } from "./Communication";

export function handleProphet(self: any): Action | Falsy {
		 // const choice: number[] = availableLoc(this.me.x, this.me.y, this.getVisibleRobotMap(), this.map);
		 const visibleRobots = self.getVisibleRobotMap();
    if (self.me.turn === 1) {
      self.log("> > PROPHET FIRST TURN > >")
      const robotMap = self.getVisibleRobotMap();
      const listLength = visibleRobots.length;
      for (let i = 0; i < listLength; ++i) {
        const rob = visibleRobots[i];
        if (rob.unit === SPECS.CASTLE) {
          const horizontal = horizontalFlip(self);
          const enemyCastleLoc = enemyCastle([rob.x, rob.y], self.map, horizontal);
		  	self.friendlyCastleLoc.push([rob.x, rob.y]);
          self.enemyCastleLoc.push(enemyCastleLoc);
          // self.destination = self.enemyCastleLoc[self.enemyCastleNum];
          // self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
          self.log("CASTLE LOCATION - PROPHET" + self.enemyCastleLoc[self.enemyCastleNum][0] + ", " + self.enemyCastleLoc[self.enemyCastleNum][1]);
        }
			}
			
			const castle = findClosestFriendlyCastles(self);
			self.resourceLocation = parseMessage(castle.signal);
			self.destination = undefined;
			self.log("MESSAGE::: " + castle.signal);
			self.log("LOC:    " + self.resourceLocation);
			if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
				const message = constructCoordMessage(self.resourceLocation);
				self.signal(message, 1);
			}
			
		}
	    // this.log(`Prophet health: ${this.me.health}`);
			const attackingCoordinates = attackFirst(self);

			if (attackingCoordinates) {
				return self.attack(attackingCoordinates[0], attackingCoordinates[1]);
			}
		
		if(self.destination === undefined)
		{
			self.log("DESTINATIONDSADASDSA");
			if(self.resourceLocation[0] === -1 && self.resourceLocation[1] === -1)
			{
				readCastleSignal(self);
			}
			
			self.destination = self.resourceLocation;
			const robotMap = self.getVisibleRobotMap();
			self.destinationQueue = simplePathFinder(self.map, robotMap, [self.me.x, self.me.y], self.destination);
			
		}

    if (self.destinationQueue.length !== 0) {
			self.log("DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
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


		


	// return checkerBoardMovement(self);
	// return rushMovement(self);
}
   
 function rushMovement(self:any) {
    if (self.runPathAgain > 1) {
      const choice: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
	  self.runPathAgain--;
      return self.move(choice[0], choice[1]);
    }
	else if(self.runPathAgain === 1)
	{
      self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
	  self.runPathAgain--;
	}

    if (self.enemyCastleLoc !== null && (self.destinationQueue !== undefined && self.destinationQueue.length !== 0)) {
      const toMove = rushCastle(self, self.destination, self.destinationQueue);
      if (toMove === null) {
        self.runPathAgain = 2;
      }
      else {
        return self.move(toMove[0], toMove[1]);
      }
    }

    if (self.destinationQueue.length === 0) {
      self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
    }

    const choicer: number[] = availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map);
	return self.move(choicer[0], choicer[1]);
}


function checkerBoardMovement(self:any) {

	const formation: number[][] =
	[[-1,-1],
	[1, -1],
	[1, 1],
	[-1, 1]];

	if(self.checkerBoardSpot === undefined) {
		self.checkerBoardSpot = firstSpot(self);
	}


	if(self.map[self.destination[1]][self.destination[0]] === false)
	{
		self.log("DESTINATION IMPASSABLE" + "     " + self.destination);
		return null;
	}

	const visionMap = self.getVisibleRobotMap();
			self.log("SELF.DESTINATION:::::" + self.destination);
		self.log("visionMap " + visionMap[self.destination[1]][self.destination[0]]);
	if(self.me.x === self.destination[0] && self.me.y === self.destination[1])
	{
		self.log("AT DESTINATION");
		return null;
	}
	else if(visionMap[self.destination[1]][self.destination[0]] > 0)
	{
		const firstX = self.destination[0];
		const firstY = self.destination[1];
		self.visitedBots.push(visionMap[firstY][firstX]);
		let i;
		for(i = 0; i < 4; ++i)
		{
			const newX = firstX + formation[i][0];
			const newY = firstY + formation[i][1];
			// Make sure unit is also not going to a karbonite or fuel tile
			let resourceCheck = true;
			if(self.karbonite_map[newY][newX] === true || self.fuel_map[newY][newX] === true)
			{resourceCheck = false;}

			// Make sure that it is not too close to the CASTLE
			const dist = manhatDist(self.friendlyCastleLoc[0], [newX, newY]);
			let distCheck = true;
			if(dist < 3)
			{distCheck = false;}

			if(newX < 0 || newY < 0 )
			{continue;}

			if(visionMap[newY][newX] === 0 && self.map[newY][newX] === true && resourceCheck === true && distCheck === true)
			{
				self.log("HELLLLOOOOOO : : : " + newX  + ", " + newY);
				self.destination[0] = newX;
				self.destination[1] = newY;
				i = 5;
				self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
				self.destinationQueue.pop();
			}
			if(i === 3)
			{
				let x;
				self.log("NO NEW SPACES AVAILABLE CHANGE DESTINATION");
				for(x = 0; x < 4; ++x)
				{
					const nextpointX = firstX + formation[x][0];
					const nextpointY = firstY + formation[x][1];
					if(nextpointX === 0 || nextpointY === 0 || nextpointX === self.map.length-1 || nextpointY === self.map.length-1)
					{continue;}

					let resourceChecks = true;
					if(self.karbonite_map[nextpointY][nextpointX] === true || self.fuel_map[nextpointY][nextpointX] === true)
					{resourceChecks = false;}

					// Make sure that it is not too close to the CASTLE
					const disti = manhatDist(self.friendlyCastleLoc[0], [nextpointX, nextpointY]);
					let distChecks = true;
					if(disti < 3)
					{distChecks = false;}

					if(self.visitedBots.includes(visionMap[nextpointY][nextpointX]))
					{continue;}

					if(resourceChecks === false || distChecks === false || self.map[nextpointY][nextpointX] === false)
					{continue;}

					self.destination[0] = nextpointX;
					self.destination[1] = nextpointY;
					break;
				}
			}
		}
		if(i === 4)
		{
			return null;
		}
		self.log("NEW DESTIONATION :::::: " + self.destination);
	}

	return goTo(self);
}

function firstSpot(self:any) {
	// Move to first initial spot. If it is already occupied check to see if one of the formation
	// spots are available and move there.

	const horizontal = horizontalFlip(self);
	let firstSpots:	number[];
	const visionMap = self.getVisibleRobotMap();
	const inBounds = false;
	if(!horizontal)	{
		if(self.enemyCastleLoc[1] > self.me.y){
			self.log("*****************X********");
			// firstSpots = [self.me.x, self.me.y - 3];
			firstSpots = [self.friendlyCastleLoc[0][0], self.friendlyCastleLoc[0][1] - 3];
			while(!inBounds) {
				let resourceCheck = true;
				if(self.karbonite_map[firstSpots[1]][firstSpots[0]] === true || self.fuel_map[firstSpots[1]][firstSpots[0]] === true)
				{resourceCheck = false;}
				if(self.map[firstSpots[1]][firstSpots[0]] === true && resourceCheck === true)
				{
					break;	
				}
				firstSpots[0] = firstSpots[0] - 1;
			}
		}
		else {
			// firstSpots = [self.me.x, self.me.y + 3];
			firstSpots = [self.friendlyCastleLoc[0][0], self.friendlyCastleLoc[0][1] + 3];
			self.log("*****************1********");
			while(!inBounds) {
				let resourceCheck = true;
				if(self.karbonite_map[firstSpots[1]][firstSpots[0]] === true || self.fuel_map[firstSpots[1]][firstSpots[0]] === true)
				{resourceCheck = false;}
				if(self.map[firstSpots[1]][firstSpots[0]] === true)
				{
					break;	
				}
				firstSpots[0] = firstSpots[0] - 1;
			}
		}

	}
	else {
		if(self.enemyCastleLoc[0] > self.me.x){
			// firstSpots = [self.me.x - 3, self.me.y];
			firstSpots = [self.friendlyCastleLoc[0][0] - 3, self.friendlyCastleLoc[0][1]];
			self.log("*****************2********");
			while(!inBounds) {
				let resourceCheck = true;
				if(self.karbonite_map[firstSpots[1]][firstSpots[0]] === true || self.fuel_map[firstSpots[1]][firstSpots[0]] === true)
				{resourceCheck = false;}
				if(self.map[firstSpots[1]][firstSpots[0]] === true)
				{
					break;	
				}	
				firstSpots[1] = firstSpots[1] - 1;
			}
		}
		else {
			// firstSpots = [self.me.x + 3, self.me.y];
			firstSpots = [self.friendlyCastleLoc[0][0] + 3, self.friendlyCastleLoc[0][1]];
			self.log("*****************3********");
			while(!inBounds) {
				let resourceCheck = true;
				if(self.karbonite_map[firstSpots[1]][firstSpots[0]] === true || self.fuel_map[firstSpots[1]][firstSpots[0]] === true)
				{resourceCheck = false;}
				if(self.map[firstSpots[1]][firstSpots[0]] === true)
				{
					break;	
				}
				firstSpots[1] = firstSpots[1] - 1;
			}
		}
	}

	self.destination = firstSpots;

		const visibleRobots = self.getVisibleRobots();
		const listLength = visibleRobots.length;
		let i;
		for (i = 0; i < listLength; ++i) {
			const rob = visibleRobots[i];
			if (rob.x === self.destination[0] && rob.y === self.destination[1]) {
				return null;
			}
		}

    self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
	self.destinationQueue.pop();
	return firstSpots;
}

 function goTo(self:any) {
	 self.log("RUN PATH AGAIN ====" + self.runPathAgain);
	if(self.runPathAgain === 1)
	{
	  if(availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map) === null)
	  {return null;}
      self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
	  self.destinationQueue.pop();
	  self.runPathAgain--;
	}

	if(availableLoc(self.me.x, self.me.y, self.getVisibleRobotMap(), self.map) === null)
	{return null;}

    if (self.enemyCastleLoc !== null && (self.destinationQueue !== undefined && self.destinationQueue.length !== 0)) {
      const toMove = self.destinationQueue.pop();
	  self.log("DSADSADSADSADSA    " + toMove);
	  toMove[0] = toMove[0] - self.me.x;
	  toMove[1] = toMove[1] - self.me.y;
	  self.log("TO MOVE ++++++ :" + toMove);
	  self.log("DESTINATION +++++ : " + self.destination);

	  const visibleRobots = self.getVisibleRobots();
	  const listLength = visibleRobots.length;
	  let i;
	  for(i = 0; i < listLength; ++i) {
	  	  const rob = visibleRobots[i];
		  if(rob.x === toMove[0] && rob.y === toMove[1]) {
		  	  self.runPathAgain = 1;
			  return null;
		  }
	  }
      if (toMove === null) {
        self.runPathAgain = 1;
      }
      else {
        return self.move(toMove[0], toMove[1]);
      }
    }

    if (self.destinationQueue.length === 0) {
      self.destinationQueue = simplePathFinder(self.map, self.getVisibleRobotMap(),[self.me.x, self.me.y], self.destination);
    }
	
	return null;
}

function readCastleSignal(self: any) {
	const castle = findClosestFriendlyCastles(self);
	self.resourceLocation = parseMessage(castle.signal);
	if (self.resourceLocation[0] !== -1 && self.resourceLocation[1] !== -1) {
		const message = constructCoordMessage(self.resourceLocation);
		self.signal(message, 1);
	}
}