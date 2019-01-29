import {BCAbstractRobot, SPECS} from 'battlecode';

// const Attack = {};
// Attack.attackFirst = (self) => 
export function attackFirst(self: any) 
{
	// Get all visible robots within the robots vision radius
	const visibleRobots = self.getVisibleRobots();

	// Loop through the list of visible robots and remove the friendly robots and the ones not within attacking range\
	const listLength = visibleRobots.length;
	// let x = 0; // keep track of number of robots in attackableRobots array
	let i;
	for(i = 0; i < listLength; ++ i)
	{
		const rob = visibleRobots[i];
		// Check if the robot just showed up because of radio broadcast
		if(!self.isVisible(rob))
		{continue;}
		// Check if robot is friendly
		if(self.me.team === rob.team)
		{continue;}
		self.log("ROBOT: " + rob.id + " is an enemy within vision");

        const dist = (rob.x - self.me.x)**2 + (rob.y - self.me.y)**2;
		self.log("TEST1");

		if(self.me.unit === SPECS.CASTLE)
		{
			return null;
			/*
			if(64 <= dist)
			{
				self.log("CASTLE ATTACKING:" + rob.id)	;
				const robotToAttack = new Array(2);
				robotToAttack[0] = rob.x - self.me.x;
				robotToAttack[1] = rob.y - self.me.y;
				return null;

			}
			*/
		}

		if(SPECS.UNITS[self.me.unit].ATTACK_RADIUS[0] <= dist && dist <= SPECS.UNITS[self.me.unit].ATTACK_RADIUS[1])
		{
			self.log("CAN ATTACK ROBOT:" + rob.id);
			const robotToAttack = new Array(2);
			robotToAttack[0] = rob.x - self.me.x;
			robotToAttack[1] = rob.y - self.me.y;
			return robotToAttack;
		}
		return null;
	}	
}