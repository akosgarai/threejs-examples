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
        const directionDiff = currentStep.angleTo(newStep);
        // calculate the new velocity and velocity direction.
        this.velocityDirection += directionDiff;
        this.velocity = newStep.length();
        // The rotation should be between 0 and 2 PI rad.
        this.velocityDirection = this.velocityDirection % (2 * Math.PI);
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

export { SpaceTruck, Navigation };
