import {
    AmbientLight,
    Mesh,
    MeshBasicMaterial,
    PerspectiveCamera,
    PlaneGeometry,
    Scene,
    TextureLoader,
    WebGLRenderer,
} from 'three';
import {BasicScreen} from './BasicScreen.js';
import {SkyBox} from '../meshes/SkyBox.js';

// Based on the following document: https://codinhood.com/post/create-skybox-with-threejs
class SpaceshipSkyboxScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            // rotation of the spaceship around the z axis.
            this.spaceshipRotation = 0;
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

        const skyBox = new SkyBox(this.skyBoxName, 'skybox', 10000).getSkyBox();
        this.scene.add(skyBox);

        const ambientLight = new AmbientLight();
        this.scene.add(ambientLight);
        this.initSpaceShip();

        gui.add(this.controls, 'spaceshipRotation');
        window.addEventListener('keydown', this.onKeyPress.bind(this), false);

        super.run(gui);
    }
    render() {
        this.updateGui();
        super.render();
    }
    initSpaceShip() {
        // The spaceship is a squere with a texture.
        // The texture size is 128*256.
        // The spaceship is 50*100.
        const square = new PlaneGeometry(50, 100);
        const texture = new TextureLoader().load('assets/texture/SpaceTruckTop.png');
        const material = new MeshBasicMaterial({ map: texture });
        const spaceship = new Mesh(square, material);
        spaceship.name = 'spaceship';
        this.scene.add(spaceship);
        // The camera is 100 units above the spaceship.
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(spaceship.position);
    }
    // Key press event handler.
    onKeyPress(event) {
        const ship = this.scene.getObjectByName('spaceship');
        const code = event.code;
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                ship.rotation.z += 0.01;
                break;
            case 'ArrowRight':
            case 'KeyD':
                ship.rotation.z -= 0.01;
                break;
        }
        // The rotation should be between -180 and 180 degrees.
        if (ship.rotation.z > Math.PI) {
            ship.rotation.z -= 2 * Math.PI;
        }
        if (ship.rotation.z < -Math.PI) {
            ship.rotation.z += 2 * Math.PI;
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
            }
        })
    }
}

export { SpaceshipSkyboxScreen };
