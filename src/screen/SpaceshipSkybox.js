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
import { SpaceTruck, Navigation } from '../meshes/groups/SpaceTruck.js';

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
            this.velocityDirection = 0;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 200000);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        const skyBox = new SkyBox('skybox', 'skybox', 100000).getSkyBox();
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
        this.navigation = new Navigation(spaceship);
        // The camera is 1000 units above the spaceship.
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(spaceship.position);
    }
    // Key press event handler.
    onKeyPress(event) {
        const code = event.code;
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.navigation.setState('rotatingLeft');
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.navigation.setState('rotatingRight');
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.navigation.setState('burst');
                break;
        }
    }
    onKeyReleased(event) {
        const code = event.code;
        switch (code) {
            case 'KeyP':
				const ship = this.scene.getObjectByName('spaceship');
                console.log(ship.position, ship.rotation);
				console.log(this.camera.position, this.camera.rotation);
                console.log(this.navigation.velocity, this.navigation.velocityDirection);
                break;
        }
    }
    // update the gui. Set the rotation of the spaceship.
    updateGui() {
        this.gui.controllers.forEach((item, index) => {
            switch (item._name) {
                case 'spaceshipRotation':
                    // calculate the rotation in degrees.
                    // right is 90 degrees, left is -90 degrees.
                    let rotation = this.navigation.rotationAngleDegree;
                    if (rotation > 180) {
                        rotation = rotation - 360;
                    }
                    item.setValue(-rotation);
                    break;
                case 'spaceshipVelocity':
                    item.setValue(this.navigation.velocity);
                    break;
                case 'velocityDirection':
                    item.setValue(this.navigation.velocityDirection * -180 / Math.PI);
                    break;
            }
        })
    }
    update() {
        const now = new Date().getTime();
        this.navigation.update(now);
        this.navigation.move();
        // update the camera position.
        this.syncCamera();
        //this.syncSkybox();
    }
    syncCamera() {
        const ship = this.navigation.group;
        this.camera.position.set(ship.position.x, ship.position.y, 1000);
        this.camera.lookAt(ship.position);
    }
    syncSkybox() {
        const ship = this.navigation.group;
        const skybox = this.scene.getObjectByName('skybox');
        skybox.position.set(ship.position.x, ship.position.y, 0);
        // simulate the spaceship moving through the skybox.
        // rotate the skybox in the opposite direction of the spaceship movement.
        const rotationAxisShip = (new Vector3(0, 1, 0)).applyAxisAngle(new Vector3(0, 0, 1), -this.controls.velocityDirection * Math.PI / 180).normalize();
        const rotationAxis = (new Vector3(0, 0, 1)).applyAxisAngle(rotationAxisShip, -Math.PI / 2);
        skybox.rotateOnAxis(rotationAxis, 0.001 * this.controls.spaceshipVelocity);
    }
}

export { SpaceshipSkyboxScreen };
