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
        const control = new function() {};
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

        super.run(gui);
    }
    render() {
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
        this.scene.add(spaceship);
        // The camera is 100 units above the spaceship.
        this.camera.position.set(0, 0, 1000);
        this.camera.lookAt(spaceship.position);
    }
}

export { SpaceshipSkyboxScreen };
