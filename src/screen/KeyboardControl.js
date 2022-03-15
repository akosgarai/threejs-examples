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
        };
        super(name, screen, control);
        this.orbitControls = null;
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

        const skyBox = new SkyBox('skyBox', 'skybox', 1000).getSkyBox();
        this.scene.add(skyBox);

        const truck = new Truck().getGroup();
        truck.position.set(0, -30, 200);
        this.scene.add(truck);

        this.camera.lookAt(truck.position);

        const directionalLight = new DirectionalLight();
        directionalLight.position.set(-500, 200, 300);
        this.scene.add(directionalLight);

        const earth = new SphereWithTexture('planet-earth', 'earth.jpg', 30, 32, 32).getMesh();
        this.scene.add(earth);

        super.run(gui);
    }
    render() {
        this.orbitControls.update();
        super.render();
    }
}

export { KeyboardControlScreen };
