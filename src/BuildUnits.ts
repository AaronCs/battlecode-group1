import { BCAbstractRobot, SPECS } from 'battlecode';

export function castleBuild(self: any): BuildAction | Falsy {
    const units: number[] = [1, 2, 3, 4];
    const buildLoc: number[] = self.randomValidLoc();

    self.log(`Castle health: ${self.me.health}`);

    // Repeat while castle has enough karbonite for at least one pilgrim
    while(self.karbonite >=10) {
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

export function pilgrimBuild(self: any): BuildAction | Falsy {
    self.log(`Pilgrim health: ${self.me.health}`);

    // Robot needs to be carrying resources to be able to build

}