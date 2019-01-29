import { miningLocations } from "../src/Mining";

// let robot = new MyRobot();

test("Mining Locations", () => {
    const testMap = [[true, false, false], [false, true, false], [false, false, true]]
    const locations = miningLocations(testMap)
    expect(locations).toHaveLength(3);
    expect(locations[0]).toEqual([0, 0]);
    expect(locations[1]).toEqual([1, 1]);
    expect(locations[2]).toEqual([2, 2]);
})