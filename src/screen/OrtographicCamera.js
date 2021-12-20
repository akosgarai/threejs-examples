import {Scene, OrthographicCamera, WebGLRenderer, DirectionalLight, BoxGeometry, MeshLambertMaterial, Color, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class OrtographicCameraScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.left = 0;
            this.right = 0;
            this.top = 0;
            this.bottom = 0;
            this.far = 1500;
            this.near = 0.1;
        };
        super(name, screen, control);
    }
    run(gui) {
        // create a scene, that will hold all our elements such as objects, cameras and lights.
        this.scene = new Scene();
        // create a camera, which defines where we're looking at.
        this.camera = new OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.1, 1500);
        // Update the control values
        this.controls.left = this.camera.left;
        this.controls.right = this.camera.right;
        this.controls.top = this.camera.top;
        this.controls.bottom = this.camera.bottom;
        this.controls.far = this.camera.far;
        this.controls.near = this.camera.near;
        // position and point the camera to the center of the scene
        this.camera.position.x = -500;
        this.camera.position.y = 200;
        this.camera.position.z = 300;
        this.camera.lookAt(this.scene.position);
        // create a render, sets the background color and the size
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        // Setup directional light
        const directionalLight = new DirectionalLight();
        directionalLight.position.set(-500, 200, 300);
        this.scene.add(directionalLight);
        // extend gui
        gui.add(this.controls, 'left', -1000, 0).onChange(this.updateCamera.bind(this));
        gui.add(this.controls, 'right', 0, 1000).onChange(this.updateCamera.bind(this));
        gui.add(this.controls, 'top', 0, 1000).onChange(this.updateCamera.bind(this));
        gui.add(this.controls, 'bottom', -1000, 0).onChange(this.updateCamera.bind(this));
        gui.add(this.controls, 'far', 100, 2000).onChange(this.updateCamera.bind(this));
        gui.add(this.controls, 'near', 0, 200).onChange(this.updateCamera.bind(this));

        // add the cubes to the scene
        for (var x = 0; x < 15; x++) {
            for (var y = 0; y < 15; y++) {
                this.addCube(x, y);
            }
        }
        super.run(gui);
    }
    updateCamera() {
        this.camera.left = this.controls.left;
        this.camera.right = this.controls.right;
        this.camera.top = this.controls.top;
        this.camera.bottom = this.controls.bottom;
        this.camera.far = this.controls.far;
        this.camera.near = this.controls.near;
        this.camera.updateProjectionMatrix();
    }
    addCube(x, y) {
        // create a cube and add to scene
        const cubeGeometry = new BoxGeometry(50, 50, 50);
        const cubeMaterial = new MeshLambertMaterial();
        cubeMaterial.color = new Color(0xffffff * Math.random())
        cubeMaterial.transparent = true;
        const cube = new Mesh(cubeGeometry, cubeMaterial);
        cube.position.x = 60 * x - 450;
        cube.position.y = 0;
        cube.position.z = 60 * y - 450;
        this.scene.add(cube);
    }
    render() {
        super.render();
    }
}

export { OrtographicCameraScreen };
