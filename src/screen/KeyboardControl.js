import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {BasicScreen} from './BasicScreen.js';
import {SkyBox} from '../meshes/SkyBox.js';
import {SphereWithTexture} from '../meshes/Spheres.js';
import {Truck} from '../meshes/groups/Truck.js';

// Based on the following document: https://codinhood.com/post/create-skybox-with-threejs
class KeyboardControlScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.truckSpeed = 0.0;
        };
        super(name, screen, control);
        this.orbitControls = null;
        this.truckName = 'truck';
        this.truckSpeedController = null;
        this.truckSpeedMin = 0.0;
        this.truckSpeedMax = 100;
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        // position and point the camera to the center of the scene
        this.camera.position.set(0, 0, 400);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        // orbit controls config
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = true;
        this.orbitControls.enableZoom = false;
        this.orbitControls.enablePan = true;

        const skyBox = new SkyBox('skyBox', 'skybox', 1000).getSkyBox();
        this.scene.add(skyBox);

        const truck = new Truck(this.truckName).getGroup();
        truck.position.set(0, -30, 200);
        this.scene.add(truck);

        this.camera.lookAt(truck.position);

        const directionalLight = new DirectionalLight();
        directionalLight.position.set(-500, 200, 300);
        this.scene.add(directionalLight);

        const earth = new SphereWithTexture('planet-earth', 'earth.jpg', 30, 32, 32).getMesh();
        this.scene.add(earth);

        window.addEventListener('keydown', this.truckControls.bind(this), false);
        this.truckSpeedController = gui.add(this.controls, 'truckSpeed', this.truckSpeedMin, this.truckSpeedMax);

        super.run(gui);
    }
    render() {
        this.orbitControls.update();
        super.render();
    }
    truckControls(event) {
        const truck = this.scene.getObjectByName(this.truckName);
        const code = event.code;
        switch (code) {
            case 'ArrowLeft':
            case 'KeyA':
                truck.rotation.y += 0.01;
                break;
            case 'ArrowRight':
            case 'KeyD':
                truck.rotation.y -= 0.01;
                break;
            case 'ArrowUp':
            case 'KeyW':
                this.controls.truckSpeed += 0.02;
                if (this.controls.truckSpeed > this.truckSpeedMax) {
                    this.controls.truckSpeed = this.truckSpeedMax;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.controls.truckSpeed -= 0.02;
                if (this.controls.truckSpeed < this.truckSpeedMin) {
                    this.controls.truckSpeed = this.truckSpeedMin;
                }
                break;
        }
        this.truckSpeedController.setValue(this.controls.truckSpeed);
    }
}

export { KeyboardControlScreen };
