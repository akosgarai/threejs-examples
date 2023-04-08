import { Group } from 'three';
import { RectangleWithTexture } from '../Rectangles.js';
/*
 * This class represents a basic Mesh group that looks like a space truck.
 */
class SpaceTruck {
    constructor(groupName) {
        this.groupName = groupName;
    }
    getGroup() {
        const group = new Group();
        // The spaceship is a squere with a texture.
        // The texture size is 128*256.
        // The spaceship is 50*100.
        const spaceTruckBase = new RectangleWithTexture(50, 100, 'truck', 'assets/texture/SpaceTruckTop.png', true).getMesh();
        const spaceTruckEngines = new RectangleWithTexture(50, 100, 'engine', 'assets/texture/SpaceTruckRockets.png', true).getMesh();
        // the rockets has to be moved to the top of the truck.
        spaceTruckEngines.position.z = 5;
        group.add(spaceTruckBase);
        group.add(spaceTruckEngines);

        group.name = this.groupName;

        return group;
    }
}

export { SpaceTruck };
