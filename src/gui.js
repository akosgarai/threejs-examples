import {Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshNormalMaterial, Mesh} from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import GUI from 'lil-gui';

class GuiScreen {
    constructor(screen) {
        this.screenNode = screen;
        this.control = new function() {
            this.rotationSpeed = 0.005;
            this.scale = 1;
        };
    }
    applicationName() {
        return 'Gui screen';
    }
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
        this.buildStats();

        // GUI
        this.gui = new GUI();
        this.gui.add(this.control, 'rotationSpeed', -0.1, 0.1);
        this.gui.add(this.control, 'scale', 0.01, 2);

        this.animate();
    }
    stop() {
        this.gui.destroy();
    }
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }
    render() {
        this.renderer.render(this.scene, this.camera);
        this.stats.update();
        this.scene.getObjectByName('cube').rotation.x += this.control.rotationSpeed;
        this.scene.getObjectByName('cube').scale.set(this.control.scale, this.control.scale, this.control.scale);
    }
    buildStats() {
        this.stats = new Stats();
        this.stats.setMode(0);
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0';
        this.stats.domElement.style.top = '20px';
        this.screenNode.appendChild(this.stats.domElement);
    }
}

export { GuiScreen };
