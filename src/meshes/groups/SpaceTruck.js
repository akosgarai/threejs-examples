import { Group, Vector3, MathUtils } from 'three';
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
        const engineFire = new RectangleWithTexture(50, 100, 'burst', 'assets/texture/SpaceTruckRocketFlames.png', true).getMesh();
        // the rockets has to be moved to the top of the truck.
        spaceTruckEngines.position.z = 5;
        engineFire.position.z = 10;
        engineFire.visible = false;
        group.add(spaceTruckBase);
        group.add(spaceTruckEngines);
        group.add(engineFire);

        group.name = this.groupName;

        return group;
    }
}

class Navigation {
    constructor(group) {
        this.group = group;
        this.state = 'idle';
        this.engineBurstAmount = 1;
        this.engineRotationAmount = 1;
        this.rotationAngleDegree = 0;
        this.burstDuration = 1000;
        this.burstTimer = 0;
        this.velocity = 0;
        this.velocityDirection = 0;
        this.states = {
            'idle': {
                'allowedStates': ['rotatingLeft', 'rotatingRight', 'burst'],
            },
            'rotatingLeft': {
                'allowedStates': ['idle'],
            },
            'rotatingRight': {
                'allowedStates': ['idle'],
            },
            'burst': {
                'allowedStates': ['burst', 'idle'],
            },
        };
    }

    burst(now) {
        if (this.burstTimer === 0) {
            this.burstTimer = now;
            // Burst goes here.
            this.group.getObjectByName('burst').visible = true;
            // update the velocity and the velocity direction.
            // the velocity direction is the opposite of the rotation direction.
            // the velocity is 1 for each burst.
            // The new velocity and velocity direction is calculated by the following formula:
            // If the velocity is 0, then the new velocity is 1 and the new velocity direction is the opposite of the rotation direction.
            if (this.velocity === 0) {
                this.velocity = this.engineBurstAmount;
                this.velocityDirection = this.group.rotation.z;
                this.setState('burst');
                return;
            }
            this.changeVelocityWithBurstAmount();
        }

        if (now - this.burstTimer < this.burstDuration) {
            this.setState('burst');
            return;
        }
        this.burstTimer = 0;
        this.group.getObjectByName('burst').visible = false;
        this.setState('idle');
    }

    rotateLeft() {
        this.rotateWith(this.engineRotationAmount);
    }
    rotateRight() {
        this.rotateWith(-this.engineRotationAmount);
    }
    rotateWith(angle) {
        if (this.state !== 'rotatingLeft' && this.state !== 'rotatingRight') {
            return;
        }
        this.rotationAngleDegree += angle;
        this.rotationAngleDegree = this.rotationAngleDegree % 360;
        if (this.rotationAngleDegree < 0) {
            this.rotationAngleDegree += 360;
        }
        this.group.rotation.z = MathUtils.degToRad(this.rotationAngleDegree);
        this.setState('idle');
    }

    setState(state) {
        if (this.states[this.state].allowedStates.includes(state)) {
            this.state = state;
        }
    }
    spaceshipVelocityStep() {
        return this.velocityDirectionUnitVector().multiplyScalar(this.velocity);
    }
    spaceshipBurstStep() {
        return this.getRotatedForwardDirectionWith(this.group.rotation.z).multiplyScalar(this.engineBurstAmount);
    }
    velocityDirectionUnitVector() {
        return this.getRotatedForwardDirectionWith(this.velocityDirection);
    }
    getRotatedForwardDirectionWith(angle) {
        return (new Vector3(0, 1, 0)).applyAxisAngle(new Vector3(0, 0, 1), angle).normalize();
    }
    changeVelocityWithBurstAmount() {
        const currentStep = this.spaceshipVelocityStep();
        const burstStep = this.spaceshipBurstStep();
        const newStep = currentStep.clone().add(burstStep.clone());
        this.velocity = newStep.length();
        if (this.velocity < 0.00001) {
            this.velocity = 0;
        }
        // The rotation should be between 0 and 2 PI rad.
        this.velocityDirection = Math.atan2(newStep.y, newStep.x) - Math.PI/2;
        if (this.velocityDirection < 0) {
            this.velocityDirection += 2 * Math.PI;
        }
    }
    move() {
        if (this.velocity === 0) {
            return;
        }
        this.group.position.add(this.spaceshipVelocityStep());
    }
    update(now) {
        switch (this.state) {
            case 'rotatingLeft':
                this.rotateLeft();
                break;
            case 'rotatingRight':
                this.rotateRight();
                break;
            case 'burst':
                this.burst(now);
                break;
            default:
                break;
        }
        this.move();
    }
}

class Compass {
    constructor() {
        // Create the compass. The bottom layer is the assets/texture/compass/compass.png.
        // The above layer is the rotation indicator (assets/texture/compass/compassRotation.png).
        // The next layer is the direction indicator (assets/texture/compass/compassDirection.png).
        // The top layer is the screw (assets/texture/compass/compassScrew.png).
        // Every layer is 200x200 pixels.
        this.group = new Group();
        const compassBase = new RectangleWithTexture(150, 150, 'compass-base', 'assets/texture/compass/compass.png', true).getMesh();
        const compassRotation = new RectangleWithTexture(150, 150, 'compass-rotation', 'assets/texture/compass/compassRotation.png', true).getMesh();
        compassRotation.position.set(0, 0, 1);
        const compassDirection = new RectangleWithTexture(150, 150, 'compass-direction', 'assets/texture/compass/compassDirection.png', true).getMesh();
        compassDirection.position.set(0, 0, 2);
        const compassScrew = new RectangleWithTexture(150, 150, 'compass-screw', 'assets/texture/compass/compassScrew.png', true).getMesh();
        compassScrew.position.set(0, 0, 3);
        this.group.add(compassBase);
        this.group.add(compassRotation);
        this.group.add(compassDirection);
        this.group.add(compassScrew);
    }
    getGroup() {
        return this.group;
    }
    update(rotationAngle, directionAngle, shipPosition) {
        this.group.position.set(shipPosition.x+150, shipPosition.y+150, 0);
        this.group.getObjectByName('compass-rotation').rotation.z = rotationAngle;
        this.group.getObjectByName('compass-direction').rotation.z = directionAngle;
    }
}

// The space contains 9 textured meshes in a group.
// The space is a 3x3 grid. The middle is the ship.
// When it moves out from the middle, the grid changes with it.
// The grid is 1000x1000 pixels.
class Space {
    constructor() {
        this.spaceZ = -1000;
        this.gridSize = 10000;
        this.group = new Group();
        this.grid = [
            // Top row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-left', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-middle', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'top-right', 'assets/space/space-background-simple.png', true).getMesh(),
            ],
            // Middle row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-left', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-middle', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'middle-right', 'assets/space/space-background-simple.png', true).getMesh(),
            ],
            // Bottom row.
            [
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-left', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-middle', 'assets/space/space-background-simple.png', true).getMesh(),
                new RectangleWithTexture(this.gridSize, this.gridSize, 'bottom-right', 'assets/space/space-background-simple.png', true).getMesh(),
            ],
        ];

        this.buildGrid(new Vector3(0, 0, 0));

        this.grid.forEach((row) => {
            row.forEach((grid) => {
                this.group.add(grid);
            });
        });
    }
    buildGrid(middlePosition) {
        const tileX = Math.floor(middlePosition.x / this.gridSize);
        const tileY = Math.floor(middlePosition.y / this.gridSize);
        const typeX = this.mod3(tileX+1);
        const typeY = this.mod3(tileY+1);
        // middle position
        this.grid[typeY][typeX].position.set(tileX*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // left from the middle position
        this.grid[typeY][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // right from the middle position
        this.grid[typeY][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, tileY*this.gridSize, this.spaceZ);
        // top row, left to right
        this.grid[this.mod3(typeY+1)][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY+1)][typeX].position.set(tileX*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY+1)][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, (tileY+1)*this.gridSize, this.spaceZ);
        // bottom row, left to right
        this.grid[this.mod3(typeY-1)][this.mod3(typeX-1)].position.set((tileX-1)*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY-1)][typeX].position.set(tileX*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
        this.grid[this.mod3(typeY-1)][this.mod3(typeX+1)].position.set((tileX+1)*this.gridSize, (tileY-1)*this.gridSize, this.spaceZ);
    }
    mod3(n) {
        let mod = n % 3;
        if (mod < 0) {
            mod += 3;
        }
        return mod;
    }
    getGroup() {
        return this.group;
    }
    update(shipPosition) {
        this.buildGrid(shipPosition);
    }
}

export {
    Compass,
    Navigation,
    Space,
    SpaceTruck,
};
