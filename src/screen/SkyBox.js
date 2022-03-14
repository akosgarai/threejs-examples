import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, Mesh, TextureLoader, MeshBasicMaterial, BackSide} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {BasicScreen} from './BasicScreen.js';

class SkyBoxScreen extends BasicScreen {
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
        this.orbitControls.autoRotate = true;
        this.orbitControls.autoRotateSpeed = 1.0;

        const skyBoxGeo = new BoxGeometry(10000, 10000, 10000);
        const skyBoxMat = this.createSkyBoxMaterial('skybox');
        const skyBox = new Mesh(skyBoxGeo, skyBoxMat);
        skyBox.name = 'skyBox';
        this.scene.add(skyBox);

        super.run(gui);
    }
    render() {
        this.orbitControls.update();
        super.render();
    }
    createSkyBoxPathStrings(filename) {
        const basePath = './assets/skybox/';
        const baseFilename = basePath + filename;
        const fileType = '.png';
        const sides = ['front', 'back', 'top', 'bottom', 'right', 'left'];
        const pathStings = sides.map(side => {
            return baseFilename + '-' + side + fileType;
        });
        return pathStings;
    }
    createSkyBoxMaterial(filename) {
        const skyboxImagepaths = this.createSkyBoxPathStrings(filename);
        const materialArray = skyboxImagepaths.map(image => {
            let texture = new TextureLoader().load(image);
            return new MeshBasicMaterial({ map: texture, side: BackSide }); // <---
        });
        return materialArray;
    }
}

export { SkyBoxScreen };
