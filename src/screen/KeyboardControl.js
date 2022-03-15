import {Scene, PerspectiveCamera, WebGLRenderer} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {BasicScreen} from './BasicScreen.js';
import {SkyBox} from '../meshes/SkyBox.js';

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
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 45, 30000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 1200;
        this.camera.position.y = -250;
        this.camera.position.z = 2000;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        // orbit controls config
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enabled = true;
        this.orbitControls.minDistance = 700;
        this.orbitControls.maxDistance = 1500;

        const skyBox = new SkyBox('skyBox', 'skybox', 20000).getSkyBox();
        this.scene.add(skyBox);

        super.run(gui);
    }
    render() {
        this.orbitControls.update();
        super.render();
    }
}

export { KeyboardControlScreen };
