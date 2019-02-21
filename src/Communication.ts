import { BCAbstractRobot, SPECS } from 'battlecode';

export function constructCoordMessage(pt: number[]) {
    // Fuel cost: Math.ceil(Math.sqrt(r))
    // pt = [x, y]
    // ex: [1, 1] = 000001000001 = 65
    // ex: [5, 16] = 000101 010000 = 336
    const xCoord = pt[0] << 6;
    const yCoord = pt[1];
    return xCoord + yCoord;
}

export function parseMessage(message: number) {
    // 6 bits X coords, 6 bits Y coords.
    // Get x coords.
    // ex: [5, 16] = 000101 010000 = 336
    if (message === -1) {
        return [0, 0];
    }
    let xCoord = 0;
    let yCoord = 0;
    for(let i = 0; i < 12; i++) {
        if(i < 6) {
            // Do yCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                yCoord += 1 << i - 1;
            }
        }
        else {
            // Do xCoord
            // Bitwise black magic
            if (message & (1 << i - 1)) {
                xCoord += 1 << i - 7; // Offset is 7 b/c, (i - 1) - 6, 6 is from binary offset of x,y
            }
        }
    }
    return [xCoord, yCoord];
}