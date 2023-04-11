import {
    AmbientLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    TextureLoader,
    Vector3,
    WebGLRenderer,
} from 'three';
import { BasicScreen } from './BasicScreen.js';
import { SkyBox } from '../meshes/SkyBox.js';
import { SpaceTruck } from '../meshes/groups/SpaceTruck.js';

// Based on the following document: https://codinhood.com/post/create-skybox-with-threejs
/*
 * This class represents a screen with a spaceship and a skybox.
 * The spaceship is controlled by the arrow keys or with the 'w', 'a', 'd' keys.
 * States of the spaceship:
 * 1. The spaceship is rotating left.
 * 2. The spaceship is rotating right.
 * 3. The spaceship is bursting the engine.
 * 4. The spaceship is idle. - the default state. In this state the spaceship is not rotating and the engine is not bursting, so the spaceship is moving with a constant velocity to the velocity direction.
 * */
class SpaceshipSkyboxScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            // rotation of the spaceship around the z axis.
            this.spaceshipRotation = 0;
            // spaceship velocity.
            this.spaceshipVelocity = 0;
            this.velocityDirection = 1;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        const skyBox = new SkyBox('skybox', 'skybox', 10000).getSkyBox();
        this.scene.add(skyBox);

        const ambientLight = new AmbientLight();
        this.scene.add(ambientLight);
        this.initSpaceShip();

        gui.add(this.controls, 'spaceshipRotation');
        gui.add(this.controls, 'spaceshipVelocity');
        gui.add(this.controls, 'velocityDirection');
        window.addEventListener('keydown', this.onKeyPress.bind(this), false);
        window.addEventListener('keyup', this.onKeyReleased.bind(this), false);

        super.run(gui);
    }
    render() {
        this.update();
        this.updateGui();
        super.render();
    }
    initSpaceShip() {
        const spaceship = new SpaceTruck('spaceship').getGroup();
        this.scene.add(spaceship);
        // The camera is 1000 units above the spaceship.
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(spaceship.position);
        this.state = 'idle';
    }
    // Key press event handler.
    onKeyPress(event) {
        const ship = this.scene.getObjectByName('spaceship');
        const code = event.code;
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.setState('rotatingLeft');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.setState('rotatingRight');
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.setState('burst');
                ship.getObjectByName('burst').visible = true;
                break;
        }
    }
    onKeyReleased(event) {
        const code = event.code;
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.scene.getObjectByName('burst').visible = false;
                this.setState('idle');
                break;
        }
    }
    // update the gui. Set the rotation of the spaceship.
    updateGui() {
        const ship = this.scene.getObjectByName('spaceship');
        this.gui.controllers.forEach((item, index) => {
            switch (item._name) {
                case 'spaceshipRotation':
                    // calculate the rotation in degrees.
                    // right is 90 degrees, left is -90 degrees.
                    const rotation = ship.rotation.z * -180 / Math.PI;
                    item.setValue(rotation);
                    break;
                case 'spaceshipVelocity':
                    item.setValue(this.controls.spaceshipVelocity);
                    break;
                case 'velocityDirection':
                    item.setValue(this.controls.velocityDirection);
                    break;
            }
        })
    }
    update() {
        switch (this.state) {
            case 'rotatingLeft':
                this.rotateSpaceship(0.01);
                break;
            case 'rotatingRight':
                this.rotateSpaceship(-0.01);
                break;
            case 'burst':
                this.burstSpaceship();
                break;
        }
        this.moveSpaceship();
    }
    rotateSpaceship(amount) {
        const ship = this.scene.getObjectByName('spaceship');
        ship.rotation.z += amount;
        // The rotation should be between -180 and 180 degrees.
        if (ship.rotation.z > Math.PI) {
            ship.rotation.z -= 2 * Math.PI;
        }
        if (ship.rotation.z < -Math.PI) {
            ship.rotation.z += 2 * Math.PI;
        }
        this.setState('idle');
    }
    burstSpaceship() {
        const ship = this.scene.getObjectByName('spaceship');
        ship.getObjectByName('burst').visible = true;
        // update the velocity and the velocity direction.
        // the velocity direction is the opposite of the rotation direction.
        // the velocity is 1 for each burst.
        // The new velocity and velocity direction is calculated by the following formula:
        // If the velocity is 0, then the new velocity is 1 and the new velocity direction is the opposite of the rotation direction.
        const rotationComponent = ship.rotation.z * 180 / Math.PI;
        if (this.controls.spaceshipVelocity === 0) {
            this.controls.spaceshipVelocity = 1;
            this.controls.velocityDirection = rotationComponent;
            return;
        }
    }
    setState(state) {
        if (state === 'idle' || this.state === 'idle') {
            this.state = state;
        }
    }
    moveSpaceship() {
        if (this.controls.spaceshipVelocity === 0) {
            return;
        }
        const ship = this.scene.getObjectByName('spaceship');
        // calculate the velocity vector.
        const velocity = new Vector3(0, 1, 0);
        velocity.applyAxisAngle(new Vector3(0, 0, 1), this.controls.velocityDirection * this.controls.spaceshipVelocity * Math.PI / 180);
        ship.position.add(velocity);
        // update the camera position.
        this.syncCamera();
        this.syncSkybox();
    }
    syncCamera() {
        const ship = this.scene.getObjectByName('spaceship');
        this.camera.position.set(ship.position.x, ship.position.y, 1000);
        this.camera.lookAt(ship.position);
    }
    syncSkybox() {
        const ship = this.scene.getObjectByName('spaceship');
        const skybox = this.scene.getObjectByName('skybox');
        skybox.position.set(ship.position.x, ship.position.y, 0);
        // simulate the spaceship moving through the skybox.
        // rotate the skybox in the opposite direction of the spaceship movement.
        const rotationAxis = (new Vector3(0, 1, 0)).applyAxisAngle(new Vector3(0, 0, 1), this.controls.velocityDirection * this.controls.spaceshipVelocity * Math.PI / 180 + Math.PI/2);
        skybox.rotateOnAxis(rotationAxis, 0.001);
    }
}

export { SpaceshipSkyboxScreen };
