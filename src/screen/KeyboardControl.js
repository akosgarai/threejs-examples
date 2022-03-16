import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight, Vector3} from 'three';
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
            this.truckRotationY = 0.0;
            this.truckSpeedMin = 0.0;
            this.truckSpeedMax = 100;
            this.epsilon = 15;
        };
        super(name, screen, control);
        this.orbitControls = null;
        this.truckName = 'truck';
        this.skyBoxName = 'skyBox';
        this.lastRenderTime = Date.now();
        this.cameraOffsetVector = new Vector3(0, 30, 200);
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

        // orbit controls config
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = true;
        this.orbitControls.enableZoom = false;
        this.orbitControls.enablePan = true;

        const skyBox = new SkyBox(this.skyBoxName, 'skybox', 10000).getSkyBox();
        this.scene.add(skyBox);

        const truck = new Truck(this.truckName).getGroup();
        truck.position.set(0, -30, 200);
        skyBox.position.set(truck.position.x, truck.position.y, truck.position.z);
        this.scene.add(truck);

        // position and point the camera to the truck
        const cameraPosition = new Vector3(truck.position.x, truck.position.y, truck.position.z);
        cameraPosition.add(this.cameraOffsetVector);
        this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.camera.lookAt(truck.position);

        const directionalLight = new DirectionalLight();
        directionalLight.position.set(-500, 200, 300);
        this.scene.add(directionalLight);

        const earth = new SphereWithTexture('planet-earth', 'earth.jpg', 30, 32, 32).getMesh();
        this.scene.add(earth);

        window.addEventListener('keydown', this.truckControls.bind(this), false);
        gui.add(this.controls, 'truckSpeed', this.controls.truckSpeedMin, this.controls.truckSpeedMax);
        gui.add(this.controls, 'truckRotationY').onChange((v) => { truck.rotation.y = v; });
        this.lastRenderTime = Date.now();

        super.run(gui);
    }
    render() {
        this.orbitControls.update();
        const now = Date.now();
        const delta = now - this.lastRenderTime;
        const truck = this.scene.getObjectByName(this.truckName);
        if (delta > this.controls.epsilon) {
            this.lastRenderTime = now;
            if (this.controls.truckSpeed > 0) {
                const forward = new Vector3(0,0,-1);
                const axis = new Vector3(0,1,0);
                forward.applyAxisAngle(axis, truck.rotation.y);
                forward.multiplyScalar(delta*this.controls.truckSpeed/1000);
                truck.position.add(forward);
                // position and point the camera to the truck
                this.camera.position.add(forward);
            }
        }
        const skyBox = this.scene.getObjectByName(this.skyBoxName);
        skyBox.position.set(truck.position.x, truck.position.y, truck.position.z);
        this.camera.lookAt(truck.position);
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
                if (this.controls.truckSpeed > this.controls.truckSpeedMax) {
                    this.controls.truckSpeed = this.controls.truckSpeedMax;
                }
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.controls.truckSpeed -= 0.02;
                if (this.controls.truckSpeed < this.controls.truckSpeedMin) {
                    this.controls.truckSpeed = this.controls.truckSpeedMin;
                }
                break;
        }
        this.gui.controllers.forEach((item, index) => {
            switch (item._name) {
                case 'truckSpeed':
                    item.setValue(this.controls.truckSpeed);
                    break;
                case 'truckRotationY':
                    item.setValue(truck.rotation.y);
                    break;
            }
        })
    }
}

export { KeyboardControlScreen };
