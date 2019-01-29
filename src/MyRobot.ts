import { BCAbstractRobot, SPECS } from 'battlecode';
import { attackFirst } from "./Attack";
import { castleBuild, pilgrimBuild } from './BuildUnits';
import { miningLocations } from "./Mining";

class MyRobot extends BCAbstractRobot {
  private step = 0;
  private firstTurn: boolean= true;
  private readonly adjChoices: number[][] = [
      [0, -1],
      [1, -1],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];

  private karboniteLocations: number[][] = undefined;
  private fuelLocations: number[][] = undefined;
  private mining: boolean = false;
  
  public turn(): Action | Falsy {
    this.step++;
    const choice: number[] = this.randomValidLoc();
    switch (this.me.unit) {
      case SPECS.PILGRIM: {
        this.log("Pilgrim");
        return this.handlePilgrim();
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
  
  private handlePilgrim(): Action | Falsy {
    if (this.firstTurn === true) {
      this.log("FINDING > > >")
      this.karboniteLocations = miningLocations(this.karbonite_map);
      this.fuelLocations = miningLocations(this.fuel_map);
      this.firstTurn = false;
    }



    if(this.mining === false) {
      const currentLoc = [this.me.x, this.me.y];
      for(const loc of this.karboniteLocations) {
        if(currentLoc[0] === loc[0] && currentLoc[1] === loc[1]) {
          this.mining = true;
          this.log(">>> Mining >>>");
          return(this.mine());
        }
      }

      for(const loc of this.fuelLocations) {
        if(currentLoc[0] === loc[0] && currentLoc[1] === loc[1]) {
          return(this.mine());
        }
      }
    }

    if(this.mining === true && (this.me.karbonite < 20 || this.me.fuel < 100)) {
      // If robot was mining last turn, and karbonite or fuel are below carry capacity.
      this.log(">>> Mining >>>");
      return(this.mine())
    }
    else {
      this.mining = false;
    }

    if (this.step % 2 === 0) {
      return pilgrimBuild(this);
    }

    const movement = this.randomValidLoc();
    return this.move(movement[0], movement[1]);

  }



  private randomValidLoc(): number[] {
    // TODO: Possibly check if a unit is in the desired space for movement?
    const mapDim = this.map[0].length
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
    } while (!this.map[this.me.y + loc[1]][this.me.x + loc[0]] && counter < this.adjChoices.length);
    if (counter >= this.adjChoices.length) {
      loc = [0, 0];
    }
    return loc;
  }

  private simpleValidLoc(): number[] {
    let i = 0;
    while (!this.map[this.me.y + this.adjChoices[i][1]][this.me.x + this.adjChoices[i][0]] && i < this.adjChoices.length) {
      // Makes sure the terrain is passable.
      // this.map is indexed as [y][x]
      i++;
    }
    return this.adjChoices[i]
  }
}

// Prevent Rollup from removing the entire class for being unused
// tslint:disable-next-line no-unused-expression
new MyRobot();