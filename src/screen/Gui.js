import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshNormalMaterial, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class GuiScreen extends BasicScreen {
    constructor(name, screen) {
        const control = new function() {
            this.rotationSpeedX = 0.0;
            this.rotationSpeedY = 0.0;
            this.rotationSpeedZ = 0.0;
            this.scale = 1;
        };
        super(name, screen, control);
    }
    run(gui) {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.renderer = new WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 1.0);
        this.screenNode.appendChild(this.renderer.domElement);

        const geometry = new BoxGeometry(10 * Math.random(), 10 * Math.random(), 10 * Math.random());
        const material = new MeshNormalMaterial();
        const cube = new Mesh(geometry, material);
        cube.name = 'cube';
        this.scene.add(cube);

        // position and point the camera to the center of the scene
        this.camera.position.x = 15;
        this.camera.position.y = 16;
        this.camera.position.z = 13;
        this.camera.lookAt(this.scene.position);

        // stats
        this.buildFPSStats();

        // GUI
        gui.add(this.controls, 'rotationSpeedX', -0.1, 0.1);
        gui.add(this.controls, 'rotationSpeedY', -0.1, 0.1);
        gui.add(this.controls, 'rotationSpeedZ', -0.1, 0.1);
        gui.add(this.controls, 'scale', 0.01, 2);

        super.run(gui);
    }
    render() {
        this.scene.getObjectByName('cube').rotation.x += this.controls.rotationSpeedX;
        this.scene.getObjectByName('cube').rotation.y += this.controls.rotationSpeedY;
        this.scene.getObjectByName('cube').rotation.z += this.controls.rotationSpeedZ;
        this.scene.getObjectByName('cube').scale.set(this.controls.scale, this.controls.scale, this.controls.scale);

        super.render();
    }
}

export { GuiScreen };
