/**
 * Finds locations for the given map
 * @param { boolean [][] } map
 * @returns { boolean [][] } Array containing elements that consist of [x , y]
 */
export function miningLocations(map: boolean[][]): number[][] {
  const locations = [];
  let i = 0;
  let j = 0;
  while(i < map.length) {
    // i is the x coord, j is the y coord.
    const resourceLoc: number = map[i].indexOf(true, j);
    locations.push([i, resourceLoc]);
    j = resourceLoc;
    i++;
  }
  return locations;
}

/**
 * Uses A* algorithm to find the shortest path between start and end
 * Credit: Amit Patel, reblobgames, A* algorithm
 * A* is like Djikstra's 
 */
export function pathFinder(map: boolean[][], start: number[], end: number[]) {
  // TODO: Figure out a comparison function for the priority queue
  return 0
}

function heuristic(a: number[], b: number[]) {
  // Manhattan distance on a square grid.
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}