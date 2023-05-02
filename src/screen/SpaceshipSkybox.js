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
import { Compass, SpaceTruck, SkyBoxTransformer, Navigation } from '../meshes/groups/SpaceTruck.js';

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
        this.skyBoxTransformer = new SkyBoxTransformer(skyBox);
        this.scene.add(skyBox);

        const ambientLight = new AmbientLight();
        this.scene.add(ambientLight);
        this.initSpaceShip();
        this.compass = new Compass();
        this.scene.add(this.compass.getGroup());

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
                console.log('navigation ' + this.navigation.velocity + ' velocity ' + this.navigation.velocityDirection + ' direction');
				console.log('ship rotation: ' + ship.rotation.z);
				console.log('ship position: ' + ship.position.x + ' ' + ship.position.y);
                console.log('skybox', this.skyBoxTransformer.skyBox.rotation);
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
                    let rotationDeg = this.navigation.velocityDirection * 180 / Math.PI;
                    if (rotationDeg > 180) {
                        rotationDeg = rotationDeg - 360;
                    }
                    item.setValue(-rotationDeg);
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
        // update the compass
        this.compass.update(this.navigation.group.rotation.z, this.navigation.velocityDirection, this.navigation.group.position);
        this.syncSkybox();
    }
    syncCamera() {
        const ship = this.navigation.group;
        this.camera.position.set(ship.position.x, ship.position.y, 1000);
        this.camera.lookAt(ship.position);
    }
    syncSkybox() {
        this.skyBoxTransformer.transform(this.navigation.velocityDirection, this.navigation.velocity, this.navigation.group.position);
    }
}

export { SpaceshipSkyboxScreen };
