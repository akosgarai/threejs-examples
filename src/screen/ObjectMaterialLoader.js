import {Scene, PerspectiveCamera, WebGLRenderer, DirectionalLight} from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {BasicScreen} from './BasicScreen.js';

class ObjectMaterialLoaderScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.rotationSpeed = 0.0;
            this.scale = 1.0;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        // position and point the camera to the center of the scene
        this.camera.position.x = 15;
        this.camera.position.y = 10;
        this.camera.position.z = 13;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);
        // directional light source from the camera position.
        const dirLight = new DirectionalLight();
        dirLight.position.x = 15;
        dirLight.position.y = 10;
        dirLight.position.z = 13;
        this.scene.add(dirLight);
        // GUI control
        gui.add(this.controls, 'rotationSpeed', -0.1, 0.1);
        gui.add(this.controls, 'scale', 0.01, 2);
        let exampleModel = undefined;
        let mtlLoader = new MTLLoader();
        let objLoader = new OBJLoader();
        let scene = this.scene;
        mtlLoader.load("./assets/model/example.mtl", function(materials) {
            materials.preload();
            var objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load("./assets/model/example.obj", function(object) {
                exampleModel = object;
                exampleModel.name = 'example';
                scene.add( exampleModel );
            });
        });
        super.run(gui);
    }
    render() {
        const object = this.scene.getObjectByName('example');
        if (object) {
            object.rotation.y += this.controls.rotationSpeed;
            object.scale.set(this.controls.scale, this.controls.scale, this.controls.scale);
        }
        super.render();
    }
}

export { ObjectMaterialLoaderScreen };
