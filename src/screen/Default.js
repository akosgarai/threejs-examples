import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh} from 'three';
import {BasicScreen} from './BasicScreen.js';

class DefaultScreen extends BasicScreen {
    run() {
        this.scene = new Scene();
        this.camera = new PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.renderer = new WebGLRenderer();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.screenNode.appendChild(this.renderer.domElement);
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new Mesh(geometry, material);
        cube.name = 'cube';
        this.scene.add(cube);

        this.camera.position.z = 5;

        super.run();
    }
    render() {
        this.scene.getObjectByName('cube').rotation.x += 0.01;
        this.scene.getObjectByName('cube').rotation.y += 0.01;

        super.render();
    }
}

export { DefaultScreen };
