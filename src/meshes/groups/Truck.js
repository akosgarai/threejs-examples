import {Group} from 'three';
import {RectangleWithColor} from '../Rectangles.js';
/*
 * This class represents a basic Mesh group that looks like a truck.
 */
class Truck {
    constructor(groupName) {
        this.wheelColor = 0x333333;
        this.wheelSize = {
            'w': 10,
            'h': 5,
            'd': 5,
        };
        this.truckColor = 0xff0000;
        this.windowColor = 0xfefefe;
        this.groupName = groupName;
    }
    getGroup() {
        const group = new Group();
        const wheelRect = new RectangleWithColor(this.wheelSize.w, this.wheelSize.h, this.wheelSize.d, this.wheelColor);

        const backWheel = wheelRect.getMesh();
        backWheel.position.set(0, 0, 10);
        group.add(backWheel);

        const frontWheel = wheelRect.getMesh();
        frontWheel.position.set(0, 0, -10);
        group.add(frontWheel);

        const mainPart = new RectangleWithColor(8, 8, 26, this.truckColor).getMesh();
        mainPart.position.set(0, 3.5, 0);
        group.add(mainPart);

        const truckWindow = new RectangleWithColor(7, 5, 4, this.windowColor).getMesh();
        truckWindow.position.set(0, 10, -10);
        group.add(truckWindow);

        const cabin = new RectangleWithColor(8, 6, 6, this.truckColor).getMesh();
        cabin.position.set(0, 10.5, -5);
        group.add(cabin);

        group.name = this.groupName;

        return group;
    }
}

export { Truck };
