import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshNormalMaterial, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class StatsScreen extends BasicScreen {
    run() {
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

        super.run();
    }
    render() {
        this.scene.getObjectByName('cube').rotation.x += 0.01;

        super.render();
    }
}

export { StatsScreen };
