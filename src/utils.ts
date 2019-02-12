import { BCAbstractRobot, SPECS } from 'battlecode';
import { PriorityQueue } from './PriorityQueue';

const adjChoices: number[][] = [
  [0, -1],    // S
  [-1, -1],   // NW
  [-1, 0],    // W
  [-1, 1],    // SW
  [0, 1],     // N
  [1, 1],     // NE
  [1, 0],     // E
  [1, -1],    // SE
];

/**
 * Finds an in-bounds location adjacent to our robot
 * @param { BCAbstractRobot } self
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
export function simpleValidLoc(self: BCAbstractRobot): number[] {
  let i = 0;
  let bounds = checkBounds([self.me.x, self.me.y], adjChoices[i], self.map[0].length);
  while ((bounds[0] !== true) && (bounds[1] !== true) && (i < adjChoices.length)) {
    // While adjChoices[i] is out of bounds, iterate through i.
    i += 1;
    bounds = checkBounds([self.me.x, self.me.y], adjChoices[i], self.map[0].length);
  }
  if (i > adjChoices.length) {
    return [0, 1];
  }

  return adjChoices[i];
}

/**
 * Finds an in-bounds random location adjacent to our robot
 * @param { BCAbstractRobot } self
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
export function randomValidLoc(self: BCAbstractRobot): number[] {
  // TODO: Possibly check if a unit is in the desired space for movement?

  const mapDim = self.map[0].length;
  let rand = Math.floor(Math.random() * adjChoices.length);
  let loc = adjChoices[rand];
  let counter = 0;


  do {
    if (self.me.y + loc[1] >= mapDim) {
      loc[1] = -1;
    }
    if (self.me.y + loc[1] < 0) {
      loc[1] = 1;
    }
    if (self.me.x + loc[0] >= mapDim) {
      loc[0] = -1;
    }
    if (self.me.x + loc[0] < 0) {
      loc[0] = 1;
    }
    rand = (rand + 1) % adjChoices.length;
    counter++;
  } while (!self.map[self.me.y + loc[1]][self.me.x + loc[0]] && counter < adjChoices.length);
  if (counter >= adjChoices.length) {
    loc = [0, 1];
  }
  return loc;
}

/**
 * Finds an in-bounds open location adjacent to our robot
 * @param { number } our x-coord, { number } our y-coord, { number[][] } our visionMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
export function availableLoc(selfX: number, selfY: number, visionMap: number[][]): number[] {
  let avail : number [] = [];

  for (avail of adjChoices){
    const xCoord = avail[0] + selfX;
    const yCoord = avail[1] + selfY;
    if (visionMap[yCoord][xCoord] === 0) {
      return avail;
    } 
  }

  // No available adjacent location 
  return [-2,-2];
}

/**
 * Finds closest mining location for the given map
 * @param { number [] } myLocation, { boolean [][] } resourceMap
 * @returns { number [] } Array containing elements that consist of [x , y]
 */
export function closestMiningLocation(loc: number[], map: boolean[][]): number[] {
  let closestDist = Infinity;
  let closestLoc;
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map.length; x++) {
      if (map[y][x] && (manhatDist([x, y], loc) < closestDist)) {
        closestDist = manhatDist([x, y], loc);
        closestLoc = [x, y];
      }
    }
  }
  return closestLoc;
}

/**
 * Finds manhattan distance between two locations
 * @param { number [] } locationA, { number [] } locationB 
 * @returns { number } Manhattan distance between A and B
 */
export function manhatDist(a: number[], b: number[]) {
  // Manhattan distance on a square grid.
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/**
 * Finds closest coordinates in an array of locations to a starting point
 * @param { number [] } start, { number [][] } locations
 * @returns { number [][]} coordinates of closest location
 */
export function closestCoords(start: number[], coords: number[][]) {
  const distances = [];
  for (const coord of coords) {
    distances.push({
      distance: manhatDist(start, coord),
      coord,
    });
  }
  let min = distances[0];
  for (const dist of distances) {
    if (dist.distance < min.distance) {
      min = dist;
    }
  }
  return min.coord;
}

/**
 * Finds the degree direction between two points
 * @param { number [] } point1, { number [] } point2
 * @returns { number } degree between two points
 */
function calcDegDirection(p1: number[], p2: number[]): number {
  const angleRad = Math.atan((p2[1] - p1[1]) / (p2[0] - p1[0]));
  return ((angleRad * 180) / Math.PI);
}

export function fillArray(max: number, el: any) {
  const temp = new Array(max);
  const result = new Array(max);

  for (let i = 0; i < max; ++i) {
    temp[i] = el;
  }

  for (let i = 0; i < max; ++i) {
    result[i] = temp.slice(0);
  }

  return result;
}

/**
 * Checks if a location is within map bounds
 * @param { number [] } start, { number [] } [dx, dy], { number } mapDimensions 
 * @returns { number [][]} coordinates of closest location
 */
function checkBounds(start: number[], toAdd: number[], mapDim: number) {
  const result = [true, true];
  if (start[1] + toAdd[1] >= mapDim) {
    result[1] = false;
  }
  if (start[1] + toAdd[1] < 0) {
    result[1] = false;
  }
  if (start[0] + toAdd[0] >= mapDim) {
    result[0] = true;
  }
  if (start[0] + toAdd[0] < 0) {
    result[0] = true;
  }
  return result;
}

export function simplePathFinder(map: boolean[][], start: number[], dest: number[]): number[][] {
  // Simple BFS pathfinder
  // Really bad.
  const visited: boolean[][] = fillArray(map[0].length, false);
  // const gScore: number[][] = fillArray(map[0].length, Infinity);
  // const fScore: number[][] = fillArray(map[0].length, Infinity);

  const parentCoord: number[][][] = fillArray(map[0].length, []);
  const moveQueue: number[][] = [];
  const queue = new PriorityQueue();
  const directions = adjChoices;
  let pathEnd;

  queue.insert({
    coord: start,
    priority: manhatDist(start, dest),
  });
  // gScore[start[1]][start[0]] = 0;
  // fScore[start[1]][start[0]] = manhatDist(start, dest);
  parentCoord[start[1]][start[0]] = start;

  while (queue.size() !== 0) {
    const nextHeapitem = queue.pop();
    const loc = nextHeapitem.coord
    visited[loc[1]][loc[0]] = true;

    if (loc[0] === dest[0] && loc[1] === dest[1]) {
      pathEnd = loc;
      break;
    }
    // Add to queue only if not visited already and closest.
    const candidates = directions.map((val) => {
      return [val[0] + loc[0], val[1] + loc[1]];
    });
    for (const candidate of candidates) {
      // Check bounds
      if ((candidate[1] >= 0 && candidate[1] < map[0].length) && (candidate[0] >= 0 && candidate[0] < map[0].length)) {
        // Check visit and passable
        if (visited[candidate[1]][candidate[0]] !== true && map[candidate[1]][candidate[0]] === true) {
          // If not visited and is passable, push to queue.
          parentCoord[candidate[1]][candidate[0]] = loc;

          const test = manhatDist(candidate, dest);
          queue.insert({
            coord: candidate,
            priority: manhatDist(candidate, dest),
          });
        }
      }
    }
  }
  while (pathEnd !== undefined) {
    moveQueue.push(pathEnd);
    pathEnd = parentCoord[pathEnd[1]][pathEnd[0]];

    if (pathEnd[0] === start[0] && pathEnd[1] === start[1]) {
      pathEnd = undefined;
      moveQueue.push(start);
    }
  }
  // moveQueue.reverse();
  return moveQueue;
}

/**
 * Finds the closest team castle
 * @param { BCAbstractRobot } self
 * @returns { number [][]} coordinates of closest castle
 */
export function findClosestFriendlyCastles(self: BCAbstractRobot) : number []{
  const storageLocs: number[][] = [];
  const visibleRobots = self.getVisibleRobots();
  const castles = visibleRobots.filter((robot) => {
    if ((robot.team === self.me.team) && (robot.unit === SPECS.CASTLE)) {
      return robot;
    }
  });

  for (const loc of castles) {
    storageLocs.push([loc.x, loc.y]);
  }
  return closestCoords([self.me.x, self.me.y], storageLocs);
}

/**
 * Finds the number of visible pilgrims
 * @param { BCAbstractRobot } self
 * @returns { number } number of pilgrims in vision radius, -1 if none
 */
export function visiblePilgrims(self: BCAbstractRobot): number {
  const visibleRobots = self.getVisibleRobots();

  function isPilgrim(robot: any) {
    return robot.team === self.me.team && robot.unit === SPECS.PILGRIM;
  }
  return visibleRobots.filter(isPilgrim).length;
}

// Function will take in one of our castles and reflect its position to obtain
// the location of an enemy castle
export function enemyCastle(xcor: number, ycor: number, mapLength: number, self: any, horizontal: boolean) {
  // vertical reflection on the castle	
  const coordinateVertical: number[] = [mapLength - xcor - 1, ycor];
  const coordinateHorizontal: number[] = [xcor, mapLength - ycor - 1];

  if (!horizontal) { return coordinateVertical; }
  else { return coordinateHorizontal; }
}

export function horizontalFlip(self: any) {
  const length: number = self.map.length;
  let x;
  let y;
  for (x = 0; x < length; ++x) {
    for (y = 0; y < length; ++y) {
      if (!(self.map[x][y] === self.map[length - x - 1][y])) {
        return false;
      }
    }
  }
  return true;
}