import {BCAbstractRobot, SPECS} from 'battlecode';


// Function will take in one of our castles and reflect its position to obtain
// the location of an enemy castle
export function enemyCastle(xcor: number, ycor: number, mapLength: number, self: any, horizontal: boolean)
{
	// vertical reflection on the castle	
	self.log("My location is: " + xcor + ", " + ycor);
	const coordinateVertical: number[]= [mapLength- xcor -1, ycor];
	const coordinateHorizontal: number[] = [xcor, mapLength - ycor -1];

	const xVertical = coordinateVertical[0];
	const yVertical = coordinateVertical[1];
	self.log("VERTICAL: " + coordinateVertical[0] + ", " + coordinateVertical[1]);
	self.log("HORIZONTAL: " + coordinateHorizontal[0] + ", " + coordinateHorizontal[1]);
	if (!horizontal)
	{return coordinateVertical;}
	else
	{return coordinateHorizontal;}
}

export function horizontalFlip(self: any)
{
	const lenght: number = self.map.length;
	self.log("LENGTH: " + lenght);
	let x;
	let y;
	for(x = 0; x < lenght; ++x)
	{
		for(y = 0; y < lenght; ++y)
		{
			if(!(self.map[x][y] === self.map[lenght - x - 1][y]))
			{
				return false;
			}
		}
	}
	return true;
}
