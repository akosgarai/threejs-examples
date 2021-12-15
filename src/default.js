import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh} from 'three';

class DefaultScreen {
    constructor(screen) {
        this.screenNode = screen;
    }
    applicationName() {
        return 'Default application';
    }
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
        this.cube = new Mesh(geometry, material);
        this.scene.add(this.cube);

        this.camera.position.z = 5;

        this.animate();
    }
    stop() {
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }
    render() {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;

        this.renderer.render(this.scene, this.camera);
    }
}

export { DefaultScreen };
